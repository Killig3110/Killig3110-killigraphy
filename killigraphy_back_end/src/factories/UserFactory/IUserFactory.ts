// src/factories/IUserFactory.ts
import { RegisterUserInput, UserDocument } from '../../types/index';

export interface IUserFactory {
    create(input: RegisterUserInput): Promise<Partial<UserDocument>>;
}