import express from 'express';
import { Response, Request } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import Posts from '../models/Posts';
import multer from "multer";
import { uploadToImageKit } from "../utils/uploadToImageKit";
import fs from "fs";
import mongoose from 'mongoose';
import imagekit from '../config/imagekit';

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

// Get posts
router.get('/', async (req: Request, res: Response) => {
    const posts = await Posts.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('creator');
    res.json(posts);
});

// Get post by ID
router.get('/:id', async (req: Request, res: Response) => {
    const post = await Posts.findById(req.params.id).populate('creator');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
});

// Get post by User ID
router.get('/user/:userId', async (req: Request, res: Response) => {
    const posts = await Posts.find({ creator: req.params.userId })
        .sort({ createdAt: -1 });
    res.json(posts);
});

// Like post
router.patch('/:id/like', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const post = await Posts.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = new mongoose.Types.ObjectId(req.userId);
    if (!userId) return res.status(400).json({ message: 'Invalid user ID' });

    const alreadyLiked = post.likes.some((id) => id.equals(userId));
    if (alreadyLiked) {
        post.likes = post.likes.filter((id) => id.toString() !== req.userId);
    } else {
        post.likes.push(userId);
    }

    await post.save();
    res.json(post);
});

export default router;
