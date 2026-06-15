import Booking from '../models/Booking.js';
import CricketBox from '../models/CricketBox.js';
import moment from 'moment';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { parseDateTime } from '../lib/parseDateTime.js';
import BlockedSlot from '../models/BlockedSlot.js';
import { getIO } from '../lib/soket.js';
import { validateSlot } from '../lib/slotValidator.js';

dotenv.config();

export const createTemporaryBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boxId, quarterId, date, startTime, duration, contactNumber } = req.body;
    const now = new Date();
    const start = parseDateTime(date, startTime);

    if (start < now) {
      res.status(400).json({ message: "Start time cannot be in the past" });
      return;
    }

    if (!/^\d{10}$/.test(contactNumber)) {
      res.status(400).json({ message: "Invalid contact number. It must be exactly 10 digits." });
      return;
    }

    const box = await CricketBox.findById(boxId);
    if (!box) {
      res.status(404).json({ message: "Box not found" });
      return;
    }

    const quarter = box.quarters.find((q: any) => q._id.toString() === quarterId);
    if (!quarter) {
      res.status(400).json({ message: "Invalid quarter selected" });
      return;
    }

    const { available, error, start: validatedStart, end: validatedEnd } =
      await validateSlot({ boxId, quarterId, date, startTime, duration });

    if (!available) {
      res.status(400).json({ message: error });
      return;
    }

    const formattedEndTime = moment(validatedEnd).format('hh:mm A');

    const bookingDate = new Date(date);
    const isWeekend = bookingDate.getDay() === 0 || bookingDate.getDay() === 6;

    let hourlyRate = isWeekend && box.weekendHourlyRate ? box.weekendHourlyRate : box.hourlyRate;
    let pricingArray = isWeekend && box.weekendCustomPricing?.length > 0 
      ? box.weekendCustomPricing 
      : box.customPricing;

    const customPriceEntry = pricingArray.find((p: any) => p.duration === Number(duration));
    const calculatedAmount = customPriceEntry ? customPriceEntry.price : hourlyRate * Number(duration);

    const isOwner = req.user?.role === 'owner' && box.owner?.toString() === req.user?._id.toString();

    const booking = new Booking({
      user: req.user?.name,
      userId: req.user?._id,
      box: boxId,
      quarter: quarterId,
      quarterName: quarter.name,
      date,
      startTime,
      endTime: formattedEndTime,
      startDateTime: validatedStart,
      endDateTime: validatedEnd,
      duration,
      amountPaid: 1, 
      contactNumber,
      paymentStatus: isOwner ? "paid" : "pending",
      status: isOwner ? "confirmed" : "pending",
      isOffline: isOwner,
      method: isOwner ? "offline" : "sabpaisa",
      bookedBy: req.user?._id,
      confirmedAt: isOwner ? new Date() : undefined,
    });

    await booking.save();

    const io = getIO();
    io.to(`box-${boxId}`).emit("new-booking", {
      bookingId: booking._id,
      boxId,
      quarterId,
      quarterName: quarter.name,
      date,
      startTime,
      endTime: formattedEndTime,
      duration,
      startDateTime: validatedStart,
      endDateTime: validatedEnd,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      isOffline: booking.isOffline,
      bookedBy: req.user?._id,
      bookedByName: req.user?.name,
    });

    res.status(200).json({
      success: true,
      message: isOwner ? "Booking confirmed (Offline)" : "Booking created. Please complete payment.",
      bookingId: booking._id,
      amount: booking.amountPaid,
      date,
      startTime,
      endTime: formattedEndTime,
      duration,
      boxName: box.name,
      quarterName: quarter.name,
      isOffline: isOwner,
    });
  } catch (err: any) {
    console.error("Temporary Booking Error:", err.message);
    res.status(500).json({ message: "Temporary booking failed" });
  }
};

