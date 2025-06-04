import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/index';
import { AuthService } from '../services/auth.service';
import { UserFactory } from '../factories/UserFactory/UserFactory';
import RedisClient from '../config/redis';
import { RedisAdapter } from '../utils/adapters/RedisAdapter/RedisAdapter';

const userFactory = new UserFactory();
const redisAdapter = new RedisAdapter();

const authService = new AuthService(userFactory, redisAdapter);

export const register = async (req: Request, res: Response) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { user, token } = await authService.loginUser(req.body);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({ user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await authService.getCurrentUser(req.userId!);
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const logout = (_req: Request, res: Response) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    res.json({ message: 'Logged out successfully' });
};

export const requestOtp = async (req: Request, res: Response) => {
    try {
        await authService.sendOtp(req.body.email);
        res.json({ message: 'OTP sent' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const result = await authService.verifyOtp(req.body.email, req.body.otp);
        res.json(result);
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired OTP' });
    }
};
