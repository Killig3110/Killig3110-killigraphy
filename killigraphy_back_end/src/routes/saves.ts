import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
    savePost,
    unsavePost,
    getSavedPosts,
} from '../controllers/save.controller';

const router = express.Router();

router.post('/', requireAuth, savePost);
router.delete('/:postId', requireAuth, unsavePost);
router.get('/', requireAuth, getSavedPosts);

export default router;
