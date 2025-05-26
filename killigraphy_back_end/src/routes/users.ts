import express from 'express';
import { Response, Request } from 'express'
import User from '../models/Users';
import { requireAuth } from '../middleware/requireAuth';
import mongoose from 'mongoose';
import imagekit from '../config/imagekit';
import multer from 'multer';
import fs from 'fs';
import { uploadToImageKit } from '../utils/uploadToImageKit';
import bcrypt from 'bcryptjs';

const router = express.Router();

interface AuthenticatedRequest extends Request {
    userId?: string;
}

// GET /users?page=1&limit=10
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const currentUserId = req.userId;

        const query = currentUserId ? { _id: { $ne: currentUserId } } : {};

        const users = await User.find(query)
            .select('-password -__v -createdAt -updatedAt')
            .skip(skip)
            .limit(limit);

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching paginated users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /users/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password -__v -createdAt -updatedAt');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (err) {
        console.error("Get user error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /users/:id/followers
router.get('/:id/followers', async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).populate('followers', '-password -__v');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user.followers);
    } catch (err) {
        console.error("Get followers error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /users/:id/following
router.get('/:id/following', async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).populate('following', '-password -__v');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user.following);
    } catch (err) {
        console.error("Get following error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /users/:id/is-following
router.get('/:id/is-following', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const currentUser = await User.findById(req.userId);
        const targetUserId = req.params.id;

        if (!currentUser) return res.status(404).json({ message: 'User not found' });

        const isFollowing = currentUser.following.some(id => id.equals(targetUserId));

        res.status(200).json({ isFollowing });
    } catch (err) {
        console.error("Check isFollowing error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.patch('/:id/follow', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const [targetUser, currentUser] = await Promise.all([
            User.findById(targetUserId),
            User.findById(currentUserId),
        ]);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = currentUser.following.some(id => id.equals(targetUser._id));

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => !id.equals(targetUser._id));
            targetUser.followers = targetUser.followers.filter(id => !id.equals(currentUser._id));
        } else {
            // Follow
            currentUser.following.push(targetUser._id);
            targetUser.followers.push(currentUser._id);
        }

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({
            message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
            isFollowing: !isFollowing,
        });
    } catch (error) {
        console.error("Follow error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

const upload = multer({ dest: 'uploads/users/' });

router.patch('/:id', requireAuth, upload.single('image'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.params.id;
        const { username, name, bio } = req.body;
        const file = req.file;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (username) user.username = username;
        if (bio) user.bio = bio;

        if (file) {
            // Xoá ảnh cũ nếu có
            if (user.imageId) {
                try {
                    await imagekit.deleteFile(user.imageId);
                } catch (err) {
                    console.warn("Delete old image failed:", err);
                }
            }

            const uploaded = await uploadToImageKit(file);
            user.imageId = uploaded.fileId;
            user.imageUrl = uploaded.url;

            fs.unlinkSync(file.path); // cleanup local file
        }

        await user.save();
        res.status(200).json(user);
    }
    catch (err) {
        console.error("Update user error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.patch('/:id/password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.params.id;
        const { oldPassword, newPassword } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findById(userId).select("+password");
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error("Update password error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;