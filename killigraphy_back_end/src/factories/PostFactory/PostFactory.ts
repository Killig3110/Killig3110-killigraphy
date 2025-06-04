// src/factories/PostFactory.ts
import { CreatePostResponse, PostDocument } from '../../types';
import { IPostFactory } from './IPostFactory';
import mongoose from 'mongoose';

export class PostFactory implements IPostFactory {
    create(input: CreatePostResponse): Partial<PostDocument> {
        return {
            creator: new mongoose.Types.ObjectId(input.creator),
            caption: input.caption,
            location: input.location || '',
            tags: input.tags || [],
            imageId: input.imageId || '',
            imageURL: input.imageURL || '',
        };
    }
}
