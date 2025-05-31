import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import crypto from 'crypto';
import * as userRepo from '../repositories/user.repository';
import redis from '../config/redis';
import { sendEmail } from '../utils/sendEmail';

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

export const registerUser = async ({ name, username, email, password }: RegisterUserInput) => {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw new Error('Email already exists');

    const hashed = await bcrypt.hash(password, 10);
    return await userRepo.createUser({
        name,
        username,
        email,
        password: hashed,
        accountId: crypto.randomUUID(),
    });
};

export const loginUser = async ({ email, password }: LoginUserInput) => {
    const user = await userRepo.findByEmailWithPassword(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
    }

    const secret = process.env.JWT_SECRET!;
    const token = await new SignJWT({ id: user._id })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(new TextEncoder().encode(secret));

    const { password: _, ...userData } = user.toObject();
    return { user: userData, token };
};

export const getCurrentUser = async (userId: string) => {
    const user = await userRepo.findUserById(userId);
    if (!user) throw new Error('User not found');
    const { password: _, ...data } = user.toObject();
    return data;
};

export const sendOtp = async (email: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(`otp:${email}`, otp, 'EX', 300);
    await sendEmail(email, 'Your OTP Code', `Your code is: ${otp}`);
};

export const verifyOtp = async (email: string, otp: string) => {
    const stored = await redis.get(`otp:${email}`);
    if (!stored || stored !== otp) {
        throw new Error('Invalid or expired OTP');
    }
    await redis.del(`otp:${email}`);
    return { verified: true };
};
