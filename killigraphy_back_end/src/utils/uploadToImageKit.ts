import imagekit from "../config/imagekit";
import fs from "fs";

export const uploadToImageKit = async (file: Express.Multer.File) => {
    const fileBuffer = file.buffer;
    if (!fileBuffer) throw new Error("Missing file buffer");

    const uploaded = await imagekit.upload({
        file: fileBuffer,
        fileName: file.originalname,
        folder: "/posts/images",
    });

    return {
        url: uploaded.url,
        fileId: uploaded.fileId,
    };
};
