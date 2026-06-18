import Booking from '../models/Booking.js';
import CricketBox from '../models/CricketBox.js';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';

export const getDasboardSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const boxes = await CricketBox.find({ owner: req.user?._id });
    const boxIds = boxes.map((box: any) => box._id);

    const filter = {
      box: { $in: boxIds },
      status: { $in: ['confirmed', 'completed'] },
      $or: [{ paymentStatus: 'paid' }, { isOffline: true }],
    };

    const bookings = await Booking.find(filter);

    const totalBookings = await Booking.countDocuments(filter);
    const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.amountPaid || 0), 0);
    const totalBoxes = boxes.length;

    const userIds = new Set(bookings.map((b: any) => b.user.toString()));
    const totalUsers = userIds.size;

    const bookingChange = 0;
    const revenueChange = 0;
    const boxChange = 0;
    const userChange = 0;

    res.json({
      totalBookings,
      totalRevenue,
      totalBoxes,
      totalUsers,
      bookingChange,
      revenueChange,
      boxChange,
      userChange,
    });
  } catch (error) {
    console.error('Dashboard Summary Error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard summary' });
  }
};
