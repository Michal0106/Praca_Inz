import express from 'express';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { 
  getRecommendedPlan, 
  getPlanTemplates,
  getPlanById,
  getSessionById
} from '../controllers/trainingPlan.controller.js';

const router = express.Router();

router.get('/recommend', isAuthenticated, getRecommendedPlan);
router.get('/templates', isAuthenticated, getPlanTemplates);
router.get('/session/:id', isAuthenticated, getSessionById);
router.get('/:id', isAuthenticated, getPlanById);

export default router;
