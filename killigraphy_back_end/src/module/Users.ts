// src/models/User.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String },
    username: { type: String },
    accountId: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String },
    imageId: { type: String },
    imageUrl: { type: String, required: true },

    // Relationships (tham chiếu bằng ObjectId)
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    liked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    save: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Save' }],
}, {
    timestamps: true
});

export default mongoose.model('User', userSchema);
