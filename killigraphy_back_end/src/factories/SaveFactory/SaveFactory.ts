// src/factories/SaveFactory.ts
import mongoose from "mongoose";
import { CreateSaveInput, SaveDocument } from "../../types";
import { ISaveFactory } from "./ISaveFactory";

export class SaveFactory implements ISaveFactory {
    create(input: CreateSaveInput): Partial<SaveDocument> {
        return {
            user: new mongoose.Types.ObjectId(input.userId),
            post: new mongoose.Types.ObjectId(input.postId),
        };
    }
}