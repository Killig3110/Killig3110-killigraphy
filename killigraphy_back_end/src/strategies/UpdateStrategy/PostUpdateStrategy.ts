// src/strategies/UpdateStrategy/PostUpdateStrategy.ts
import { IUpdateStrategy } from './IUpdateStrategy';
import { UpdatePostInput } from '../../types';
import * as postRepo from '../../repositories/post.repository';
import { IImageKitAdapter } from '../../utils/adapters/ImageKitAdapter/IImageKitAdapter';

export class PostUpdateStrategy implements IUpdateStrategy<UpdatePostInput, any> {
    constructor(private imageKitAdapter: IImageKitAdapter) { }

    async update({ id, caption, location, tags, image }: UpdatePostInput) {
        const post = await postRepo.findPostById(id);
        if (!post) throw new Error("Post not found");

        // Console log for debugging image upload
        if (image && image.buffer) {
            console.log("Image buffer exists:", Buffer.isBuffer(image.buffer));
        } else {
            console.log("No image buffer provided or invalid format.");
        }

        if (image && image.buffer && Buffer.isBuffer(image.buffer)) {
            if (post.imageId) {
                try {
                    await this.imageKitAdapter.delete(post.imageId);
                } catch (err) {
                    console.error("Failed to delete old image:", err);
                }
            }

            const result = await this.imageKitAdapter.upload(image);

            post.imageId = result.fileId;
            post.imageURL = result.url;
        }

        post.caption = caption ?? post.caption;
        post.location = location ?? post.location;
        post.tags = tags ? tags.split(",").map(tag => tag.trim()) : post.tags;

        return await postRepo.savePost(post);
    }
}
