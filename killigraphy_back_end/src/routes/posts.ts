import express from 'express';
import { Response, Request } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import Posts from '../models/Posts';
import multer from "multer";
import { uploadToImageKit } from "../utils/uploadToImageKit";
import fs from "fs";
import mongoose from 'mongoose';
import imagekit from '../config/imagekit';
import redis from '../config/redis';
import Users from '../models/Users';
import { generatePersonalizedFeed } from '../services/feedService';

const router = express.Router();

interface AuthenticatedRequest extends Request {
    userId?: string;
}

const upload = multer({ dest: "/posts/uploads/" }); // lưu file tạm để đọc buffer

// Create post
router.post('/', requireAuth, upload.single('image'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { caption, location, tags } = req.body;
        const image = req.file;

        if (!image) return res.status(400).json({ message: 'Image required' });

        // Upload lên ImageKit
        const result = await uploadToImageKit(image);

        // Xóa file local sau khi upload
        fs.unlinkSync(image.path);

        const post = await Posts.create({
            creator: req.userId,
            caption,
            location,
            tags: tags?.split(',').map((tag: String) => tag.trim()),
            imageId: result.fileId,
            imageURL: result.url,
        });

        res.status(201).json(post);
    } catch (err) {
        console.error("Create post error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update post
router.patch('/:id', requireAuth, upload.single('image'), async (req: AuthenticatedRequest, res: Response) => {
    const { caption, location, tags } = req.body;
    const image = req.file;

    const post = await Posts.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (image) {
        // Xoá ảnh cũ trên ImageKit nếu có
        if (post.imageId) {
            try {
                await imagekit.deleteFile(post.imageId);
            } catch (err) {
                console.error("Failed to delete old image:", err);
            }
        }

        // Upload ảnh mới lên ImageKit
        const result = await uploadToImageKit(image);

        // Xoá ảnh local sau khi upload
        fs.unlinkSync(image.path);

        post.imageId = result.fileId;
        post.imageURL = result.url;
    }

    // Cập nhật các trường khác
    post.caption = caption || post.caption;
    post.location = location || post.location;
    post.tags = tags ? tags.split(',').map((tag: String) => tag.trim()) : post.tags;

    await post.save();
    res.json(post);
});

// Get posts by user ID
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const posts = await Posts.find({ creator: userId })
            .populate('creator')
            .sort({ createdAt: -1 });

        if (!posts.length) return res.status(404).json({ message: 'No posts found' });

        res.json(posts);
    } catch (err) {
        console.error("Get user posts error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete post
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const post = await Posts.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.imageId) {
        try {
            await imagekit.deleteFile(post.imageId);
        } catch (err) {
            console.error("Failed to delete image on ImageKit:", err);
        }
    }

    await Posts.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
});

router.get("/meta/trend", async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const cached = await redis.get("post:meta");
        let tags: string[] = [];
        let locations: string[] = [];

        if (cached) {
            const parsed = JSON.parse(cached);
            tags = parsed.tags;
            locations = parsed.locations;
        } else {
            const posts = await Posts.find({}, "tags location -_id");

            const tagSet = new Set<string>();
            const locationSet = new Set<string>();

            posts.forEach((post) => {
                post.tags.forEach((tag) => tagSet.add(tag));
                if (post.location) locationSet.add(post.location);
            });

            tags = Array.from(tagSet);
            locations = Array.from(locationSet);

            await redis.setex("post:meta", 300, JSON.stringify({ tags, locations }));
        }

        const paginatedTags = tags.slice(skip, skip + limit);
        const paginatedLocations = locations.slice(skip, skip + limit);

        res.json({
            tags: paginatedTags,
            locations: paginatedLocations,
            hasMore: skip + limit < tags.length || skip + limit < locations.length,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch meta", error: err });
    }
});

router.get('/search', async (req: Request, res: Response) => {
    try {
        const { query, tags, location, sort } = req.query;

        const searchFilter: any = {};

        if (query) {
            searchFilter.caption = { $regex: query, $options: 'i' };
        }

        if (tags) {
            const tagsArray = (tags as string).split(',').map(tag => tag.trim());
            searchFilter.tags = { $in: tagsArray };
        }

        if (location) {
            searchFilter.location = { $regex: location, $options: 'i' };
        }

        let sortOption: { [key: string]: mongoose.SortOrder } = { createdAt: -1 }; // default sort

        if (sort === "popular") {
            sortOption = { likes: -1 }
        }

        const posts = await Posts.find(searchFilter)
            .sort(sortOption)
            .populate("creator");

        res.json(posts);
    } catch (err) {
        console.error("Search posts error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get post by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const post = await Posts.findById(req.params.id).populate('creator');
        if (!post) return res.status(404).json({ message: 'Post not found' });

        res.json(post);
    }
    catch (err) {
        console.error("Get post error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/list', async (req: Request, res: Response) => {
    try {
        const { postIds } = req.body;
        if (!postIds || !Array.isArray(postIds)) {
            return res.status(400).json({ message: 'Invalid post IDs' });
        }

        const posts = await Posts.find({ _id: { $in: postIds } })
            .populate('creator')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (err) {
        console.error("Get list posts error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Like post
router.patch('/:id/like', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const post = await Posts.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = new mongoose.Types.ObjectId(req.userId);
    if (!userId) return res.status(400).json({ message: 'Invalid user ID' });

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyLiked = post.likes.some((id) => id.equals(userId));
    if (alreadyLiked) {
        post.likes = post.likes.filter((id) => id.toString() !== req.userId);
        user.likedPosts = user.likedPosts.filter((id) => id.toString() !== req.params.id);
    } else {
        post.likes.push(userId);
        user.likedPosts.push(post._id);
    }

    await post.save();
    res.json(post);
});

router.get('/feed/personalized', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const redisKey = `feed:${req.userId}`;

        // Try cache
        let posts: any[] = [];
        const cached = await redis.get(redisKey);

        if (cached) {
            posts = JSON.parse(cached);
        } else {
            posts = await generatePersonalizedFeed(req.userId as string);
            await redis.set(redisKey, JSON.stringify(posts), 'EX', 300); // 5 minutes
        }

        const paginated = posts.slice(skip, skip + Number(limit));
        res.status(200).json(paginated);
    } catch (err) {
        console.error('Feed error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get posts with pagination
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 12 } = req.query;

    const posts = await Posts.find()
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .populate('creator');

    res.json(posts);
});

export default router;
