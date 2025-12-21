import BlockedSlot from '../models/BlockedSlot.js'
import CricketBox from '../models/CricketBox.js'
import { parseDateTime } from '../lib/parseDateTime.js'
import Booking from '../models/Booking.js'
import { getIO } from '../lib/soket.js'

export const blockTimeSlot = async (req, res) => {
  try {
    const { date, startTime, endTime, reason, quarterName } = req.body;

    // 1️⃣ Find Owner Box
    const box = await CricketBox.findOne({ owner: req.user._id });
    if (!box) {
      return res.status(404).json({ message: "No box found. Please create a box." });
    }

    // 2️⃣ Validate Quarter
    const quarter = box.quarters.find(q => q.name === quarterName);
    if (!quarter) {
      return res.status(404).json({ message: `Quarter "${quarterName}" not found in this box.` });
    }
    const quarterId = quarter._id;

    // 3️⃣ Convert times to Date objects
    const startDateTime = parseDateTime(date, startTime);
    let endDateTime = parseDateTime(date, endTime);

    // 🔥 Handle overnight slot (end next day)
    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    const now = new Date();

    // 4️⃣ Cannot block past times
    if (startDateTime < now) {
      return res.status(400).json({ message: "Start time cannot be in the past." });
    }

    // 5️⃣ Check overlap with confirmed bookings
    const overlappingBooking = await Booking.findOne({
      box: box._id,
      quarter: quarterId,
      status: "confirmed",
      $or: [{ paymentStatus: 'paid' }, { isOffline: true }],
      startDateTime: { $lt: endDateTime },
      endDateTime: { $gt: startDateTime }
    });

    if (overlappingBooking) {
      return res.status(409).json({
        message: `Cannot block — "${quarterName}" has a confirmed booking in this time range.`
      });
    }

    // 6️⃣ Check overlap with existing blocked slots
    const existingBlockedSlots = await BlockedSlot.find({ boxId: box._id, quarterId });

    const isOverlappingBlock = existingBlockedSlots.some(slot => {
      const bStart = parseDateTime(slot.date, slot.startTime);
      let bEnd = parseDateTime(slot.date, slot.endTime);

      // Handle overnight blocked slot
      if (bEnd <= bStart) {
        bEnd.setDate(bEnd.getDate() + 1);
      }

      return bStart < endDateTime && bEnd > startDateTime;
    });

    if (isOverlappingBlock) {
      return res.status(409).json({
        message: `This time slot in "${quarterName}" is already blocked.`
      });
    }

    // 7️⃣ Save Blocked Slot
    await BlockedSlot.create({
      boxId: box._id,
      quarterId,
      quarterName,
      date,
      startTime,
      endTime,
      reason
    });

    // 8️⃣ Emit real-time update
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

    return res.json({
      message: `Time slot blocked successfully in "${quarterName}".`
    });

  } catch (error) {
    console.log("❌ Error in blockTimeSlot controller:", error);
    return res.status(500).json({ message: "Failed to block time slot" });
  }
};



export const getBlockedAndBookedSlots = async (req, res) => {
  try {
    const { id } = req.params

    // 1. Find the box
    const box = await CricketBox.findById(id)
    if (!box) return res.status(404).json({ message: 'Cricket box not found' })

    const now = new Date()

    // 2. Get all upcoming confirmed and paid bookings for the box
    const bookings = await Booking.find({ 
      box: id,
      status: 'confirmed',
      $or: [
        { paymentStatus: 'paid' },
        { isOffline: true }
      ]
    }).select('date startTime endTime duration quarter quarterName startDateTime endDateTime status paymentStatus isOffline')
    
    const upcomingBookedSlots = bookings.filter(b => new Date(b.endDateTime) > now);

    // 3. Get all upcoming blocked slots for the box


    // We need to compute datetimes for filtering and response
    const allBlockedSlots = await BlockedSlot.find({ boxId: id })
    const upcomingBlockedSlots = allBlockedSlots.map(slot => {
        const startDateTime = parseDateTime(slot.date, slot.startTime)
        let endDateTime = parseDateTime(slot.date, slot.endTime)
        
        // Handle overnight
        if (endDateTime <= startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1)
        }
        
        return {
            ...slot.toObject(),
            startDateTime,
            endDateTime
        }
    }).filter(b => b.endDateTime > now)


    // 4. Group booked slots by quarterName
    const bookedMap = {}
    upcomingBookedSlots.forEach(b => {
      if (!bookedMap[b.quarterName]) {
        bookedMap[b.quarterName] = []
      }
      bookedMap[b.quarterName].push(b)
    })

    // 5. Group blocked slots by quarterName
    const blockedMap = {}
    upcomingBlockedSlots.forEach(b => {
      if (!blockedMap[b.quarterName]) {
        blockedMap[b.quarterName] = []
      }
      blockedMap[b.quarterName].push(b)
    })

    // 6. Convert maps to array format with quarterId
    const bookedSlotsResponse = Object.keys(bookedMap).map(quarterName => ({
      quarterName,
      quarterId: bookedMap[quarterName][0].quarter, // Add quarterId
      slots: bookedMap[quarterName],
    }))

    const blockedSlotsResponse = Object.keys(blockedMap).map(quarterName => ({
      quarterName,
      quarterId: blockedMap[quarterName][0].quarterId, // Add quarterId
      slots: blockedMap[quarterName],
    }))

    // 7. Send response
    res.json({
      bookedSlots: bookedSlotsResponse,
      blockedSlots: blockedSlotsResponse,
    })
  } catch (error) {
    console.error('❌ Error getting slots:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const unblockTimeSlot = async (req, res) => {
  try {
    const { slotId } = req.params

    // Find the box owned by the current user
    const box = await CricketBox.findOne({ owner: req.user._id })
    if (!box) return res.status(404).json({ message: 'No box found. Please create a box.' })

    // Find and delete the blocked slot only if it belongs to the owner's box
    const deletedSlot = await BlockedSlot.findOneAndDelete({
      _id: slotId,
      boxId: box._id,
    })

    if (!deletedSlot) {
      return res.status(404).json({ message: 'Blocked slot not found or unauthorized' })
    }

    // 3. Emit real-time update
    const io = getIO();
    if (io) {
      io.to(`box-${box._id}`).emit("slot-unblocked", {
        boxId: box._id,
        slotId: deletedSlot._id,
        quarterId: deletedSlot.quarterId
      });
    }

    res.json({ message: 'Blocked slot removed successfully' })
  } catch (error) {
    console.log('❌ Error in unblockTimeSlot controller:', error)
    res.status(500).json({ message: 'Failed to unblock time slot' })
  }
}
