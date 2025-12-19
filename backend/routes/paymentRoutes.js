import express from 'express';
import {
  initiateSabPaisaPayment,
  handleSabPaisaCallback,
  getPaymentStatus,
} from '../controllers/paymentController.js';
import { protectedRoute } from '../middleware/auth.js';

const router = express.Router();

// Initiate payment for a booking (protected - requires authentication)
router.post('/initiate', protectedRoute, initiateSabPaisaPayment);

// Handle payment gateway callback (public - called by SabPaisa)
router.post('/callback', handleSabPaisaCallback);

// Get payment status for a booking (protected)
router.get('/status/:bookingId', protectedRoute, getPaymentStatus);

export default router;
