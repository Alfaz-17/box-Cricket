import Booking from '../models/Booking.js';
import { sendEmail } from '../lib/emailService.js';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Cashfree, CFEnvironment } from "cashfree-pg";

dotenv.config();

// Initialize Cashfree
const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_CLIENT_ID || '',
  process.env.CASHFREE_CLIENT_SECRET || ''
);

export const initiateCashfreePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;

    const booking: any = await Booking.findById(bookingId).populate('box');
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.userId.toString() !== req.user?._id?.toString()) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    if (booking.paymentStatus === 'paid') {
      res.status(400).json({ message: 'Payment already completed' });
      return;
    }

    const orderId = `ORDER_${bookingId}_${Date.now()}`;
    
    booking.cashfreeOrderId = orderId;
    booking.paymentStatus = 'processing';
    await booking.save();

    const payerName = req.user?.name || 'Customer';
    const payerEmail = req.user?.email || 'customer@cricketbox.com';
    const payerMobile = booking.contactNumber || '9999999999';
    const amount = booking.amountPaid;

    const request = {
      order_amount: Number(amount),
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: req.user?._id?.toString() || 'customer_id',
        customer_phone: payerMobile,
        customer_name: payerName,
        customer_email: payerEmail
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL || process.env.CLIENT_URL_TEST || 'http://localhost:5173'}/payment/verify?order_id={order_id}&bookingId=${booking._id}`,
        notify_url: `${process.env.BACKEND_URL}/api/payment/webhook` // Optional
      }
    };

    cashfree.PGCreateOrder(request).then((response) => {
      const paymentSessionId = response.data.payment_session_id;
      
      booking.cashfreePaymentSessionId = paymentSessionId;
      booking.save();

      res.status(200).json({
        paymentSessionId: paymentSessionId,
        orderId: orderId,
        bookingId: booking._id,
      });
    }).catch((error) => {
      console.error('❌ Cashfree Create Order Error:', error.response?.data || error.message);
      res.status(500).json({ message: 'Failed to create Cashfree order', error: error.message });
    });

  } catch (err: any) {
    console.error('❌ Payment Initiation Error:', err.message);
    res.status(500).json({ message: 'Payment initiation failed', error: err.message });
  }
};

export const verifyCashfreePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, bookingId } = req.body;

    if (!orderId || !bookingId) {
      res.status(400).json({ message: 'Order ID and Booking ID are required' });
      return;
    }

    const booking: any = await Booking.findById(bookingId).populate('box');
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    cashfree.PGOrderFetchPayments(orderId).then(async (response) => {
      const payments = response.data;
      const isPaid = payments && payments.some((payment: any) => payment.payment_status === "SUCCESS");

      if (isPaid) {
        booking.paymentStatus = 'paid';
        booking.confirmedAt = new Date();
        booking.status = 'confirmed';
        await booking.save();

        console.log('✅ Payment successful for booking:', booking._id);

        try {
          if (booking.user?.email) {
            await sendEmail(
              booking.user.email,
              `Booking Confirmed! - ${booking.box?.name || 'Cricket Box'}`,
              `✅ Your booking is confirmed!\n\nBox: ${booking.box?.name || 'Cricket Box'}\nDate: ${booking.date}\nTime: ${booking.startTime} - ${booking.endTime}\nAmount: ₹${booking.amountPaid}\n\nThank you for booking with us!`
            );
          }
        } catch (emailErr: any) {
          console.error('Email notification failed:', emailErr.message);
        }

        res.status(200).json({ success: true, message: 'Payment verified successfully' });
      } else {
        booking.paymentStatus = 'failed';
        await booking.save();
        res.status(400).json({ success: false, message: 'Payment failed or not completed' });
      }
    }).catch((error) => {
      console.error('❌ Cashfree Verify Payment Error:', error.response?.data || error.message);
      res.status(500).json({ message: 'Failed to verify Cashfree payment', error: error.message });
    });

  } catch (err: any) {
    console.error('❌ Error in payment verification handler:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    res.status(200).json({
      bookingId: booking._id,
      paymentStatus: booking.paymentStatus,
      amountPaid: booking.amountPaid,
      cashfreeOrderId: booking.cashfreeOrderId,
      cashfreePaymentSessionId: booking.cashfreePaymentSessionId,
    });

  } catch (err: any) {
    console.error('❌ Error fetching payment status:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
