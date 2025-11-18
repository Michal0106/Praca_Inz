import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getActivities,
  syncActivities,
  getActivityById,
  getActivityTypes,
  recalculatePaceData,
} from "../controllers/activities.controller.js";

const router = express.Router();

router.get("/", authenticate, getActivities);
router.get("/types", authenticate, getActivityTypes);
router.get("/:id", authenticate, getActivityById);
router.post("/sync", authenticate, syncActivities);
router.post("/recalculate-pace", authenticate, recalculatePaceData);

export default router;
