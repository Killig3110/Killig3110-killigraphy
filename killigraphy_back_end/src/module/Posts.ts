// src/models/Posts.ts
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    caption: { type: String },
    tags: [{ type: String }],
    imageURL: { type: String, required: true },
    imageId: { type: String, required: true },
    location: { type: String },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    save: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
    timestamps: true
});

export default mongoose.model('Post', postSchema);
