import Booking from '../models/Booking.js';
import CricketBox from '../models/CricketBox.js';
import { encrypt, decrypt, randomStr } from '../lib/sabpaisaEncryption.js';
import { sendMessage } from '../lib/whatsappBot.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Initiate SabPaisa payment for a booking
 * POST /api/payment/initiate
 */
export const initiateSabPaisaPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Find the booking
    const booking = await Booking.findById(bookingId).populate('box');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify booking belongs to user
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if payment is already completed
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    // Generate unique transaction ID
    const clientTxnId = randomStr(20, '12345abcde');
    
    // Update booking with transaction ID
    booking.sabpaisaTxnId = clientTxnId;
    booking.paymentStatus = 'processing';
    await booking.save();

    // Prepare payment parameters
    const payerName = req.user.name || 'Customer';
    const payerEmail = req.user.email || 'customer@cricketbox.com';
    const payerMobile = booking.contactNumber;
    const amount = booking.amountPaid;
    const clientCode = process.env.SABPAISA_CLIENT_CODE;
    const transUserName = process.env.SABPAISA_TRANS_USERNAME;
    const transUserPassword = process.env.SABPAISA_TRANS_PASSWORD;
    const callbackUrl = `${process.env.BACKEND_URL}/api/payment/callback`;
    const channelId = 'W'; // Web channel
    const mcc = process.env.SABPAISA_MCC || '5666';
    
    // Generate transaction date in IST
    const now = new Date();
    const pad = n => n < 10 ? '0' + n : n;
    const transDate = 
      now.getFullYear() + '-' +
      pad(now.getMonth() + 1) + '-' +
      pad(now.getDate()) + ' ' +
      pad(now.getHours()) + ':' +
      pad(now.getMinutes()) + ':' +
      pad(now.getSeconds());

    // Build payment request string (order matters!)
    const stringForRequest =
      'payerName=' + payerName +
      '&payerEmail=' + payerEmail +
      '&payerMobile=' + payerMobile +
      '&clientTxnId=' + clientTxnId +
      '&amount=' + amount +
      '&clientCode=' + clientCode +
      '&transUserName=' + transUserName +
      '&transUserPassword=' + transUserPassword +
      '&callbackUrl=' + callbackUrl +
      '&channelId=' + channelId +
      '&mcc=' + mcc +
      '&transDate=' + transDate;

    console.log('Payment Request String:', stringForRequest);

    // Encrypt the request
    const encryptedStringForRequest = encrypt(stringForRequest);
    console.log('Encrypted Payment Request:', encryptedStringForRequest);

    // Return payment gateway data
    res.status(200).json({
      spURL: process.env.SABPAISA_URL,
      encData: encryptedStringForRequest,
      clientCode: clientCode,
      bookingId: booking._id,
      amount: amount,
    });

  } catch (err) {
    console.error('❌ Payment Initiation Error:', err.message);
    res.status(500).json({ message: 'Payment initiation failed', error: err.message });
  }
};

/**
 * Handle SabPaisa payment callback
 * POST /api/payment/callback
 */
export const handleSabPaisaCallback = async (req, res) => {
  try {
    console.log('📥 Payment Callback Received');
    console.log('Request Method:', req.method);
    console.log('Encoded Request Body:', req.body);
    console.log('Request Query:', req.query);

    // SabPaisa sends the response in 'encResponse' parameter (POST)
    // Sometimes it might come as a query parameter (GET) depending on configuration
    const encData = req.body?.encResponse || req.query?.encResponse;

    if (!encData) {
      console.error('❌ No encResponse found in request');
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=no_response_data`);
    }

    console.log('Encrypted Response found, decrypting...');

    // Decrypt the response
    const decryptedResponse = decrypt(encData);
    console.log('✅ Decrypted Response:', decryptedResponse);

    // Parse the response parameters
    const params = new URLSearchParams(decryptedResponse);
    const clientTxnId = params.get('clientTxnId');
    const sabpaisaPaymentId = params.get('sabpaisaTxnId');
    const status = params.get('status');
    const amount = params.get('amount');
    const statusMessage = params.get('statusMessage');

    console.log('📊 Payment Result:', { clientTxnId, sabpaisaPaymentId, status, amount, statusMessage });

    // Find booking by transaction ID
    const booking = await Booking.findOne({ sabpaisaTxnId: clientTxnId }).populate('box');
    
    if (!booking) {
      console.error('❌ Booking not found for transaction:', clientTxnId);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=booking_not_found&txnId=${clientTxnId}`);
    }

    // Update booking based on payment status
    if (status === 'SUCCESS' || status === 'success') {
      booking.paymentStatus = 'paid';
      booking.sabpaisaPaymentId = sabpaisaPaymentId;
      booking.sabpaisaResponse = decryptedResponse;
      booking.confirmedAt = new Date();
      booking.status = 'confirmed';
      await booking.save();

      console.log('✅ Payment successful for booking:', booking._id);

      // Send WhatsApp confirmation
      try {
        await sendMessage(
          `91${booking.contactNumber}`,
          `✅ Your booking is confirmed!\n\nBox: ${booking.box?.name || 'Cricket Box'}\nDate: ${booking.date}\nTime: ${booking.startTime} - ${booking.endTime}\nAmount: ₹${booking.amountPaid}\n\nThank you for booking with us!`
        );
      } catch (whatsappErr) {
        console.error('WhatsApp notification failed:', whatsappErr.message);
      }

      // Redirect to success page on frontend with query parameter
      return res.redirect(`${process.env.FRONTEND_URL}/payment/success?bookingId=${booking._id}`);

    } else {
      // Payment failed
      booking.paymentStatus = 'failed';
      booking.sabpaisaResponse = decryptedResponse;
      // Don't cancel immediately, maybe they want to retry
      await booking.save();

      console.log('❌ Payment failed for booking:', booking._id, 'Reason:', statusMessage);

      // Redirect to failure page on frontend
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?bookingId=${booking._id}&reason=${encodeURIComponent(statusMessage || 'Payment failed')}`);
    }

  } catch (err) {
    console.error('❌ Error in payment callback handler:', err);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=server_error&message=${encodeURIComponent(err.message)}`);
  }
};

/**
 * Get payment status for a booking
 * GET /api/payment/status/:bookingId
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.status(200).json({
      bookingId: booking._id,
      paymentStatus: booking.paymentStatus,
      amountPaid: booking.amountPaid,
      sabpaisaTxnId: booking.sabpaisaTxnId,
      sabpaisaPaymentId: booking.sabpaisaPaymentId,
    });

  } catch (err) {
    console.error('❌ Error fetching payment status:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};
