// routes/authRoutes.js
import express from "express";
import {  login, getMe, logout, sendOtp, verifyOtp, completeSignup } from "../controllers/authController.js";
import { protectedRoute } from "../middleware/auth.js";

const router = express.Router();
router.post("/otp", sendOtp);

router.post("/verify-otp", verifyOtp);
router.post("/signup", completeSignup);
router.post("/login", login);
router.post("/me",protectedRoute,getMe)
router.post("/logout",logout);
export default router;
