import Saves from '../models/Saves';

export const saveRepo = {
    findSave: async (userId: string, postId: string) =>
        await Saves.findOne({ user: userId, post: postId }),

    createSave: async (userId: string, postId: string) =>
        await Saves.create({ user: userId, post: postId }),

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
