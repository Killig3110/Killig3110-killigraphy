import imagekit from "../config/imagekit";
import fs from "fs";

export const uploadToImageKit = async (file: Express.Multer.File) => {
    const fileBuffer = fs.readFileSync(file.path);

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
