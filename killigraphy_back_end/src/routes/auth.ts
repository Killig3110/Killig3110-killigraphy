import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as authController from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.getMe);
router.post('/logout', authController.logout);
router.post('/request-otp', authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);

export default router;
