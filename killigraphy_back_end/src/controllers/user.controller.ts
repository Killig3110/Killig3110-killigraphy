import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/index';
import mongoose from 'mongoose';
import { UserService } from '../services/user.service';
import { ImageKitAdapter } from '../utils/adapters/ImageKitAdapter/ImageKitAdapter';
import { RedisAdapter } from '../utils/adapters/RedisAdapter/RedisAdapter';
import { UserUpdateStrategy } from '../strategies/UpdateStrategy/UserUpdateStrategy';
import { imageKitAdapterSingleton } from '../utils/singleton/ImageKitAdapterSingleton';

const userService = new UserService(
    new UserUpdateStrategy(imageKitAdapterSingleton),
    new ImageKitAdapter(),
    new RedisAdapter(),
);

export const getPaginatedUsers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const currentUserId = req.userId!;

        const users = await userService.getPaginatedUsersWithFallback(currentUserId, page, limit);
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching paginated users with fallback:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(404).json({ message: 'User not found' });
    }
};

export const getFollowers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const followers = await userService.getFollowersWithFollowStatus(req.params.id, req.userId!);
        res.status(200).json(followers);
    } catch (err) {
        console.error('Get followers error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getFollowing = async (req: Request, res: Response) => {
    try {
        const following = await userService.getFollowing(req.params.id);
        res.status(200).json(following);
    } catch (err) {
        console.error('Get following error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const checkIsFollowing = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const isFollowing = await userService.checkIsFollowing(req.userId!, req.params.id);
        res.status(200).json({ isFollowing });
    } catch (err) {
        console.error('Check isFollowing error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const toggleFollow = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const result = await userService.toggleFollowUser(req.userId!, req.params.id);
        res.status(200).json(result);
    } catch (error) {
        console.error('Follow/unfollow error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.params.id;
        const { username, name, bio } = req.body;
        const file = req.file;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const updatedUser = await userService.updateUserProfile({
            userId,
            username,
            name,
            bio,
            file: file && file.buffer ? file : undefined,
        });

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error("Update user error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePassword = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.params.id;
        const { oldPassword, newPassword } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const result = await userService.updateUserPassword(userId, oldPassword, newPassword);
        res.status(200).json(result);
    } catch (err: any) {
        console.error("Update password error:", err);
        if (err.message === "User not found" || err.message === "Old password is incorrect") {
            res.status(400).json({ message: err.message });
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
};

export const getSuggestions = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.params.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const suggestions = await userService.getUserSuggestions(userId, page, limit);
        res.status(200).json(suggestions);
    } catch (err) {
        console.error("Error getting suggestions:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};