// services/userService.ts
import * as userRepo from '../repositories/user.repository';
import { UpdateUserProfileInput } from '../types';
import Users from '../models/Users';
import bcrypt from 'bcryptjs';
import Posts from '../models/Posts';
import { hashPassword } from '../utils/hashPassword';
import { IImageKitAdapter } from '../utils/adapters/ImageKitAdapter/IImageKitAdapter';
import { IRedisAdapter } from '../utils/adapters/RedisAdapter/IRedisAdapter';
import { IUpdateStrategy } from '../strategies/UpdateStrategy/IUpdateStrategy';

export class UserService {
    constructor(
        private updateStrategy: IUpdateStrategy<UpdateUserProfileInput, any>,
        private imageKitAdapter: IImageKitAdapter,
        private redisClient: IRedisAdapter
    ) { }

    async getPaginatedUsersWithFallback(userId: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const zsetKey = `suggestions:zset:${userId}`;

        const totalRedisCount = await this.redisClient.zCard(zsetKey);
        const redisUsersRaw = await this.redisClient.zRevRange(zsetKey, skip, skip + limit - 1);
        const redisUserIds = redisUsersRaw.map(id => id.toString());
        const redisUsers = await userRepo.findUsersByIds(redisUserIds);
        const fetchedRedisCount = redisUsers.length;

        if (fetchedRedisCount >= limit) {
            return redisUsers;
        }

        const excludedIds = [...redisUserIds, userId];
        const fallbackSkip = Math.max(0, skip - totalRedisCount);
        const fallbackLimit = limit - fetchedRedisCount;

        const mongoUsers = await userRepo.findUsersNotIn(excludedIds, fallbackSkip, fallbackLimit);

        return [...redisUsers, ...mongoUsers];
    };

    async getUserById(userId: string) {
        const user = await userRepo.findUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    };

    async getFollowersWithFollowStatus(targetUserId: string, currentUserId: string) {
        const [targetUser, currentUser] = await Promise.all([
            userRepo.findUserByIdWithFollowers(targetUserId),
            userRepo.findUserById(currentUserId),
        ]);

        if (!targetUser) throw new Error('Target user not found');
        if (!currentUser) throw new Error('Current user not found');

        const followersWithFollowStatus = (targetUser.followers as any[]).map((follower) => ({
            _id: follower._id,
            name: follower.name,
            username: follower.username,
            imageUrl: follower.imageUrl,
            isFollowing: currentUser.following?.some(
                (id) => id.toString() === follower._id.toString()
            ) ?? false,
        }));

        return followersWithFollowStatus;
    };

    async getFollowing(userId: string) {
        const user = await userRepo.findUserByIdWithFollowing(userId);
        if (!user) throw new Error('User not found');
        return user.following;
    };

    async checkIsFollowing(currentUserId: string, targetUserId: string) {
        const currentUser = await userRepo.findUserById(currentUserId);
        if (!currentUser) throw new Error('User not found');

        const isFollowing = currentUser.following.some(id => id.equals(targetUserId));
        return isFollowing;
    };

    async toggleFollowUser(currentUserId: string, targetUserId: string) {
        if (currentUserId === targetUserId) {
            throw new Error('You cannot follow yourself');
        }

        const [targetUser, currentUser] = await Promise.all([
            userRepo.findUserById(targetUserId),
            userRepo.findUserById(currentUserId),
        ]);

        if (!targetUser || !currentUser) {
            throw new Error('User not found');
        }

        const isFollowing = currentUser.following.some(id => id.equals(targetUser._id));

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => !id.equals(targetUser._id));
            targetUser.followers = targetUser.followers.filter(id => !id.equals(currentUser._id));
        } else {
            // Follow
            currentUser.following.push(targetUser._id);
            targetUser.followers.push(currentUser._id);
        }

        await Promise.all([
            userRepo.saveUser(currentUser),
            userRepo.saveUser(targetUser)
        ]);

        return {
            message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
            isFollowing: !isFollowing,
        };
    };

    async updateUserProfile(data: UpdateUserProfileInput) {
        return await this.updateStrategy.update(data);
    }

    async updateUserPassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await userRepo.findUserByIdWithPassword(userId);
        if (!user) throw new Error('User not found');

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) throw new Error('Old password is incorrect');

        user.password = await hashPassword(newPassword);
        await userRepo.saveUser(user);

        return { message: 'Password updated successfully' };
    };

    async getUserSuggestions(userId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;
        const cacheKey = `suggestions:${userId}:page:${page}`;
        const zsetKey = `suggestions:zset:${userId}`;

        // Check cached page
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const totalSuggestions = await this.redisClient.zCard(zsetKey);
        if (totalSuggestions === 0) {
            const currentUser = await userRepo.findUserById(userId).select('following');
            if (!currentUser) throw new Error('User not found');

            const excludedIds = [userId, ...currentUser.following.map((id: any) => id.toString())];
            const mutualMap = new Map<string, number>();

            const followedUsers = await userRepo.findUserById(userId).select('following');
            const followeds = await Users.find({ _id: { $in: currentUser.following } }).select('following');

            for (const u of followeds) {
                for (const followee of u.following) {
                    const strId = followee.toString();
                    if (!excludedIds.includes(strId)) {
                        mutualMap.set(strId, (mutualMap.get(strId) || 0) + 1);
                    }
                }
            }

            const userPosts = await Posts.find({ $or: [{ author: userId }, { likes: userId }] }).select('tags');
            const tagCount: Record<string, number> = {};
            userPosts.forEach(p => {
                if (p.tags) {
                    p.tags.forEach(tag => {
                        tagCount[tag] = (tagCount[tag] || 0) + 1;
                    });
                }
            });

            const allOtherUsers = await Users.find({ _id: { $nin: excludedIds } }).select('_id');
            const userIdList = allOtherUsers.map(u => u._id.toString());

            for (const otherUserId of userIdList) {
                const posts = await Posts.find({ author: otherUserId }).select('tags');
                let tagScore = 0;
                posts.forEach(post => {
                    if (post.tags) {
                        post.tags.forEach(tag => {
                            tagScore += tagCount[tag] || 0;
                        });
                    }
                });

                const mutualScore = mutualMap.get(otherUserId) || 0;
                const finalScore = mutualScore * 10 + tagScore;

                if (finalScore > 0) {
                    await this.redisClient.zAdd(zsetKey, finalScore, otherUserId);
                }
            }

            await this.redisClient.expire(zsetKey, 300); // cache ZSET 5 minutes
        }

        const suggestedIds = await this.redisClient.zRevRange(zsetKey, skip, skip + limit - 1);
        const suggestedUsers = await Users.find({ _id: { $in: suggestedIds } }).select('-password -__v -createdAt -updatedAt');

        await this.redisClient.setEx(cacheKey, 300, JSON.stringify(suggestedUsers));

        return suggestedUsers;
    };
}