export const getAvailableBoxes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, startTime, duration } = req.body;
    if (!date || !startTime || !duration) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const now = new Date();
    const start = parseDateTime(date, startTime);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

    if (start < now) {
      res.status(400).json({ message: 'Start time cannot be in the past' });
      return;
    }

    const allBoxes = await CricketBox.find();
    const availableBoxes = [];

    for (const box of allBoxes) {
      const availableQuarters = [];

      for (const quarter of box.quarters) {
        const blockedSlots = await BlockedSlot.find({
          boxId: box._id,
          quarterId: quarter._id,
        });

        const isBlocked = blockedSlots.some((slot: any) => {
          const blockStart = parseDateTime(slot.date, slot.startTime);
          const blockEnd = parseDateTime(slot.date, slot.endTime);

          if (blockEnd <= blockStart) {
            blockEnd.setDate(blockEnd.getDate() + 1);
          }

          return blockStart < end && blockEnd > start;
        });

        if (isBlocked) continue;

        const overlappingBookings = await Booking.find({
          box: box._id,
          quarter: quarter._id,
          startDateTime: { $lt: end },
          endDateTime: { $gt: start },
          status: 'confirmed',
          $or: [{ paymentStatus: 'paid' }, { isOffline: true }],
        });

        if (overlappingBookings.length > 0) continue;

        availableQuarters.push({
          quarterId: quarter._id,
          name: (quarter as any).name,
        });
      }

      if (availableQuarters.length > 0) {
        availableBoxes.push(box);
      }
    }

    const response = availableBoxes.map((box: any) => ({
      _id: box._id,
      name: box.name,
      location: box.location,
      image: box.image,
      mobileNumber: box.mobileNumber,
      quarters: box.quarters,
    }));

    res.json(response);
  } catch (err: any) {
    console.error('❌ Error in general availability:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const getMyBookingRecipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId).populate('box');

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    res.json(booking);
  } catch (err: any) {
    console.error('❌ Error fetching booking receipt:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  const filter = {
    userId: req.user?._id,
    status: { $in: ['confirmed', 'completed'] },
    $or: [{ paymentStatus: 'paid' }, { isOffline: true }],
  };

  const bookings = await Booking.find(filter).populate('box');

  const now = new Date();
  
  const updates = bookings.map(async (booking: any) => {
    if (booking.endDateTime < now && booking.status !== 'completed') {
      booking.status = 'completed';
      await booking.save();
    }
  });

  await Promise.all(updates);

  const updatedBookings = await Booking.find(filter).populate('box');
  res.json(updatedBookings);
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;
    const { ownerCode } = req.body;
    
    const code = process.env.OWNER_CODE;
    if (!ownerCode || ownerCode !== code) {
      res.status(403).json({ message: 'Invalid or missing owner code' });
      return;
    }

    const booking: any = await Booking.findById(bookingId).populate('box');

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.box.owner.toString() !== req.user?._id?.toString()) {
      res.status(403).json({ message: 'Unauthorized. Only the box owner can cancel bookings.' });
      return;
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    res.status(200).json({ 
      message: 'Booking cancelled successfully. Slot is now available.', 
      booking 
    });
  } catch (err: any) {
    console.error('❌ Error cancelling booking:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRecenetBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const box = await CricketBox.findOne({ owner: req.user?._id });
    if (!box) {
      res.status(404).json({ message: 'No box found' });
      return;
    }

    const recentBookings = await Booking.find({
      box: box._id,
      status: { $in: ['confirmed', 'completed'] },
      $or: [{ paymentStatus: 'paid' }, { isOffline: true }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user box');

    res.json(recentBookings);
  } catch (error) {
    console.log('error in recentBooking Controller', error);
    res.status(500).json({ message: 'Failed to get Booking' });
  }
};

export const getOwnersBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const box = await CricketBox.findOne({ owner: req.user?._id });
    if (!box) {
      res.status(404).json({ message: 'No box found' });
      return;
    }

    const ownerBookings = await Booking.find({
      box: box._id,
      status: { $in: ['confirmed', 'completed'] },
      $or: [{ paymentStatus: 'paid' }, { isOffline: true }],
    })
      .sort({ createdAt: -1 })
      .populate('user box');

    res.json(ownerBookings);
  } catch (error) {
    console.log('error in getOwnersBookings Controller', error);
    res.status(500).json({ message: 'Failed to get Booking' });
  }
};
