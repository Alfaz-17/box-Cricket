import express from "express";
import {
  checkSlotAvailability,
 
  getMyBookings,
 
  cancelBooking,
  getMyBookingRecipt,
  getOwnersBookings,
  getRecenetBooking,
  createTestOrder,
  verifyAndCreateBooking,
  
} from "../controllers/bookingController.js";
import { protectedRoute } from "../middleware/auth.js";

const router = express.Router();
router.post('/create-order', protectedRoute, createTestOrder);
router.post('/verify-and-create', protectedRoute, verifyAndCreateBooking);
// router.get("/paymentStatus/:bookingId", protectedRoute, getPaymentStatus);
router.post("/check-slot", protectedRoute, checkSlotAvailability);
router.post('/cancel/:id', protectedRoute, cancelBooking);
router.get("/report/:id", protectedRoute,getMyBookingRecipt);
router.get("/my-bookings", protectedRoute, getMyBookings);


//owner route
router.get("/owner-bookings",protectedRoute,getOwnersBookings);
router.get("/owner-recent-bookings",protectedRoute,getRecenetBooking);


//admin rout

export default router;
