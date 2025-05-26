// src/middlewares/autoMarkSeen.ts

import { Request, Response, NextFunction } from "express";
import Message from "../models/Message";
import { MessageStatus } from "../enum/message";

interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const autoMarkSeen = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { chatId } = req.params;
        const userId = req.userId;

        await Message.updateMany(
            {
                chat: chatId,
                receiver: userId,
                status: MessageStatus.UNSEEN,
            },
            {
                $set: {
                    status: MessageStatus.SEEN,
                    seenAt: new Date(),
                },
            }
        );

        req.app.get("io")?.emit("message_seen", { chatId, userId });

        next();
    } catch (err) {
        console.error("Error in autoMarkSeen middleware", err);
        next();
    }
};
