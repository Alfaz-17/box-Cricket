import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';
import CricketBox from '../models/CricketBox.js';
import Booking from '../models/Booking.js';
import BlockedSlot from '../models/BlockedSlot.js';
import User from '../models/User.js';

export const chatWithGemini = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ success: false, message: 'Message is required.' });
      return;
    }

    // 1. Authenticate user optionally
    let userId = null;
    let userName = 'Guest';
    let userBookings: any[] = [];

    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        const user = await User.findById(decoded.userId).select('-password');
        if (user) {
          userId = user._id;
          userName = user.name;
          // Fetch user's bookings (limit 10 for performance)
          userBookings = await Booking.find({ userId: user._id })
            .populate('box', 'name location')
            .sort({ createdAt: -1 })
            .limit(10);
        }
      } catch (err) {
        // Token invalid, ignore and proceed as guest
      }
    }

    // 2. Fetch all Cricket Boxes details for real-time turf info
    const boxes = await CricketBox.find({});
    const boxesSummary = boxes.map((box: any) => {
      return {
        id: box._id,
        name: box.name,
        description: box.description || '',
        location: box.location,
        address: box.address || '',
        hourlyRate: box.hourlyRate,
        weekendHourlyRate: box.weekendHourlyRate || box.hourlyRate,
        mobileNumber: box.mobileNumber,
        facilities: box.facilities || [],
        features: box.features || [],
        openingHours: box.openingHours || { weekdays: '6:00 AM - 12:00 PM', weekends: '12:00 AM - 12:00 AM(24 houres)' },
        quarters: (box.quarters || []).map((q: any) => ({ name: q.name, id: q._id }))
      };
    });

    // 3. Fetch upcoming booked and blocked slots for the next 14 days
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const bookings = await Booking.find({
      status: { $in: ['confirmed', 'pending', 'completed'] },
      date: { $gte: todayStr }
    }).select('box date startTime endTime duration quarterName status paymentStatus isOffline amountPaid user');

    const blockedSlots = await BlockedSlot.find({
      date: { $gte: todayStr }
    }).select('boxId quarterName date startTime endTime reason');

    const occupiedSlotsSummary = [
      ...bookings.map((b: any) => ({
        type: 'booked',
        bookingType: b.isOffline ? 'offline (walk-in)' : 'online',
        boxId: b.box,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime || '',
        quarterName: b.quarterName,
        status: b.status,
        paymentStatus: b.paymentStatus || (b.isOffline ? 'cash' : 'unknown'),
        bookedBy: b.user || 'Unknown'
      })),
      ...blockedSlots.map((s: any) => ({
        type: 'blocked',
        bookingType: 'admin-blocked',
        boxId: s.boxId,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        quarterName: s.quarterName,
        reason: s.reason || 'Maintenance'
      }))
    ];

    // 4. Construct System Instructions
    const now = new Date();
    // Format a nice human-readable date context
    const currentDateTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const currentDayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' });

    let systemInstruction = `You are "BookMyBox AI Assistant", a smart, friendly, and cricket-loving booking assistant for BookMyBox. 
Your tone should be helpful, concise, and sports-oriented.

Current Date and Time (IST): ${currentDateTimeStr} (Today is ${currentDayOfWeek}). Use this to calculate relative terms like "today", "tomorrow", "next Friday", etc.

AVAILABLE CRICKET BOXES (TURFS):
${JSON.stringify(boxesSummary, null, 2)}

OCCUPIED SLOTS FOR THE NEXT 14 DAYS (Booked/Blocked):
${JSON.stringify(occupiedSlotsSummary, null, 2)}

USER SESSION PROFILE:
- User Status: ${userId ? `Logged in as ${userName} (ID: ${userId})` : 'Guest'}
${
  userId
    ? `- User's Recent Bookings:\n${JSON.stringify(
        userBookings.map((b: any) => ({
          id: b._id,
          boxName: b.box?.name || 'Unknown',
          date: b.date,
          time: b.startTime,
          status: b.status,
          payment: b.paymentStatus,
          bookingType: b.isOffline ? 'Offline (walk-in)' : 'Online'
        })),
        null,
        2
      )}`
    : ''
}

BOOKING TYPES & STATUS GUIDE:
- "bookingType: online" → Customer booked through the website and paid ₹500 advance via UPI/Razorpay.
- "bookingType: offline (walk-in)" → Customer booked via phone call or at the venue. Payment is cash at the venue.
- "bookingType: admin-blocked" → Admin blocked the slot for maintenance, tournament, or private use.
- "status: confirmed" → Booking is confirmed and active.
- "status: pending" → Payment is in progress (10-minute lock). Slot is reserved but not confirmed yet.
- "status: completed" → Booking session is done (past booking).
- "status: cancelled" → Booking was cancelled.
- "paymentStatus: paid" → Online payment completed successfully.
- "paymentStatus: pending" → Awaiting payment confirmation.
- "paymentStatus: cash" → Offline booking, cash payment at venue.

IMPORTANT RULES & FAQ:
1. Online bookings require an advance payment of ₹500 via UPI. The remaining payment must be completed cash/offline at the venue.
2. When a slot is chosen and reserved, a 10-minute payment lock starts. If the payment is not verified within 10 minutes, the booking expires and the slot is released automatically.
3. Cancellations & Refunds: We strictly enforce a "No Refund via Us" policy. BookMyBox does not process refunds directly. If you cancel a booking, you must contact the venue owner directly to arrange an offline refund/adjustment.
4. App availability: A mobile application is currently under development. For now, the web application is fully responsive.
5. Inquiries about booking slots:
   - When a user asks if a turf or box is available for a date/time (e.g. "Which box is free tomorrow at 6 PM?"), check against the "AVAILABLE CRICKET BOXES" and "OCCUPIED SLOTS".
   - A slot with "status: pending" is still considered occupied (payment in progress).
   - Confirm if the request is within opening hours.
   - Look for conflicts with occupied slots for the given date/time range.
   - Clearly state which boxes (and specific quarters) are available and highlight the hourly rate.
   - When listing occupied slots, mention whether the booking is online or offline.
   - Tell them they can book the slots directly on the Home page.
   - If they are a guest and ask about their bookings, suggest they log in first.

Please answer concisely and clearly. If you present lists, use bullet points.`;

    // 5. Initialize Google Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        success: false,
        message: 'Gemini API Key is not configured on the server. Please define GEMINI_API_KEY in the backend .env.'
      });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction
    });

    // 6. Format chat history for the SDK
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Start chat session
    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    res.json({
      success: true,
      reply: responseText
    });
  } catch (error: any) {
    console.error('❌ Error in chatWithGemini:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to communicate with AI Assistant.',
      error: error.message
    });
  }
};
