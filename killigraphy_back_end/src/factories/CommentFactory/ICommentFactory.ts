// src/factories/ICommentFactory.ts
import { CreateCommentInput, CommentDocument } from "../../types/index";

export interface ICommentFactory {
    create(input: CreateCommentInput): Partial<CommentDocument>;
}
