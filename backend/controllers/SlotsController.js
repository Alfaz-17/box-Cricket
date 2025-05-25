import BlockedSlot from "../models/BlockedSlot.js";
import CricketBox from "../models/CricketBox.js";
import {parseDateTime} from '../lib/parseDateTime.js'
import Booking from "../models/Booking.js";

export const blockTimeSlot = async (req, res) => {
  try {
    const { date, startTime, endTime, reason, quarterName } = req.body;

    const box = await CricketBox.findOne({ owner: req.user._id });
    if (!box) {
      return res.status(404).json({ message: "No box found. Please create a box." });
    }

    // ✅ Check if quarter exists in box
    const quarter = box.quarters.find(q => q.name === quarterName);
    if (!quarter) {
      return res.status(404).json({ message: `Quarter "${quarterName}" not found in this box.` });
    }

    const start = parseDateTime(date, startTime);
    const end = parseDateTime(date, endTime);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({ message: "Start time cannot be in the past" });
    }

    // 🧠 Check for overlapping blocked slots in this quarter
    const overlapping = await BlockedSlot.findOne({
      boxId: box._id,
      quarterName, // <== include quarter in overlap check
      date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (overlapping) {
      return res.status(409).json({ message: `This time slot in "${quarterName}" is already blocked or overlaps with another blocked slot.` });
    }

    const newBlockedSlot = new BlockedSlot({
      boxId: box._id,
      quarterName, // <== save quarter name
      date,
      startTime,
      endTime,
      reason
    });

    await newBlockedSlot.save();

    res.json({ message: `Time slot blocked successfully in "${quarterName}"` });
  } catch (error) {
    console.log("❌ Error in blockTimeSlot controller:", error);
    res.status(500).json({ message: "Failed to block time slot" });
  }
};


export const getBlockedAndBookedSlots = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the box
    const box = await CricketBox.findById(id);
    if (!box) return res.status(404).json({ message: "Cricket box not found" });

    const now = new Date();

    // 2. Get all upcoming bookings for the box
    const bookings = await Booking.find({ box: id });
    const upcomingBookedSlots = bookings.filter(b => new Date(b.endDateTime) > now);

    // 3. Get all upcoming blocked slots for the box
    const blockedSlots = (await BlockedSlot.find({ boxId: id })).filter(b => {
      const endBlockedTime = parseDateTime(b.date, b.endTime);
      return endBlockedTime > now;
    });

    // 4. Group booked slots by quarterName
    const bookedMap = {};
    upcomingBookedSlots.forEach(b => {
      if (!bookedMap[b.quarterName]) {
        bookedMap[b.quarterName] = [];
      }
      bookedMap[b.quarterName].push(b);
    });

    // 5. Group blocked slots by quarterName
    const blockedMap = {};
    blockedSlots.forEach(b => {
      if (!blockedMap[b.quarterName]) {
        blockedMap[b.quarterName] = [];
      }
      blockedMap[b.quarterName].push(b);
    });

    // 6. Convert maps to array format
    const bookedSlotsResponse = Object.keys(bookedMap).map(quarterName => ({
      quarterName,
      slots: bookedMap[quarterName]
    }));

    const blockedSlotsResponse = Object.keys(blockedMap).map(quarterName => ({
      quarterName,
      slots: blockedMap[quarterName]
    }));

    // 7. Send response
    res.json({
      bookedSlots: bookedSlotsResponse,
      blockedSlots: blockedSlotsResponse
    });

  } catch (error) {
    console.error("❌ Error getting slots:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const unblockTimeSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    // Find the box owned by the current user
    const box = await CricketBox.findOne({ owner: req.user._id });
    if (!box) return res.status(404).json({ message: "No box found. Please create a box." });

    // Find and delete the blocked slot only if it belongs to the owner's box
    const deletedSlot = await BlockedSlot.findOneAndDelete({
      _id: slotId,
      boxId: box._id
    });

    if (!deletedSlot) {
      return res.status(404).json({ message: "Blocked slot not found or unauthorized" });
    }

    res.json({ message: "Blocked slot removed successfully" });
  } catch (error) {
    console.log("❌ Error in unblockTimeSlot controller:", error);
    res.status(500).json({ message: "Failed to unblock time slot" });
  }
};




