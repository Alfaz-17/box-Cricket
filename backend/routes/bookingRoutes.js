import express from "express";
import {
  checkSlotAvailability,
 
  getMyBookings,
 
  cancelBooking,
  getMyBookingRecipt,
  getOwnersBookings,
  getRecenetBooking,
  

  cashfreeWebhook,
  createPaymentLink,
  
} from "../controllers/bookingController.js";
import { protectedRoute } from "../middleware/auth.js";
import {bookingLimiter} from '../middleware/rateLimiter.js'
const router = express.Router();

router.post('/temporary-booking',protectedRoute,bookingLimiter, createPaymentLink);
router.post("/check-slot", protectedRoute, checkSlotAvailability);
router.post('/cancel/:id', protectedRoute, cancelBooking);
router.get("/report/:id", protectedRoute,getMyBookingRecipt);
router.get("/my-bookings", protectedRoute, getMyBookings);

//payment routes
router.post("/pay", cashfreeWebhook);

//owner route
router.get("/owner-bookings",protectedRoute,getOwnersBookings);
router.get("/owner-recent-bookings",protectedRoute,getRecenetBooking);


//admin rout

export default router;
