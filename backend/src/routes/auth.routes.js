import express from 'express';
import {
 
 register,
 login,
 logout,
 refresh,
 verifyEmail,
 resendVerification,
 forgotPassword,
 resetPassword,
 getCurrentUser,
 
 stravaAuth,
 stravaCallback,
 unlinkStrava,
 garminAuth,
 garminCallback,
} from '../controllers/auth.controller.js';
import { authenticateJWT, optionalAuthenticateJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateJWT, getCurrentUser);

router.get('/strava', optionalAuthenticateJWT, stravaAuth);
router.get('/strava/callback', optionalAuthenticateJWT, stravaCallback);
router.post('/strava/unlink', authenticateJWT, unlinkStrava);
router.get('/garmin', garminAuth);
router.get('/garmin/callback', garminCallback);

export default router;
