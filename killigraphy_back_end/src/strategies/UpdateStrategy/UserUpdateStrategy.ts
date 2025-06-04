// src/strategies/UpdateStrategy/UserUpdateStrategy.ts
import { IUpdateStrategy } from './IUpdateStrategy';
import { UpdateUserProfileInput } from '../../types';
import * as userRepo from '../../repositories/user.repository';
import { IImageKitAdapter } from '../../utils/adapters/ImageKitAdapter/IImageKitAdapter';

export class UserUpdateStrategy implements IUpdateStrategy<UpdateUserProfileInput, any> {
    constructor(private imageKitAdapter: IImageKitAdapter) { }

    async update({ userId, username, name, bio, file }: UpdateUserProfileInput) {
        const user = await userRepo.findUserById(userId);
        if (!user) throw new Error('User not found');

        if (name) user.name = name;
        if (username) user.username = username;
        if (bio) user.bio = bio;

        if (file?.buffer && Buffer.isBuffer(file.buffer)) {
            if (user.imageId) {
                try {
                    await this.imageKitAdapter.delete(user.imageId);
                } catch (err) {
                    console.warn('Delete old image failed:', err);
                }
            }

            const uploaded = await this.imageKitAdapter.upload(file);
            user.imageId = uploaded.fileId;
            user.imageUrl = uploaded.url;
        }

        await userRepo.saveUser(user);

        return user;
    }
}
