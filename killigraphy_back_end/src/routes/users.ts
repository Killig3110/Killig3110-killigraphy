import express from 'express';
import { Response, Request } from 'express'
import User from '../models/Users';
import { requireAuth } from '../middleware/requireAuth';
import mongoose from 'mongoose';
import imagekit from '../config/imagekit';
import multer from 'multer';
import fs from 'fs';
import { uploadToImageKit } from '../utils/uploadToImageKit';
import bcrypt from 'bcryptjs';
import redis from '../config/redis';
import Posts from '../models/Posts';

const router = express.Router();

interface AuthenticatedRequest extends Request {
    userId?: string;
}

// GET /users?page=1&limit=10
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const currentUserId = req.userId;

        const zsetKey = `suggestions:zset:${currentUserId}`;
        const totalRedisCount = await redis.zcard(zsetKey);

        // Lấy từ Redis trước
        const redisUsersRaw = await redis.zrevrange(zsetKey, skip, skip + limit - 1);
        const redisUserIds = redisUsersRaw.map((id) => id.toString());

        const redisUsers = await User.find({ _id: { $in: redisUserIds } })
            .select('-password -__v -createdAt -updatedAt');

        const fetchedRedisCount = redisUsers.length;

        // Nếu đã đủ từ Redis thì return luôn
        if (fetchedRedisCount >= limit) {
            return res.status(200).json(redisUsers);
        }

        // Nếu chưa đủ → fallback từ Mongo
        const excludedIds = [...redisUserIds, currentUserId]; // tránh lặp lại user
        const fallbackSkip = Math.max(0, skip - totalRedisCount);
        const fallbackLimit = limit - fetchedRedisCount;

        const mongoUsers = await User.find({ _id: { $nin: excludedIds } })
            .select('-password -__v -createdAt -updatedAt')
            .skip(fallbackSkip)
            .limit(fallbackLimit);

        const combinedUsers = [...redisUsers, ...mongoUsers];

        res.status(200).json(combinedUsers);
    } catch (error) {
        console.error('Error fetching paginated users with suggestions fallback:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /users/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password -__v -createdAt -updatedAt');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (err) {
        console.error("Get user error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /users/:id/followers
router.get('/:id/followers', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const targetUser = await User.findById(req.params.id).populate('followers', '-password -__v');
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        const currentUserId = req.userId;
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) return res.status(404).json({ message: 'Current user not found' });

        const followersWithFollowStatus = (targetUser.followers as any[]).map((follower) => ({
            _id: follower._id,
            name: follower.name,
            username: follower.username,
            imageUrl: follower.imageUrl,
            isFollowing: currentUser.following?.some(
                (id) => id.toString() === follower._id.toString()
            ) ?? false,
        }));

        res.status(200).json(followersWithFollowStatus);
    } catch (err) {
        console.error("Get followers error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /users/:id/following
router.get('/:id/following', async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).populate('following', '-password -__v');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user.following);
    } catch (err) {
        console.error("Get following error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /users/:id/is-following
router.get('/:id/is-following', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const currentUser = await User.findById(req.userId);
        const targetUserId = req.params.id;

        if (!currentUser) return res.status(404).json({ message: 'User not found' });

        const isFollowing = currentUser.following.some(id => id.equals(targetUserId));

        res.status(200).json({ isFollowing });
    } catch (err) {
        console.error("Check isFollowing error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.patch('/:id/follow', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const [targetUser, currentUser] = await Promise.all([
            User.findById(targetUserId),
            User.findById(currentUserId),
        ]);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: "User not found" });
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

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({
            message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
            isFollowing: !isFollowing,
        });
    } catch (error) {
        console.error("Follow error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

const upload = multer({ dest: 'uploads/users/' });

router.patch('/:id', requireAuth, upload.single('image'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.params.id;
        const { username, name, bio } = req.body;
        const file = req.file;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (username) user.username = username;
        if (bio) user.bio = bio;

        if (file) {
            // Xoá ảnh cũ nếu có
            if (user.imageId) {
                try {
                    await imagekit.deleteFile(user.imageId);
                } catch (err) {
                    console.warn("Delete old image failed:", err);
                }
            }

            const uploaded = await uploadToImageKit(file);
            user.imageId = uploaded.fileId;
            user.imageUrl = uploaded.url;

            fs.unlinkSync(file.path); // cleanup local file
        }

        await user.save();
        res.status(200).json(user);
    }
    catch (err) {
        console.error("Update user error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.patch('/:id/password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.params.id;
        const { oldPassword, newPassword } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findById(userId).select("+password");
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error("Update password error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /users/:id/suggestions?page=1&limit=10
// GET /users/:id/suggestions?page=1&limit=10
router.get('/:id/suggestions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.params.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const cacheKey = `suggestions:${userId}:page:${page}`;
        const zsetKey = `suggestions:zset:${userId}`;

        // 1. Check cached page
        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.json(JSON.parse(cached));
        }

        // 2. Nếu chưa có, kiểm tra xem đã có ZSET chưa
        const totalSuggestions = await redis.zcard(zsetKey);
        if (totalSuggestions === 0) {
            // Chưa có → generate suggestions theo mutual + tags
            const currentUser = await User.findById(userId).select('following');
            if (!currentUser) return res.status(404).json({ message: 'User not found' });

            const excludedIds = [userId, ...currentUser.following.map(id => id.toString())];
            const mutualMap = new Map<string, number>();

            const followedUsers = await User.find({ _id: { $in: currentUser.following } }).select('following');
            for (const u of followedUsers) {
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
                p.tags.forEach(tag => {
                    tagCount[tag] = (tagCount[tag] || 0) + 1;
                });
            });

            const allOtherUsers = await User.find({ _id: { $nin: excludedIds } }).select('_id');
            const userIdList = allOtherUsers.map(u => u._id.toString());

            for (const otherUserId of userIdList) {
                const posts = await Posts.find({ author: otherUserId }).select('tags');
                let tagScore = 0;
                posts.forEach(post => {
                    post.tags.forEach(tag => {
                        tagScore += tagCount[tag] || 0;
                    });
                });

                const mutualScore = mutualMap.get(otherUserId) || 0;
                const finalScore = mutualScore * 10 + tagScore;

                if (finalScore > 0) {
                    await redis.zadd(zsetKey, finalScore, otherUserId);
                }
            }

            await redis.expire(zsetKey, 300); // cache ZSET 5 phút
        }

        // 3. Lấy danh sách userId từ ZSET đã tính
        const suggestedIds = await redis.zrevrange(zsetKey, skip, skip + limit - 1);
        const suggestedUsers = await User.find({ _id: { $in: suggestedIds } })
            .select('-password -__v -createdAt -updatedAt');

        // 4. Cache kết quả trang
        await redis.setex(cacheKey, 300, JSON.stringify(suggestedUsers));

        res.json(suggestedUsers);
    } catch (err) {
        console.error("Error getting suggestions:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default router;