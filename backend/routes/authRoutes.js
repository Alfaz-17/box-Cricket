// routes/authRoutes.js
import express from "express";
import { signup, login, getMe } from "../controllers/authController.js";
import { protectedRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/me",protectedRoute,getMe)
export default router;
