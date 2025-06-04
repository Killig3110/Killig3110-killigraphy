import User from '../models/Users';
import Posts from '../models/Posts';
import RedisClient from '../config/redis';
import { redisAdapterSingleton } from '../utils/singleton/RedisAdapterSingleton';

export const refreshSuggestionsForAllUsers = async () => {
    try {
        const users = await User.find({}, '_id following');

        for (const user of users) {
            const userId = user._id.toString();
            const followingIds = user.following.map(id => id.toString());
            const excludedIds = [userId, ...followingIds];

            const mutualMap = new Map<string, number>();

            const followedUsers = await User.find({ _id: { $in: followingIds } }).select('following');
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
                if (p.tags) {
                    p.tags.forEach(tag => {
                        tagCount[tag] = (tagCount[tag] || 0) + 1;
                    });
                }
            });

            const allOtherUsers = await User.find({ _id: { $nin: excludedIds } }).select('_id');
            const userIdList = allOtherUsers.map(u => u._id.toString());

            const zsetKey = `suggestions:zset:${userId}`;
            await redisAdapterSingleton.del(zsetKey); // clear old suggestions

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
                    await redisAdapterSingleton.zAdd(zsetKey, finalScore, otherUserId);
                }
            }

            await redisAdapterSingleton.expire(zsetKey, 300); // cache ZSET 5 phút
            console.log(`Refreshed suggestions for user: ${userId}`);
        }
    } catch (err) {
        console.error("Error refreshing suggestions:", err);
    }
};
