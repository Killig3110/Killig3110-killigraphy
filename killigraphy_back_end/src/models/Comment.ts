// models/Comment.ts
import mongoose, { Model } from 'mongoose';
import { CommentDocument } from '../types';

const commentSchema = new mongoose.Schema<CommentDocument>({
    content: { type: String, required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
}, {
    timestamps: true
});

const Comment: Model<CommentDocument> = mongoose.model<CommentDocument>('Comment', commentSchema);
export default Comment;