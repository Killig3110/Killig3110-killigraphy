import express from 'express';
import { Response, Request } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import Saves from '../models/Saves';

const router = express.Router();

interface AuthenticatedRequest extends Request {
    userId?: string;
}

// Save post
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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
router.delete('/:postId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const deleted = await Saves.findOneAndDelete({
        user: req.userId,
        post: req.params.postId,
    });

    if (!deleted) return res.status(404).json({ message: 'Save not found' });

    res.json({ message: 'Unsave success' });
});

// Get saved posts
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const saves = await Saves.find({ user: req.userId }).populate({
        path: 'post',
        populate: { path: 'creator' }
    });

    const posts = saves
        .filter((s) => s.post != null)
        .map((s) => s.post);
    if (!posts || posts.length === 0) {
        return res.status(404).json({ message: 'No saved posts found' });
    }

    res.json(posts);
});

export default router;
