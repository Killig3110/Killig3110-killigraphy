import { Request, Response } from 'express';
import { saveService } from '../services/save.service';
import { AuthenticatedRequest } from '../types/index';

export const savePost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const result = await saveService.savePost(req.userId!, req.body.postId);
        res.status(201).json(result);
    } catch (err: any) {
        if (err.message === 'Already saved') {
            res.status(409).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

export const unsavePost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        await saveService.unsavePost(req.userId!, req.params.postId);
        res.json({ message: 'Unsave success' });
    } catch (err: any) {
        if (err.message === 'Save not found') {
            res.status(404).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

export const getSavedPosts = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const posts = await saveService.getSavedPosts(req.userId!);
        if (!posts.length) {
            return res.status(404).json({ message: 'No saved posts found' });
        }
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
