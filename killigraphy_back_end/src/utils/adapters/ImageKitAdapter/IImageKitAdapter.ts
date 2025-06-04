export interface IImageKitAdapter {
    upload(file: Express.Multer.File): Promise<{ url: string; fileId: string }>;
    delete(fileId: string): Promise<void>;
}
