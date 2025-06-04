import { Request, Response } from "express";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
    userId?: string;
}

interface RegisterUserInput {
    name: string;
    username: string;
    email: string;
    password: string;
}

interface LoginUserInput {
    email: string;
    password: string;
}

interface UserDocument extends mongoose.Document {
    name: string;
    username: string;
    accountId: string;
    email: string;
    password: string;
    bio?: string;
    imageId?: string;
    imageUrl: string;
    likedPosts: mongoose.Types.ObjectId[];
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

interface UpdateUserProfileInput {
    userId: string;
    username?: string;
    name?: string;
    bio?: string;
    file?: Express.Multer.File;
}

interface PostDocument extends mongoose.Document {
    creator: mongoose.Types.ObjectId;
    caption?: string;
    tags?: string[];
    imageURL: string;
    imageId: string;
    location?: string;
    likes: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

interface CreatePostInput {
    caption: string;
    location?: string;
    tags?: string;
    file: Express.Multer.File;
    userId: string;
}

interface CreatePostResponse {
    creator: string;
    caption: string;
    location?: string;
    tags?: string[];
    imageId: string;
    imageURL: string;
}

interface UpdatePostInput {
    id: string;
    caption?: string;
    location?: string;
    tags?: string;
    image?: Express.Multer.File;
    userId: string;
}

interface LikePostInput {
    postId: string;
    userId: string;
}

interface CommentDocument extends Document {
    content: string;
    post: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    parent?: mongoose.Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

interface CreateCommentInput {
    content: string;
    postId: string;
    userId: string;
    parentId?: string;
}

interface SaveDocument extends Document {
    user: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

interface CreateSaveInput {
    userId: string;
    postId: string;
}

export type {
    AuthenticatedRequest,
    RegisterUserInput,
    LoginUserInput,
    UserDocument,
    UpdateUserProfileInput,
    PostDocument,
    CreatePostInput,
    CreatePostResponse,
    UpdatePostInput,
    LikePostInput,
    CommentDocument,
    CreateCommentInput,
    SaveDocument,
    CreateSaveInput,
};