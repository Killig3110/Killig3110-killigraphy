// src/factories/SaveFactory/ISaveFactory.ts
import { CreateSaveInput, SaveDocument } from "../../types";

export interface ISaveFactory {
    create(input: CreateSaveInput): Partial<SaveDocument>;
}
