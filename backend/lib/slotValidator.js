import BlockedSlot from "../models/BlockedSlot.js";
import Booking from "../models/Booking.js";
import { parseDateTime } from "./parseDateTime.js";

export const validateSlot = async ({ boxId, quarterId, date, startTime, duration }) => {
  const start = parseDateTime(date, startTime);
  const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

  // 🚫 Check blocked slots
  const blockedSlots = await BlockedSlot.find({ boxId, quarterId });
  const isBlocked = blockedSlots.some(slot => {
    const blockStart = parseDateTime(slot.date, slot.startTime);
    const blockEnd = parseDateTime(slot.date, slot.endTime);

    // 🔥 Handle overnight block (11PM → 2AM)
    if (blockEnd <= blockStart) {
      blockEnd.setDate(blockEnd.getDate() + 1);
    }

    return blockStart < end && blockEnd > start; // ⏱ overlap check
  });

  if (isBlocked) {
    return { available: false, error: "Slot is blocked by admin for this quarter" };
  }

  // 🔁 Check overlapping confirmed bookings
  const overlappingBookings = await Booking.find({
    box: boxId,
    quarter: quarterId,
    startDateTime: { $lt: end },
    endDateTime: { $gt: start },
    status: "confirmed",
  });

  if (overlappingBookings.length > 0) {
    return { available: false, error: "Slot not available" };
  }

  // ✔ All clear
  return { available: true, start, end };
};
