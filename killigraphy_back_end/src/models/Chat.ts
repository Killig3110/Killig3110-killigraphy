// src/models/Chat.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
    isGroup: boolean;
    members: mongoose.Types.ObjectId[];
    lastMessage?: mongoose.Types.ObjectId;
    name?: string;
    avatar?: string;
    admins?: mongoose.Types.ObjectId[];
}

const chatSchema = new Schema<IChat>({
    isGroup: { type: Boolean, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    name: {
        type: String,
        required: function (this: IChat) {
            return this.isGroup;
        }
    },
    avatar: String,
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, {
    timestamps: true,
});

const Chat = mongoose.model<IChat>("Chat", chatSchema);
export default Chat;