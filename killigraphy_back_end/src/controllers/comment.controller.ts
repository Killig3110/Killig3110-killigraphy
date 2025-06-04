import { Request, Response } from "express";
import { AuthenticatedRequest } from '../types/index';
import { CommentService } from "../services/comment.service";
import { CommentFactory } from "../factories/CommentFactory/CommentFactory";

const commentService = new CommentService(new CommentFactory());


export const createComment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { content, postId, parentId } = req.body;
        const userId = req.userId!;

        const comment = await commentService.addComment(content, postId, userId, parentId);
        res.status(201).json(comment);
    } catch (err: any) {
        res.status(500).json({ message: err.message || "Failed to create comment" });
    }
};

export const getComments = async (req: Request, res: Response) => {
    try {
        const comments = await commentService.getPostComments(req.params.postId);
        res.json(comments);
    } catch (err: any) {
        res.status(500).json({ message: err.message || "Failed to fetch comments" });
    }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        await commentService.deleteComment(req.params.id, req.userId!);
        res.json({ message: "Comment deleted" });
    } catch (err: any) {
        if (err.message === "Comment not found") {
            res.status(404).json({ message: err.message });
        } else if (err.message === "Unauthorized") {
            res.status(403).json({ message: err.message });
        } else {
            res.status(500).json({ message: err.message || "Failed to delete comment" });
        }
    }
};
