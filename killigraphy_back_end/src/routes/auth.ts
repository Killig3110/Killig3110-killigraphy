import express from 'express';
import { Response, Request } from 'express';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import crypto from 'crypto';
import User from '../module/Users';
import { requireAuth } from '../middleware/requireAuth';
import Posts from '../module/Posts';
import multer from "multer";
import { uploadToImageKit } from "../utils/uploadToImageKit";
import fs from "fs";
import mongoose from 'mongoose';
import Saves from '../module/Saves';

const router = express.Router();

interface AuthenticatedRequest extends Request {
    userId?: string;
}

// Register
router.post('/register', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
            imageUrl: 'https://ik.imagekit.io/killigraphy/profile-placeholder.svg',
            accountId: crypto.randomUUID(),
        });

        res.status(201).json(user);
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login with cookie
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ message: 'JWT_SECRET missing' });

        const token = await new SignJWT({ id: user._id })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1h')
            .sign(new TextEncoder().encode(secret));

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000, // 1h
        });

        const { password: _, ...userWithoutPassword } = user.toObject();
        res.json({ user: userWithoutPassword });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { password: _, ...userWithoutPassword } = user.toObject();
        res.json(userWithoutPassword);
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });

    res.json({ message: 'Logged out successfully' });
});

export default router;