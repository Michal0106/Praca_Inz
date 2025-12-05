import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getUserStats,
  getLongestActivity,
  getHardestActivity,
  getActivityRecords,
  getAverageMetrics,
  getBestEfforts,
} from "../controllers/data.controller.js";

const router = express.Router();

router.get("/stats", authenticate, getUserStats);
router.get("/longest-activity", authenticate, getLongestActivity);
router.get("/hardest-activity", authenticate, getHardestActivity);
router.get("/records", authenticate, getActivityRecords);
router.get("/averages", authenticate, getAverageMetrics);
router.get("/best-efforts", authenticate, getBestEfforts);

export default router;
