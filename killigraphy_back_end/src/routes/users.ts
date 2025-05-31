import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as userController from '../controllers/user.controller';
import { upload } from '../middleware/upload'; // Assuming you have a middleware for file uploads

const router = express.Router();

// GET /users?page=1&limit=10
router.get('/', requireAuth, userController.getPaginatedUsers);

// GET /users/:id
router.get('/:id', userController.getUser);

// GET /users/:id/followers
router.get('/:id/followers', requireAuth, userController.getFollowers);

// GET /users/:id/following
router.get('/:id/following', userController.getFollowing);

// GET /users/:id/is-following
router.get('/:id/is-following', requireAuth, userController.checkIsFollowing);

// PATCH /users/:id/follow
router.patch('/:id/follow', requireAuth, userController.toggleFollow);

// PATCH /users/:id (update profile)
router.patch('/:id', requireAuth, upload.single('image'), userController.updateUser);

// PATCH /users/:id/password (update password)
router.patch('/:id/password', requireAuth, userController.updatePassword);

// GET /users/:id/suggestions
router.get('/:id/suggestions', requireAuth, userController.getSuggestions);

export default router;
