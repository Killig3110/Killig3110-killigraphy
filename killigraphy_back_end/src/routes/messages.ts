import express from 'express';
import { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import Message from '../models/Message';
import Chat from '../models/Chat';

const router = express.Router();

interface AuthenticatedRequest extends Request {
    userId?: string;
}

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const chatId = req.params.id;
        const userId = req.userId as string;

        // Check current user is a member of the chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        const isMember = chat.members.some((member: any) => member.toString() === userId.toString());
        if (!isMember) {
            return res.status(403).json({ error: "You are not a member of this chat" });
        }

        // Fetch messages for the chat
        const messages = await Message.find({ chatId })
            .sort({ createdAt: 1 }) // oldest → newest
            .populate("senderId", "username imageUrl"); // populate senderId with username and imageUrl
        res.status(200).json(messages);
    } catch (error) {
        console.error("getMessages error:", (error as Error).message);
        res.status(500).json({ error: "Internal server error" });
    }
})

export default router;
