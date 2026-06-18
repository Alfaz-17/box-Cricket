import CricketBox from "../models/CricketBox.js";
import Booking from "../models/Booking.js";
import BlockedSlot from "../models/BlockedSlot.js";
import { parseDateTime } from "./parseDateTime.js";

export const findAvailableSlots = async ({ date, startTime, duration }) => {
  const start = parseDateTime(date, startTime);
  const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

  const results = [];

  const boxes = await CricketBox.find({}); // all boxes

  for (const box of boxes) {
    for (const quarter of box.quarters) {

      // 🚫 Blocked slots
      const blockedSlots = await BlockedSlot.find({
        boxId: box._id,
        quarterId: quarter._id
      });

      const isBlocked = blockedSlots.some(slot => {
        const blockStart = parseDateTime(slot.date, slot.startTime);
        const blockEnd = parseDateTime(slot.date, slot.endTime);

        if (blockEnd <= blockStart) {
          blockEnd.setDate(blockEnd.getDate() + 1);
        }

        return blockStart < end && blockEnd > start;
      });

      if (isBlocked) continue;

      // 🔁 Bookings overlap
      const conflict = await Booking.exists({
        box: box._id,
        quarter: quarter._id,
        startDateTime: { $lt: end },
        endDateTime: { $gt: start },
        status: "confirmed",
        $or: [{ paymentStatus: 'paid' }, { isOffline: true }],
      });

      if (conflict) continue;

      // ✅ Slot free
      results.push({
        boxId: box._id,
        boxName: box.name,
        quarterId: quarter._id,
        quarterName: quarter.name
      });
    }
  }

  return {
    available: results.length > 0,
    slots: results
  };
};
