import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getActivities,
  syncActivities,
  getActivityById,
  getActivityTypes,
  recalculatePaceData,
  syncBestEfforts,
} from "../controllers/activities.controller.js";

const router = express.Router();

router.get("/", authenticate, getActivities);
router.get("/types", authenticate, getActivityTypes);
router.get("/:id", authenticate, getActivityById);
router.post("/sync", authenticate, syncActivities);
router.post("/recalculate-pace", authenticate, recalculatePaceData);
router.post("/sync-best-efforts", authenticate, syncBestEfforts);

export default router;
