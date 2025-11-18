import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getRecommendedPlan,
  getPlanTemplates,
  getPlanById,
  getSessionById,
} from "../controllers/trainingPlan.controller.js";

const router = express.Router();

router.get("/recommend", authenticate, getRecommendedPlan);
router.get("/templates", authenticate, getPlanTemplates);
router.get("/session/:id", authenticate, getSessionById);
router.get("/:id", authenticate, getPlanById);

export default router;
