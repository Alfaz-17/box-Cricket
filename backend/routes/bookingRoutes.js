import express from "express";
import {
  checkSlotAvailability,
 
  getPaymentStatus,
  getMyBookings,
  createTempBooking,
  cancelBooking,
  getMyBookingRecipt,
  getOwnersBookings,
  getRecenetBooking,
  
} from "../controllers/bookingController.js";
import { protectedRoute } from "../middleware/auth.js";

const router = express.Router();
router.post('/temp-booking', protectedRoute, createTempBooking);
router.get("/paymentStatus/:bookingId", protectedRoute, getPaymentStatus);
router.post("/check-slot", protectedRoute, checkSlotAvailability);
router.post('/cancel/:id', protectedRoute, cancelBooking);
router.get("/report/:id", protectedRoute,getMyBookingRecipt);
router.get("/my-bookings", protectedRoute, getMyBookings);


//owner route
router.get("/owner-bookings",protectedRoute,getOwnersBookings);
router.get("/owner-recent-bookings",protectedRoute,getRecenetBooking);


//admin rout

export default router;
