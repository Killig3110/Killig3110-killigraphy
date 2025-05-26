// src/models/User.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
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

export default mongoose.model('User', userSchema,);