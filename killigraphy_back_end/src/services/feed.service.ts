import Post from '../models/Posts';
import User from '../models/Users';
import Comment from '../models/Comment';

const MIN_FEED_POSTS = 30;

export const getFallbackPosts = async (excludeIds: string[] = []) => {
    return await Post.find({ _id: { $nin: excludeIds } })
        .sort({ createdAt: -1 })
        .limit(MIN_FEED_POSTS)
        .populate('creator', 'name username imageUrl');
};

export const generatePersonalizedFeed = async (userId: string) => {
    const user = await User.findById(userId)
        .select('following likedPosts')
        .populate({ path: 'likedPosts', select: 'tags' });

    if (!user) throw new Error('User not found');

    const likedTags = new Set<string>();
    user.likedPosts?.forEach((post: any) => {
        post.tags?.forEach((tag: string) => likedTags.add(tag));
    });

    // Lấy thêm tags từ các bài đã comment
    const commentTags = await Comment.aggregate([
        { $match: { user: user._id } },
        {
            $lookup: {
                from: 'posts',
                localField: 'post',
                foreignField: '_id',
                as: 'postInfo',
            },
        },
        { $unwind: '$postInfo' },
        { $project: { tags: '$postInfo.tags' } },
    ]);
    commentTags.forEach((c) => {
        c.tags?.forEach((tag: string) => likedTags.add(tag));
    });

    const followingIds = user.following?.map((id) => id.toString()) ?? [];

    // Lấy bài từ người đang follow và bài theo sở thích
    const [fromFollowing, relatedPosts] = await Promise.all([
        Post.find({ creator: { $in: followingIds } })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('creator', 'name username imageUrl'),

        Post.find({
            tags: { $in: Array.from(likedTags) },
            creator: { $nin: [...followingIds, userId] },
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('creator', 'name username imageUrl'),
    ]);

    // Gộp bài viết (loại trùng)
    const mergedMap = new Map<string, any>();
    [...fromFollowing, ...relatedPosts].forEach((post) => {
        mergedMap.set(post._id.toString(), post);
    });

    // Nếu chưa đủ bài thì lấy thêm từ fallback
    if (mergedMap.size < MIN_FEED_POSTS) {
        const existingIds = Array.from(mergedMap.keys());
        const fallbackPosts = await getFallbackPosts(existingIds);
        fallbackPosts.forEach((post) => {
            mergedMap.set(post._id.toString(), post);
        });
    }

    // Tính điểm liên quan và sắp xếp
    const posts = Array.from(mergedMap.values()).map((post: any) => {
        const likeCount = post.likes?.length || 0;
        const hoursPassed = (Date.now() - new Date(post.createdAt).getTime()) / 3600000;
        const relevanceScore = likeCount * 2 - hoursPassed * 0.5;

        return {
            ...post.toObject(),
            relevanceScore,
        };
    });

    posts.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return posts;
};
