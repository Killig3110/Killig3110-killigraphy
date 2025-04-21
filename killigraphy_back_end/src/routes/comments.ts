import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Comment from '../models/Comment';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

interface AuthenticatedRequest extends Request {
    userId?: string;
}

interface PopulatedUser {
    _id: string;
    name: string;
    imageUrl: string;
}

interface PopulatedComment {
    _id: string;
    content: string;
    user: PopulatedUser;
    post: string;
    parent?: string;
    createdAt: Date;
    updatedAt: Date;
}

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { content, postId, parentId } = req.body;

        if (!content || !postId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const comment = await Comment.create({
            content,
            post: postId,
            user: req.userId,
            parent: parentId || null,
        });

        const populated = await comment.populate<{ user: PopulatedUser }>('user', 'name imageUrl');
        res.status(201).json(populated as unknown as PopulatedComment);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create comment', error: err });
    }
});

router.get('/:postId', async (req: Request, res: Response) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate<{ user: PopulatedUser }>('user', 'name imageUrl')
            .sort({ createdAt: 1 }); // sắp xếp theo thời gian

        res.json(comments as unknown as PopulatedComment);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get comments', error: err });
    }
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const comment = await Comment.findById(req.params.id).populate({
            path: 'post',
            select: 'creator',
        });

        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const postCreatorId = (comment.post as any).creator;

        if (!postCreatorId.equals(req.userId)) {
            return res.status(403).json({ message: 'You are not allowed to delete this comment' });
        }

        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete comment', error: err });
    }
});

export default router;