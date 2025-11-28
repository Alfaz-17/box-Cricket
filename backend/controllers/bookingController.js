import Booking from '../models/Booking.js'
import CricketBox from '../models/CricketBox.js'

import dotenv from 'dotenv'
dotenv.config()
import { parseDateTime } from '../lib/parseDateTime.js'
import BlockedSlot from '../models/BlockedSlot.js'
import { sendMessage } from '../lib/whatsappBot.js'
import { getIO } from '../lib/soket.js'
import { validateSlot } from '../lib/slotValidator.js'


export const checkSlotAvailability = async (req, res) => {
  try {
    const { boxId, quarterId, date, startTime, duration } = req.body;

    if (!boxId || !quarterId || !date || !startTime || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const now = new Date();
    const start = parseDateTime(date, startTime);
    if (start < now) {
      return res.status(400).json({ message: "Start time cannot be in the past" });
    }

    const box = await CricketBox.findById(boxId);
    if (!box) return res.status(404).json({ message: "Box not found" });

    const quarter = box.quarters.find(q => q._id.toString() === quarterId);
    if (!quarter) return res.status(400).json({ message: "Invalid quarter selected" });

    // ⏱ Shared Slot Validation
    const { available, error } = await validateSlot({ boxId, quarterId, date, startTime, duration });

    if (!available) return res.json({ available: false, error });

    return res.json({ available: true, message: "Slot is available" });

  } catch (err) {
    console.error("❌ Slot Availability Error:", err.message);
    res.status(500).json({ message: err.message || "Server error" });
  }
};



export const createTemporaryBooking = async (req, res) => {
  try {
    const { boxId, quarterId, date, startTime, duration, contactNumber } = req.body;
    const now = new Date();
    const start = parseDateTime(date, startTime);

    if (start < now) {
      return res.status(400).json({ message: "Start time cannot be in the past" });
    }

    if (!/^\d{10}$/.test(contactNumber)) {
      return res.status(400).json({ message: "Invalid contact number. It must be exactly 10 digits." });
    }

    const box = await CricketBox.findById(boxId);
    if (!box) return res.status(404).json({ message: "Box not found" });

    const quarter = box.quarters.find(q => q._id.toString() === quarterId);
    if (!quarter) return res.status(400).json({ message: "Invalid quarter selected" });

    // ⏱ Shared Slot Validation
    const { available, error, start: validatedStart, end: validatedEnd } =
      await validateSlot({ boxId, quarterId, date, startTime, duration });

    if (!available) {
      return res.status(400).json({ message: error });
    }

    // ✔ Create booking
    const booking = new Booking({
      user: req.user.name,
      userId: req.user._id,
      box: boxId,
      quarter: quarterId,
      quarterName: quarter.name,
      date,
      startTime,
      endTime: validatedEnd,
      startDateTime: validatedStart,
      endDateTime: validatedEnd,
      duration,
      amountPaid: 0,
      contactNumber,
      paymentStatus: "pending",
      isOffline: true,
      method: "temporary",
      bookedBy: req.user._id,
    });

    await booking.save();

    const io = getIO();
    io.to(`box-${boxId}`).emit("new-booking", {
      bookingId: booking._id,
      boxId,
      quarterId,
      date,
      startTime,
      duration,
      bookedBy: req.user._id,
      bookedByName: req.user.name,
    });

    await sendMessage(`91${contactNumber}`, ` Your Booking is Confirm`);

    res.status(200).json({
      message: "Temporary booking created successfully",
      bookingId: booking._id,
      date,
      from: startTime,
      duration,
    });




  } catch (err) {
    console.error("Temporary Booking Error:", err.message);
    res.status(500).json({ message: "Temporary booking failed" });
  }
};







export const getAvailableBoxes = async (req, res) => {
  try {
    // valide input
    const { date, startTime, duration } = req.body
    if (!date || !startTime || !duration) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // prvent past time booking
    const now = new Date()
    const start = parseDateTime(date, startTime)
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000)

    if (start < now) {
      return res.status(400).json({ message: 'Start time cannot be in the past' })
    }

    // fetch boxes
    const allBoxes = await CricketBox.find()
    const availableBoxes = []

    // make loop to  chek each boxes and its quarters
    for (const box of allBoxes) {
      const availableQuarters = []

      for (const quarter of box.quarters) {
        // --- 1. Check blocked slots ---
        const blockedSlots = await BlockedSlot.find({
          boxId: box._id,
          quarterId: quarter._id,
        })

        const isBlocked = blockedSlots.some(slot => {
          const blockStart = parseDateTime(slot.date, slot.startTime)
          const blockEnd = parseDateTime(slot.date, slot.endTime)

          // Handle overnight blocking (e.g. 23:00 -> 02:00)
          if (blockEnd <= blockStart) {
            blockEnd.setDate(blockEnd.getDate() + 1)
          }

          return blockStart < end && blockEnd > start
        })

        if (isBlocked) continue

        // --- 2. Check overlapping bookings ---
        const overlappingBookings = await Booking.find({
          box: box._id,
          quarter: quarter._id,
          startDateTime: { $lt: end },
          endDateTime: { $gt: start },
          status: 'confirmed',
        })

        if (overlappingBookings.length > 0) continue

        // If we get here, this quarter has a free slot
        availableQuarters.push({
          quarterId: quarter._id,
          name: quarter.name,
        })
      }

      // Add box only if it has at least one available quarter
      if (availableQuarters.length > 0) {
        availableBoxes.push(box)
      }
    }

    return res.json(availableBoxes)
  } catch (err) {
    console.error('❌ Error in general availability:', err)
    res.status(500).json({ message: err.message || 'Server error' })
  }
}



