import imagekit from "../../../config/imagekit";
import { IImageKitAdapter } from "./IImageKitAdapter";

export class ImageKitAdapter implements IImageKitAdapter {
    async upload(file: Express.Multer.File) {
        if (!file.buffer) {
            throw new Error("Missing file buffer");
        }

        const uploaded = await imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: "/posts/images",
        });

        return {
            url: uploaded.url,
            fileId: uploaded.fileId,
        };
    }

    async delete(fileId: string) {
        if (!fileId) {
            throw new Error("Missing file ID");
        }
        await imagekit.deleteFile(fileId);
    }
}
