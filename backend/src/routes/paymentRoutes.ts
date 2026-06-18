import express from 'express';
import {
  initiateCashfreePayment,
  verifyCashfreePayment,
  getPaymentStatus,
  cashfreeWebhook
} from '../controllers/paymentController.js';
import { protectedRoute } from '../middleware/auth.js';

const router = express.Router();

// Initiate payment for a booking (protected - requires authentication)
router.post('/initiate', protectedRoute, initiateCashfreePayment);

// Verify payment gateway status (public or protected)
router.post('/verify', verifyCashfreePayment);

// Get payment status for a booking (protected)
router.get('/status/:bookingId', protectedRoute, getPaymentStatus);

// Webhook for Cashfree to notify payment status updates (must be public)
router.post('/webhook', cashfreeWebhook);

export default router;
