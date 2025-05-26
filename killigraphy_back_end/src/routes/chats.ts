import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/requireAuth";
import Chat from "../models/Chat";

const router = express.Router();

interface AuthenticatedRequest extends Request {
    userId?: string;
}

interface PopulatedUser {
    _id: string;
    name: string;
    username: string;
    imageUrl: string;
}

interface PopulatedChat {
    _id: string;
    isGroup: boolean;
    members: PopulatedUser[];
    lastMessage?: any;
    name?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

// GET /api/chats - Get all chats of the current user
router.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const chats = await Chat.find({
            members: { $in: [req.userId] },
        })
            .populate<{ members: PopulatedUser[] }>("members", "name username imageUrl")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        res.json(chats as unknown as PopulatedChat[]);
    } catch (err) {
        res.status(500).json({ message: "Failed to get chats", error: err });
    }
});

// GET /api/chats/:userId - Get chat between current user and target user
router.get("/:userId", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const currentUserId = req.userId;
        const targetUserId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        let chat = await Chat.findOne({
            isGroup: false,
            members: { $all: [currentUserId, targetUserId] },
        });

        if (!chat) {
            chat = await Chat.create({
                isGroup: false,
                members: [currentUserId, targetUserId],
            });
        }

        const populated = await chat.populate<{ members: PopulatedUser[] }>(
            "members",
            "name username imageUrl"
        );

        res.json(populated as unknown as PopulatedChat);
    } catch (err) {
        res.status(500).json({ message: "Failed to get/create private chat", error: err });
    }
});

export default router;
