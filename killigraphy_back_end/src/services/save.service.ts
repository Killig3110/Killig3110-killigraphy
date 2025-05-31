import { saveRepo } from "../repositories/save.repository";

export const saveService = {
    async savePost(userId: string, postId: string) {
        const existing = await saveRepo.findSave(userId, postId);
        if (existing) throw new Error('Already saved');

        return await saveRepo.createSave(userId, postId);
    },

    async unsavePost(userId: string, postId: string) {
        const deleted = await saveRepo.deleteSave(userId, postId);
        if (!deleted) throw new Error('Save not found');
    },

    async getSavedPosts(userId: string) {
        return await saveRepo.getSavedPosts(userId);
    }
};
