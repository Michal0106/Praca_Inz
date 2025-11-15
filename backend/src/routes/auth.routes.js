import express from 'express';
import { stravaAuth, stravaCallback, garminAuth, garminCallback, logout, getCurrentUser } from '../controllers/auth.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/strava', stravaAuth);
router.get('/strava/callback', stravaCallback);
router.get('/garmin', garminAuth);
router.get('/garmin/callback', garminCallback);
router.post('/logout', isAuthenticated, logout);
router.get('/me', isAuthenticated, getCurrentUser);

export default router;
