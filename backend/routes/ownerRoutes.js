// routes/ownerRoutes.js
import express from "express";
import {
  getMyBookings,
  getRecenetBooking,
} from "../controllers/ownerController.js";
import { protectedRoute } from "../middleware/auth.js";
import { isOwner } from "../middleware/role.js";


const router = express.Router();


// Get all bookings for logged-in owner's box
router.get("/bookings",protectedRoute,isOwner ,getMyBookings);
router.get("/recent-bookings",protectedRoute,isOwner ,getRecenetBooking);



export default router;
