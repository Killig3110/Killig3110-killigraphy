import { Request, Response } from "express";

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export interface UpdateUserProfileInput {
    userId: string;
    username?: string;
    name?: string;
    bio?: string;
    file?: Express.Multer.File;
}