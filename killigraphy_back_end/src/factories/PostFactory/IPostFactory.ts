// src/factories/IPostFactory.ts

import { CreatePostResponse, PostDocument } from "../../types";

export interface IPostFactory {
    create(input: CreatePostResponse): Partial<PostDocument>;
}