export const getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params

    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    return res.status(200).json({
      bookingId: booking._id,
      paymentStatus: booking.paymentStatus, // 'pending' | 'paid'
      amountPaid: booking.amountPaid || 0,
      method: booking.method,
    })
  } catch (err) {
    console.error('❌ Error fetching payment status:', err.message)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getMyBookingRecipt = async (req, res) => {
  try {
    const bookingId = req.params.id
    const booking = await Booking.findById(bookingId).populate('box')

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    res.json({
      bookingId: booking._id,
      boxName: booking.box.name,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      duration: booking.duration,
      amountPaid: booking.amountPaid,
      paymentStatus: booking.paymentStatus,
      contactNumber: booking.contactNumber,
      quarterName: booking.quarterName,
    })
  } catch {
    console.error('❌ Error fetching booking receipt:', err.message)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id }).populate('box')

  const now = new Date()
  // Find bookings that should be marked as completed
  const updates = bookings.map(async booking => {
    if (
      booking.endDateTime < now &&
      booking.status !== 'cancelled' &&
      booking.status !== 'completed'
    ) {
      booking.status = 'completed'
      await booking.save()
    }
  })

  await Promise.all(updates)

  const updatedBookings = await Booking.find({ userId: req.user._id }).populate('box')
  res.json(updatedBookings)
}

export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id
    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    // Check if user owns the booking (optional, if auth is used)
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const now = new Date()
    const timeDiff = booking.startDateTime.getTime() - now.getTime() // in milliseconds
    const hoursDiff = timeDiff / (1000 * 60 * 60)

    if (hoursDiff < 24) {
      return res.status(400).json({
        message: 'Cannot cancel booking within 24 hours of start time',
      })
    }

    booking.status = 'cancelled'
    await booking.save()

    res.status(200).json({ message: 'Booking cancelled successfully', booking })
  } catch (err) {
    console.error('❌ Error cancelling booking:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
}

// owner Booking
export const getRecenetBooking = async (req, res) => {
  try {
    const box = await CricketBox.findOne({ owner: req.user._id })
    if (!box) return res.status(404).json({ message: 'No box found' })

    const recenetBookings = await Booking.find({ box: box._id })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(5) // Limit to latest 5
      .populate('user box')

    res.json(recenetBookings)
  } catch (error) {
    res.status(500).json({ message: 'Failed to get Booking' })
    console.log('error in recentBooking Controller', error)
  }
}

export const getOwnersBookings = async (req, res) => {
  try {
    const box = await CricketBox.findOne({ owner: req.user._id })
    if (!box) return res.status(404).json({ message: 'No box found' })

    const recenetBookings = await Booking.find({ box: box._id })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(5) // Limit to latest 5
      .populate('user box')

    res.json(recenetBookings)
  } catch (error) {
    res.status(500).json({ message: 'Failed to get Booking' })
    console.log('error in recentBooking Controller', error)
  }
}
