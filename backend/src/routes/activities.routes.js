import express from 'express';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { getActivities, syncActivities, getActivityById, getActivityTypes } from '../controllers/activities.controller.js';

const router = express.Router();

router.get('/', isAuthenticated, getActivities);
router.get('/types', isAuthenticated, getActivityTypes);
router.get('/:id', isAuthenticated, getActivityById);
router.post('/sync', isAuthenticated, syncActivities);

export default router;
