// src/models/User.ts
import mongoose from 'mongoose';
import { UserDocument } from '../types';

const userSchema = new mongoose.Schema<UserDocument>({
    name: { type: String },
    username: { type: String },
    accountId: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    bio: { type: String },
    imageId: { type: String },
    imageUrl: { type: String, required: true },
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
    timestamps: true
});

const User = mongoose.model<UserDocument>('User', userSchema);
export default User;