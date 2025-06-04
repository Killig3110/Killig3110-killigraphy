// src/models/Posts.ts
import mongoose, { Model } from 'mongoose';
import { PostDocument } from '../types';

const postSchema = new mongoose.Schema<PostDocument>({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    caption: { type: String },
    tags: [{ type: String }],
    imageURL: { type: String, required: true },
    imageId: { type: String, required: true },
    location: { type: String },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
    timestamps: true
});

const Post: Model<PostDocument> = mongoose.model<PostDocument>('Post', postSchema);
export default Post;
