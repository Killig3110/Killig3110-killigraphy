import Saves from '../models/Saves';
import { SaveDocument } from '../types';

export const saveRepo = {
    findSave: async (userId: string, postId: string) =>
        await Saves.findOne({ user: userId, post: postId }),

    createSave: async (save: Partial<SaveDocument>) =>
        await Saves.create(save),

    deleteSave: async (userId: string, postId: string) =>
        await Saves.findOneAndDelete({ user: userId, post: postId }),

    getSavedPosts: async (userId: string) => {
        const saves = await Saves.find({ user: userId }).populate({
            path: 'post',
            populate: { path: 'creator' }
        });

        return saves.filter((s) => s.post != null).map((s) => s.post);
    }
};
