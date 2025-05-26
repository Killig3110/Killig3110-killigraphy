import express from 'express';
import { Response, Request } from 'express';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import crypto from 'crypto';
import User from '../models/Users';
import { requireAuth } from '../middleware/requireAuth';
import { sendEmail } from '../utils/sendEmail';
import redis from '../config/redis';

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

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ message: 'JWT_SECRET missing' });

        const token = await new SignJWT({ id: user._id })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(new TextEncoder().encode(secret));

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

// Request OTP
router.post('/request-otp', async (req: Request, res: Response) => {
    const { email } = req.body;
    console.log('Requesting OTP for:', email);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(`otp:${email}`, otp, 'EX', 300); // TTL 5 phút
    await sendEmail(email, 'Your OTP Code', `Your code is: ${otp}`);

    res.json({ message: 'OTP sent' });
});

// Verify OTP
router.post('/verify-otp', async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const saved = await redis.get(`otp:${email}`);

    if (!saved || saved !== otp) {
        return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    await redis.del(`otp:${email}`);

    return res.json({ verified: true });
});

export default router;