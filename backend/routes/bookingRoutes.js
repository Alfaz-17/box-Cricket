import express from "express";
import {
  checkSlotAvailability,
  createStripeCheckout,
  stripeWebhook,
  getMyBookings
} from "../controllers/bookingController.js";
import { protectedRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/check-slot", protectedRoute, checkSlotAvailability);
router.post("/create-checkout", protectedRoute, createStripeCheckout);

// ✅ Leave this route as is — raw body is handled in app.js
router.post("/webhook", stripeWebhook);

router.get("/my-bookings", protectedRoute, getMyBookings);

export default router;
