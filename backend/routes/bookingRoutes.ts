import express from 'express'
import {
  getMyBookings,
  cancelBooking,
  getMyBookingRecipt,
  getOwnersBookings,
  getRecenetBooking,
  createTemporaryBooking,
} from '../controllers/bookingController.js'
import { protectedRoute } from '../middleware/auth.js'
import { bookingLimiter } from '../middleware/rateLimiter.js'
const router = express.Router()

router.post('/temporary-booking', protectedRoute, bookingLimiter, createTemporaryBooking)
router.post('/cancel/:id', protectedRoute, cancelBooking)
router.get('/report/:id', getMyBookingRecipt)
router.get('/my-bookings', protectedRoute, getMyBookings)

//payment routes

//owner route
router.get('/owner-bookings', protectedRoute, getOwnersBookings)
router.get('/owner-recent-bookings', protectedRoute, getRecenetBooking)

//admin rout

export default router
