import express from 'express';
import { Response, Request } from 'express';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import crypto from 'crypto';
import User from '../module/Users';
import { requireAuth } from '../middleware/requireAuth';
import Posts from '../module/Posts';
import multer from "multer";
import { uploadToImageKit } from "../utils/uploadToImageKit";
import fs from "fs";
import mongoose from 'mongoose';
import Saves from '../module/Saves';

const router = express.Router();

interface AuthenticatedRequest extends Request {
    userId?: string;
}

const upload = multer({ dest: "/posts/uploads/" }); // lưu file tạm để đọc buffer

// Create post
router.post('/posts', requireAuth, upload.single('image'), async (req: AuthenticatedRequest, res: Response) => {
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

// Get posts
router.get('/posts', async (req, res) => {
    const posts = await Posts.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('creator', 'username imageUrl');
    res.json(posts);
});

// Get post by ID
router.get('/posts/user/:userId', async (req, res) => {
    const posts = await Posts.find({ creator: req.params.userId })
        .sort({ createdAt: -1 });
    res.json(posts);
});

// Like post
router.patch('/posts/:id/like', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const post = await Posts.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = new mongoose.Types.ObjectId(req.userId);
    if (!userId) return res.status(400).json({ message: 'Invalid user ID' });

    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
        post.likes = post.likes.filter((id) => id.toString() !== req.userId);
    } else {
        post.likes.push(userId);
    }

    await post.save();
    res.json(post);
});

// Save post
router.post('/saves', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { postId } = req.body;

    const existing = await Saves.findOne({
        user: req.userId,
        post: postId,
    });

    if (existing) return res.status(409).json({ message: 'Already saved' });

    const saved = await Saves.create({
        user: req.userId,
        post: postId,
    });

    res.status(201).json(saved);
});

// Unsave post
router.delete('/saves/:postId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const deleted = await Saves.findOneAndDelete({
        user: req.userId,
        post: req.params.postId,
    });

    if (!deleted) return res.status(404).json({ message: 'Save not found' });

    res.json({ message: 'Unsave success' });
});

// Get saved posts
router.get('/saves', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const saves = await Saves.find({ user: req.userId }).populate('post');

    const posts = saves.map((s) => s.post);

    res.json(posts);
});

export default router;
