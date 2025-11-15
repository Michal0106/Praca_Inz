import express from 'express';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { 
  getUserStats, 
  getLongestActivity,
  getHardestActivity,
  getActivityRecords,
  getAverageMetrics
} from '../controllers/data.controller.js';

const router = express.Router();

router.get('/stats', isAuthenticated, getUserStats);
router.get('/longest-activity', isAuthenticated, getLongestActivity);
router.get('/hardest-activity', isAuthenticated, getHardestActivity);
router.get('/records', isAuthenticated, getActivityRecords);
router.get('/averages', isAuthenticated, getAverageMetrics);

export default router;
