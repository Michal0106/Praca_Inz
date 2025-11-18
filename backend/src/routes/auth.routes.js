import express from "express";
import {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  stravaAuth,
  stravaCallback,
  unlinkStrava,
} from "../controllers/auth.controller.js";
import {
  authenticateJWT,
  optionalAuthenticateJWT,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authenticateJWT, getCurrentUser);

router.get("/strava", optionalAuthenticateJWT, stravaAuth);
router.get("/strava/callback", optionalAuthenticateJWT, stravaCallback);
router.post("/strava/unlink", authenticateJWT, unlinkStrava);

export default router;
