// src/models/ChatHistory.ts
import mongoose from "mongoose";
import { ChatAction } from "../enum/chatHistory";

const chatHistorySchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    action: {
        type: String,
        enum: Object.values(ChatAction),
        default: ChatAction.MESSAGE,
        required: true,
    },
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
    message: {
        type: String,
    },
}, {
    timestamps: true,
});

export default mongoose.model("ChatHistory", chatHistorySchema);
