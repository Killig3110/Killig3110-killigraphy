import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';

interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const requireAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        // Lấy token từ cookie 'token'
        const token = req.cookies?.token;
        if (!token) throw new Error('No token');

        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('Missing JWT_SECRET');

        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
        req.userId = payload.id as string;

        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
