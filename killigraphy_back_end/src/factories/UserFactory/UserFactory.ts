// src/factories/UserFactory.ts
import { IUserFactory } from './IUserFactory';
import { RegisterUserInput, UserDocument } from '../../types/index';
import crypto from 'crypto';
import { hashPassword } from '../../utils/hashPassword';

export class UserFactory implements IUserFactory {
    async create(input: RegisterUserInput): Promise<Partial<UserDocument>> {
        const hashedPassword = await hashPassword(input.password);
        return {
            name: input.name,
            username: input.username,
            email: input.email,
            password: hashedPassword,
            imageUrl: 'https://ik.imagekit.io/killigraphy/profile-placeholder.svg',
            accountId: crypto.randomUUID(),
            followers: [],
            following: [],
            likedPosts: [],
        };
    }
}
