import BlockedSlot from "../models/BlockedSlot.js";
import Booking from "../models/Booking.js";
import { parseDateTime } from "./parseDateTime.js";

interface ValidationParams {
  boxId: string;
  quarterId: string;
  date: string;
  startTime: string;
  duration: number;
}

export const validateSlot = async ({ boxId, quarterId, date, startTime, duration }: ValidationParams) => {
  const start = parseDateTime(date, startTime);
  const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

  const blockedSlots = await BlockedSlot.find({ boxId, quarterId });
  const isBlocked = blockedSlots.some(slot => {
    const blockStart = parseDateTime(slot.date as string, slot.startTime as string);
    const blockEnd = parseDateTime(slot.date as string, slot.endTime as string);

    if (blockEnd <= blockStart) {
      blockEnd.setDate(blockEnd.getDate() + 1);
    }

    return blockStart < end && blockEnd > start;
  });

  if (isBlocked) {
    return { available: false, error: "Slot is blocked by admin for this quarter" };
  }

  const overlappingBookings = await Booking.find({
    box: boxId,
    quarter: quarterId,
    startDateTime: { $lt: end },
    endDateTime: { $gt: start },
    status: "confirmed",
    $or: [{ paymentStatus: 'paid' }, { isOffline: true }],
  });

  if (overlappingBookings.length > 0) {
    return { available: false, error: "Slot not available" };
  }

  return { available: true, start, end };
};
