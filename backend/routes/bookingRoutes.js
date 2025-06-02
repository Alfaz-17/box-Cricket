import express from "express";
import {
  checkSlotAvailability,
  createStripeCheckout,
  stripeWebhook,
  getPaymentStatus,
  getMyBookings,
  createTempBooking,
  cancelBooking,
  getMyBookingRecipt
} from "../controllers/bookingController.js";
import { isOwner, protectedRoute } from "../middleware/auth.js";

const router = express.Router();
router.post('/temp-booking', protectedRoute, createTempBooking);
router.get("/paymentStatus/:bookingId", protectedRoute, getPaymentStatus);
router.post("/check-slot", protectedRoute, checkSlotAvailability);
router.post("/create-checkout", protectedRoute, createStripeCheckout);
router.post('/cancel/:id', protectedRoute, cancelBooking);
router.get("/report/:id", protectedRoute,getMyBookingRecipt);


// ✅ Leave this route as is — raw body is handled in app.js
router.post("/webhook", stripeWebhook);
router.get("/my-bookings", protectedRoute, getMyBookings);

export default router;
