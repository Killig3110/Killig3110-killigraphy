// src/factories/CommentFactory.ts
import { ICommentFactory } from './ICommentFactory';
import { CreateCommentInput, CommentDocument } from '../../types/index';
import mongoose from 'mongoose';

export class CommentFactory implements ICommentFactory {
    create(input: CreateCommentInput): Partial<CommentDocument> {
        return {
            content: input.content,
            post: new mongoose.Types.ObjectId(input.postId),
            user: new mongoose.Types.ObjectId(input.userId),
            parent: input.parentId ? new mongoose.Types.ObjectId(input.parentId) : null,
        };
    }
}
