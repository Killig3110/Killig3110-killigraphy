// src/services/SaveService.ts
import { ISaveFactory } from "../factories/SaveFactory/ISaveFactory";
import { saveRepo } from "../repositories/save.repository";

export class SaveService {
    constructor(private saveFactory: ISaveFactory) { }

    async savePost(userId: string, postId: string) {
        const existing = await saveRepo.findSave(userId, postId);
        if (existing) throw new Error('Already saved');

        const saveData = this.saveFactory.create({ userId, postId });
        const savedPost = await saveRepo.createSave(saveData);
        if (!savedPost) throw new Error('Failed to save post');

        return savedPost;
    }

    async unsavePost(userId: string, postId: string) {
        const deleted = await saveRepo.deleteSave(userId, postId);
        if (!deleted) throw new Error('Save not found');
    }

    async getSavedPosts(userId: string) {
        return await saveRepo.getSavedPosts(userId);
    }
}
