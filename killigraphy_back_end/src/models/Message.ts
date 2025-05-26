// src/models/Message.ts
import mongoose from "mongoose";
import { MessageStatus, MessageType } from "../enum/message";

const messageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    // Reply
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
    replyToMessage: String,
    replyToSender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    replyToReceiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    replyToType: {
        type: String,
        enum: Object.values(MessageType),
    },
    replyToStatus: {
        type: String,
        enum: Object.values(MessageStatus),
    },

    // Main message data
    type: {
        type: String,
        enum: Object.values(MessageType),
        default: MessageType.TEXT,
    },
    status: {
        type: String,
        enum: Object.values(MessageStatus),
        default: MessageStatus.UNSEEN,
    },
    content: {
        type: String, // text content or file URL (for image/voice)
        required: true,
    },
    imageId: String, // if type = image
    voiceId: String, // if type = voice

    // Timestamps for status
    seenAt: Date,
    discardedAt: Date,
    deletedAt: Date, // optional: if user deletes message for self
}, {
    timestamps: true,
});

export default mongoose.model("Message", messageSchema);
