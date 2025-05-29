// routes/authRoutes.js
import express from "express";
import { signup, login, getMe, logout, sendOtp } from "../controllers/authController.js";
import { protectedRoute } from "../middleware/auth.js";

const router = express.Router();
router.post("/otp", sendOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/me",protectedRoute,getMe)
router.post("/logout",logout);
export default router;
