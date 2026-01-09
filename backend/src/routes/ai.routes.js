import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { chatWithAI } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/chat", authenticate, chatWithAI);

export default router;
