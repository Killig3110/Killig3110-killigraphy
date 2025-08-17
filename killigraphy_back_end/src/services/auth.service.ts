// src/services/AuthService.ts
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import * as userRepo from '../repositories/user.repository';
import { sendEmail } from '../utils/sendEmail';
import { RegisterUserInput, LoginUserInput } from '../types/index';
import { IUserFactory } from '../factories/UserFactory/IUserFactory';
import { IRedisAdapter } from '../utils/adapters/RedisAdapter/IRedisAdapter';

export class AuthService {
    constructor(
        private userFactory: IUserFactory,
        private redisClient: IRedisAdapter
    ) { }

    async registerUser({ name, username, email, password }: RegisterUserInput) {
        const existing = await userRepo.findByEmail(email);
        if (existing) throw new Error('Email already exists');
        const userData = await this.userFactory.create({ name, username, email, password });
        return await userRepo.createUser(userData);
    }

    async loginUser({ email, password }: LoginUserInput) {
        const user = await userRepo.findByEmailWithPassword(email);
        if (!user) throw new Error('User not found');
        if (!(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials');
        }

        const secret = process.env.JWT_SECRET!;
        const token = await new SignJWT({ id: user._id })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(new TextEncoder().encode(secret));

        const { password: _, ...userData } = user.toObject();
        return { user: userData, token };
    }

    async getCurrentUser(userId: string) {
        const user = await userRepo.findUserById(userId);
        if (!user) throw new Error('User not found');
        const { password: _, ...data } = user.toObject();
        return data;
    }

    async sendOtp(email: string) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await this.redisClient.setEx(`otp:${email}`, 300, otp);
        await sendEmail(email, 'Your OTP Code', `Your code is: ${otp}`);
    }

    async verifyOtp(email: string, otp: string) {
        const stored = await this.redisClient.get(`otp:${email}`);
        if (!stored || stored !== otp) {
            throw new Error('Invalid or expired OTP');
        }
        await this.redisClient.del(`otp:${email}`);
        return { verified: true };
    }
}
