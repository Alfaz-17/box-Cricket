import Booking from '../models/Booking.js';
import CricketBox from '../models/CricketBox.js';
import { encrypt, decrypt, randomStr } from '../lib/sabpaisaEncryption.js';
import { sendEmail } from '../lib/emailService.js';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';

dotenv.config();

export const initiateSabPaisaPayment = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const clientTxnId = randomStr(20, '12345abcde');
    
    booking.sabpaisaTxnId = clientTxnId;
    booking.paymentStatus = 'processing';
    await booking.save();

    const payerName = req.user?.name || 'Customer';
    const payerEmail = req.user?.email || 'customer@cricketbox.com';
    const payerMobile = booking.contactNumber;
    const amount = booking.amountPaid;
    const clientCode = process.env.SABPAISA_CLIENT_CODE;
    const transUserName = process.env.SABPAISA_TRANS_USERNAME;
    const transUserPassword = process.env.SABPAISA_TRANS_PASSWORD;
    const callbackUrl = `${process.env.BACKEND_URL}/api/payment/callback`;
    const channelId = 'W'; 
    const mcc = process.env.SABPAISA_MCC || '5666';
    
    const now = new Date();
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const transDate = 
      now.getFullYear() + '-' +
      pad(now.getMonth() + 1) + '-' +
      pad(now.getDate()) + ' ' +
      pad(now.getHours()) + ':' +
      pad(now.getMinutes()) + ':' +
      pad(now.getSeconds());

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

    const encryptedStringForRequest = encrypt(stringForRequest);
    console.log('Encrypted Payment Request:', encryptedStringForRequest);

    res.status(200).json({
      spURL: process.env.SABPAISA_URL,
      encData: encryptedStringForRequest,
      clientCode: clientCode,
      bookingId: booking._id,
      amount: amount,
    });

  } catch (err: any) {
    console.error('❌ Payment Initiation Error:', err.message);
    res.status(500).json({ message: 'Payment initiation failed', error: err.message });
  }
};

export const handleSabPaisaCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📥 Payment Callback Received');
    console.log('Request Method:', req.method);
    console.log('Encoded Request Body:', req.body);
    console.log('Request Query:', req.query);

    const encData = req.body?.encResponse || req.query?.encResponse;

    if (!encData) {
      console.error('❌ No encResponse found in request');
      res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=no_response_data`);
      return;
    }

    console.log('Encrypted Response found, decrypting...');

    const decryptedResponse = decrypt(encData as string);
    console.log('✅ Decrypted Response:', decryptedResponse);

    const params = new URLSearchParams(decryptedResponse);
    const clientTxnId = params.get('clientTxnId');
    const sabpaisaPaymentId = params.get('sabpaisaTxnId');
    const status = params.get('status');
    const amount = params.get('amount');
    const statusMessage = params.get('statusMessage');

    console.log('📊 Payment Result:', { clientTxnId, sabpaisaPaymentId, status, amount, statusMessage });

    const booking: any = await Booking.findOne({ sabpaisaTxnId: clientTxnId }).populate('box');
    
    if (!booking) {
      console.error('❌ Booking not found for transaction:', clientTxnId);
      res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=booking_not_found&txnId=${clientTxnId}`);
      return;
    }

    if (status === 'SUCCESS' || status === 'success') {
      booking.paymentStatus = 'paid';
      booking.sabpaisaPaymentId = sabpaisaPaymentId;
      booking.sabpaisaResponse = decryptedResponse;
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

      res.redirect(`${process.env.FRONTEND_URL}/payment/success?bookingId=${booking._id}`);
      return;

    } else {
      booking.paymentStatus = 'failed';
      booking.sabpaisaResponse = decryptedResponse;
      await booking.save();

      console.log('❌ Payment failed for booking:', booking._id, 'Reason:', statusMessage);

      res.redirect(`${process.env.FRONTEND_URL}/payment/failure?bookingId=${booking._id}&reason=${encodeURIComponent(statusMessage || 'Payment failed')}`);
      return;
    }

  } catch (err: any) {
    console.error('❌ Error in payment callback handler:', err);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failure?error=server_error&message=${encodeURIComponent(err.message)}`);
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
      sabpaisaTxnId: booking.sabpaisaTxnId,
      sabpaisaPaymentId: booking.sabpaisaPaymentId,
    });

  } catch (err: any) {
    console.error('❌ Error fetching payment status:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
