import express from 'express';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { 
  getActivityDistribution, 
  getWeeklyStats, 
  getMonthlyTrends,
  getIntensityDistribution,
  getProgressOverTime
} from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/distribution', isAuthenticated, getActivityDistribution);
router.get('/weekly-stats', isAuthenticated, getWeeklyStats);
router.get('/monthly-trends', isAuthenticated, getMonthlyTrends);
router.get('/intensity-distribution', isAuthenticated, getIntensityDistribution);
router.get('/progress', isAuthenticated, getProgressOverTime);

export default router;
