// src/models/Saves.ts
import mongoose, { Model } from 'mongoose';
import { SaveDocument } from '../types';

const saveSchema = new mongoose.Schema<SaveDocument>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
}, {
    timestamps: true
});

const Save: Model<SaveDocument> = mongoose.model<SaveDocument>('Save', saveSchema);
export default Save;
