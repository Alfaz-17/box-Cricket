import BlockedSlot from '../models/BlockedSlot.js';
import CricketBox from '../models/CricketBox.js';
import { parseDateTime } from '../lib/parseDateTime.js';
import Booking from '../models/Booking.js';
import { getIO } from '../lib/socket.js';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';

export const blockTimeSlot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, startTime, endTime, reason, quarterName } = req.body;

    const box = await CricketBox.findOne({ owner: req.user?._id });
    if (!box) {
      res.status(404).json({ message: "No box found. Please create a box." });
      return;
    }

    const quarter = box.quarters.find((q: any) => q.name === quarterName);
    if (!quarter) {
      res.status(404).json({ message: `Quarter "${quarterName}" not found in this box.` });
      return;
    }
    const quarterId = (quarter as any)._id;

    const startDateTime = parseDateTime(date, startTime);
    let endDateTime = parseDateTime(date, endTime);

    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    const now = new Date();

    if (startDateTime < now) {
      res.status(400).json({ message: "Start time cannot be in the past." });
      return;
    }

    const overlappingBooking = await Booking.findOne({
      box: box._id,
      quarter: quarterId,
      status: "confirmed",
      $or: [{ paymentStatus: 'paid' }, { isOffline: true }],
      startDateTime: { $lt: endDateTime },
      endDateTime: { $gt: startDateTime }
    });

    if (overlappingBooking) {
      res.status(409).json({
        message: `Cannot block — "${quarterName}" has a confirmed booking in this time range.`
      });
      return;
    }

    const existingBlockedSlots = await BlockedSlot.find({ boxId: box._id, quarterId });

    const isOverlappingBlock = existingBlockedSlots.some((slot: any) => {
      const bStart = parseDateTime(slot.date, slot.startTime);
      let bEnd = parseDateTime(slot.date, slot.endTime);

      if (bEnd <= bStart) {
        bEnd.setDate(bEnd.getDate() + 1);
      }

      return bStart < endDateTime && bEnd > startDateTime;
    });

    if (isOverlappingBlock) {
      res.status(409).json({
        message: `This time slot in "${quarterName}" is already blocked.`
      });
      return;
    }

    await BlockedSlot.create({
      boxId: box._id,
      quarterId,
      quarterName,
      date,
      startTime,
      endTime,
      reason
    });

    const io = getIO();
    if (io) {
      io.to(`box-${box._id}`).emit("slot-blocked", {
        boxId: box._id,
        quarterId,
        quarterName,
        date,
        startTime,
        endTime,
        startDateTime: startDateTime,
        endDateTime: endDateTime
      });
    }

    res.json({
      message: `Time slot blocked successfully in "${quarterName}".`
    });

  } catch (error) {
    console.log("❌ Error in blockTimeSlot controller:", error);
    res.status(500).json({ message: "Failed to block time slot" });
  }
};

export const getBlockedAndBookedSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const box = await CricketBox.findById(id);
    if (!box) {
      res.status(404).json({ message: 'Cricket box not found' });
      return;
    }

    const now = new Date();

    const bookings = await Booking.find({ 
      box: id,
      status: 'confirmed',
      $or: [
        { paymentStatus: 'paid' },
        { isOffline: true }
      ]
    }).select('date startTime endTime duration quarter quarterName startDateTime endDateTime status paymentStatus isOffline');
    
    const upcomingBookedSlots = bookings.filter((b: any) => new Date(b.endDateTime) > now);

    const allBlockedSlots = await BlockedSlot.find({ boxId: id });
    const upcomingBlockedSlots = allBlockedSlots.map((slot: any) => {
        const startDateTime = parseDateTime(slot.date, slot.startTime);
        let endDateTime = parseDateTime(slot.date, slot.endTime);
        
        if (endDateTime <= startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
        }
        
        return {
            ...slot.toObject(),
            startDateTime,
            endDateTime
        };
    }).filter((b: any) => b.endDateTime > now);

    const bookedMap: any = {};
    upcomingBookedSlots.forEach((b: any) => {
      if (!bookedMap[b.quarterName]) {
        bookedMap[b.quarterName] = [];
      }
      bookedMap[b.quarterName].push(b);
    });

    const blockedMap: any = {};
    upcomingBlockedSlots.forEach((b: any) => {
      if (!blockedMap[b.quarterName]) {
        blockedMap[b.quarterName] = [];
      }
      blockedMap[b.quarterName].push(b);
    });

    const bookedSlotsResponse = Object.keys(bookedMap).map(quarterName => ({
      quarterName,
      quarterId: bookedMap[quarterName][0].quarter,
      slots: bookedMap[quarterName],
    }));

    const blockedSlotsResponse = Object.keys(blockedMap).map(quarterName => ({
      quarterName,
      quarterId: blockedMap[quarterName][0].quarterId,
      slots: blockedMap[quarterName],
    }));

    res.json({
      bookedSlots: bookedSlotsResponse,
      blockedSlots: blockedSlotsResponse,
    });
  } catch (error) {
    console.error('❌ Error getting slots:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const unblockTimeSlot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slotId } = req.params;

    const box = await CricketBox.findOne({ owner: req.user?._id });
    if (!box) {
      res.status(404).json({ message: 'No box found. Please create a box.' });
      return;
    }

    const deletedSlot = await BlockedSlot.findOneAndDelete({
      _id: slotId,
      boxId: box._id,
    });

    if (!deletedSlot) {
      res.status(404).json({ message: 'Blocked slot not found or unauthorized' });
      return;
    }

    const io = getIO();
    if (io) {
      io.to(`box-${box._id}`).emit("slot-unblocked", {
        boxId: box._id,
        slotId: deletedSlot._id,
        quarterId: deletedSlot.quarterId
      });
    }

    res.json({ message: 'Blocked slot removed successfully' });
  } catch (error) {
    console.log('❌ Error in unblockTimeSlot controller:', error);
    res.status(500).json({ message: 'Failed to unblock time slot' });
  }
};
