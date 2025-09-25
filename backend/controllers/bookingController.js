import Booking from "../models/Booking.js";
import CricketBox from "../models/CricketBox.js";

import dotenv from "dotenv";
dotenv.config();
import { parseDateTime } from "../lib/parseDateTime.js";
import BlockedSlot from "../models/BlockedSlot.js";
import { sendMessage } from "../lib/whatsappBot.js";
import axios from "axios";
import { getIO, getOnlineUsers } from "../lib/soket.js";
import Notification from "../models/Notification.js";
import redis from "../lib/redis.js";
import { nanoid } from "nanoid";


const CF_CLIENT_ID = process.env.CF_CLIENT_ID;
const CF_CLIENT_SECRET = process.env.CF_CLIENT_SECRET;


export const checkSlotAvailability = async (req, res) => {
  try {
    const { boxId, quarterId, date, startTime, duration } = req.body;

    // Check for missing required fields
    if (!boxId || !quarterId || !date || !startTime || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const now = new Date();
    const start = parseDateTime(date, startTime);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000); // Calculate end time by adding duration (in hours)

    //  Disallow bookings in the past
    if (start < now) {
      return res
        .status(400)
        .json({ message: "Start time cannot be in the past" });
    }

    //  Find the Cricket Box by ID
    const box = await CricketBox.findById(boxId);
    if (!box) {
      return res.status(404).json({ message: "Box not found" });
    }

    //  Find the selected quarter inside the box
    const quarter = box.quarters.find((q) => q._id.toString() === quarterId);
    if (!quarter) {
      return res.status(400).json({ message: "Invalid quarter selected" });
    }

    // 🔒 Prevent owners from booking
    if (req.user.role === "owner") {
      return res.status(400).json({ message: "Owner can't book a box" });
    }

    // 🚫 Check if the time slot is blocked by admin (boxId + quarterId)
    const blockedSlots = await BlockedSlot.find({ boxId, quarterId });

    const isBlocked = blockedSlots.some((slot) => {
      const blockStart = parseDateTime(slot.date, slot.startTime);
      const blockEnd = parseDateTime(slot.date, slot.endTime);

      // 🕛 Handle overnight blocking (e.g., 11PM to 2AM)
      if (blockEnd <= blockStart) {
        blockEnd.setDate(blockEnd.getDate() + 1);
      }

      // 🔁 Check overlap between blocked slot and requested slot
      return blockStart < end && blockEnd > start;
    });

    if (isBlocked) {
      return res.json({
        available: false,
        error: "Slot is blocked by admin for this quarter",
      });
    }

    // 🔁 Check for overlapping bookings for this quarter
    const overlappingBookings = await Booking.find({
      box: boxId,
      quarter: quarterId,
      startDateTime: { $lt: end },
      endDateTime: { $gt: start },
      status: "confirmed", // Only check confirmed bookings
    });

    if (overlappingBookings.length > 0) {
      return res.json({ available: false, error: "Slot not available" });
    }

    // ✅ Slot is available
    return res.json({ available: true, message: "Slot is available" });
  } catch (err) {
    console.error("❌ Error checking slot:", err.message);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const getAvailableBoxes = async (req, res) => {
  try {
    // valide input
    const { date, startTime, duration } = req.body;
    if (!date || !startTime || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // prvent past time booking
    const now = new Date();
    const start = parseDateTime(date, startTime);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

    if (start < now) {
      return res
        .status(400)
        .json({ message: "Start time cannot be in the past" });
    }

    // fetch boxes
    const allBoxes = await CricketBox.find();
    const availableBoxes = [];

    // make loop to  chek each boxes and its quarters
    for (const box of allBoxes) {
      const availableQuarters = [];

      for (const quarter of box.quarters) {
        // --- 1. Check blocked slots ---
        const blockedSlots = await BlockedSlot.find({
          boxId: box._id,
          quarterId: quarter._id,
        });

        const isBlocked = blockedSlots.some((slot) => {
          const blockStart = parseDateTime(slot.date, slot.startTime);
          const blockEnd = parseDateTime(slot.date, slot.endTime);

          // Handle overnight blocking (e.g. 23:00 -> 02:00)
          if (blockEnd <= blockStart) {
            blockEnd.setDate(blockEnd.getDate() + 1);
          }

          return blockStart < end && blockEnd > start;
        });

        if (isBlocked) continue;

        // --- 2. Check overlapping bookings ---
        const overlappingBookings = await Booking.find({
          box: box._id,
          quarter: quarter._id,
          startDateTime: { $lt: end },
          endDateTime: { $gt: start },
          status: "confirmed",
        });

        if (overlappingBookings.length > 0) continue;

        // If we get here, this quarter has a free slot
        availableQuarters.push({
          quarterId: quarter._id,
          name: quarter.name,
        });
      }

      // Add box only if it has at least one available quarter
      if (availableQuarters.length > 0) {
        availableBoxes.push(box);
      }
    }

    return res.json(availableBoxes);
  } catch (err) {
    console.error("❌ Error in general availability:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const createPaymentLink = async (req, res) => {
  try {
    const { boxId, quarterId, date, startTime, duration, contactNumber, amountPaid } = req.body;
    const isOffline = req.body.isOffline === true;

    const now = new Date();
    const start = parseDateTime(date, startTime);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

    if (!/^\d{10}$/.test(contactNumber)) {
      return res.status(400).json({ message: "Invalid contact number" });
    }
    if (start < now) {
      return res.status(400).json({ message: "Start time is in the past" });
    }

    const box = await CricketBox.findById(boxId);
    if (!box) return res.status(404).json({ message: "Box not found" });

    const quarter = box.quarters.find((q) => q._id.toString() === quarterId);
    if (!quarter) {
      return res.status(400).json({ message: "Quarter not available" });
    }

    const linkId = nanoid(20);
    let paymentLink = null;

    // Create pending booking even before payment
    if (!isOffline) {
      const pendingBooking = new Booking({
        user: req.user.name,
        userId: req.user._id,
        box: boxId,
        quarter: quarterId,
        quarterName: quarter.name,
        date,
        startTime,
        endTime: end,
        duration,
        amountPaid: 0,          // pending
        contactNumber,
        startDateTime: start,
        endDateTime: end,
        paymentIntentId: linkId, // linkId maps to payment
        cashfreePaymentId: null,
        paymentStatus: "pending",
        bookedBy: req.user._id,
        isOffline: false,
        method: "online",
      });

      await pendingBooking.save();

      // Create Cashfree Payment Link
      const resp = await axios.post(
        "https://sandbox.cashfree.com/pg/links",
        {
          customer_details: {
            customer_id: String(req.user._id),
            customer_email: req.user.email || `guest_${linkId}@example.com`,
            customer_phone: contactNumber,
          },
          link_notify: { send_email: true, send_sms: true },
          link_id: linkId,
          link_amount: amountPaid || 500,
          link_currency: "INR",
          link_purpose: `Booking for ${box.name}, ${quarter.name}`,
          link_meta: {
            redirect_url: `https://book-my-box.vercel.app/my-bookings`, // optional
          },
          link_redirect_url: `https://book-my-box.vercel.app/my-bookings`, // fallback
        },
        {
          headers: {
            "x-client-id": process.env.CF_CLIENT_ID,
            "x-client-secret": process.env.CF_CLIENT_SECRET,
            "x-api-version": "2022-09-01",
            "Content-Type": "application/json",
          },
        }
      );

      paymentLink = resp.data.link_url;
    }

    res.status(200).json({
      message: "Payment link created",
      paymentLink,
      linkId,
    });
  } catch (err) {
    console.error("Cashfree Error:", err.response?.data || err.message);
    res.status(500).json({ message: "Payment link creation failed" });
  }
};

export const cashfreeWebhook = async (req, res) => {
  try {
    console.log("🔔 Cashfree Webhook Received:", JSON.stringify(req.body, null, 2));

    const data = req.body.data;
    const linkId = data.order?.order_tags?.link_id;
    const linkStatus = data.payment?.payment_status; // Cashfree uses "SUCCESS"
    const linkAmount = data.payment?.payment_amount;
    const cfPaymentId = data.payment?.cf_payment_id;

    if (linkStatus === "SUCCESS") {
      // Find pending booking by linkId
      const booking = await Booking.findOne({ paymentIntentId: linkId, paymentStatus: "pending" });
      if (!booking) {
        console.warn("❌ Pending booking not found for linkId:", linkId);
        return res.status(404).send("Pending booking not found");
      }

      // Update booking to paid
      booking.paymentStatus = "paid";
      booking.amountPaid = linkAmount;
      booking.cashfreePaymentId = cfPaymentId;

      await booking.save();

      // Notify owner
      const box = await CricketBox.findById(booking.box);
const quarter = box.quarters.find(q => q._id.toString() === booking.quarter.toString());

if (!quarter) {
  console.warn(`⚠️ Quarter not found for booking ${booking._id}`);
  // You can either skip notification or use a fallback name
  return res.status(404).send("Quarter not found");
}

      const formattedDate = new Date(booking.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const formattedStartTime = booking.startDateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
      const formattedEndTime = booking.endDateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

      const notification = await Notification.create({
        fromUser: booking.userId,
        toUser: box.owner._id,
        type: "booking_created",
        message: `New booking for Quarter "${quarter.name}" on ${formattedDate} from ${formattedStartTime} to ${formattedEndTime} (${booking.duration} hrs).`,
      });

      const io = getIO();
      const onlineUser = getOnlineUsers();
      const socketId = onlineUser.get(String(box.owner._id));
      if (socketId) {
        io.to(socketId).emit("new_notification", {
          toUser: booking.userId,
          message: notification.message,
          type: notification.type,
        });
      }

      console.log(`✅ Booking ${booking._id} updated to paid`);
    }

    res.status(200).send("Webhook received");
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(500).send("Webhook error");
  }
};





export const getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // If booking is already marked paid, no need to call Cashfree
    if (booking.paymentStatus === "paid") {
      return res.status(200).json({
        bookingId: booking._id,
        paymentStatus: "paid",
        amountPaid: booking.amountPaid,
      });
    }

    // Otherwise, query Cashfree using your paymentIntentId
    const paymentIntentId = booking.paymentIntentId; // this should be your orderId

    const response = await axios.get(
      `https://sandbox.cashfree.com/pg/orders/${paymentIntentId}`,
      {
        headers: {
          "x-api-version": "2022-09-01",
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        },
      }
    );

    const cashfreeStatus = response.data.order_status;

    // Optional: Update DB if status changed
    if (cashfreeStatus === "PAID" && booking.paymentStatus !== "paid") {
      booking.paymentStatus = "paid";
      await booking.save();
    }

    return res.status(200).json({
      bookingId: booking._id,
      paymentStatus: booking.paymentStatus,
      cashfreeStatus,
      amountPaid: booking.amountPaid,
    });
  } catch (err) {
    console.error("❌ Error fetching payment status:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyBookingRecipt = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId).populate("box");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
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
    });
  } catch {
    console.error("❌ Error fetching booking receipt:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id }).populate("box");

  const now = new Date();
  // Find bookings that should be marked as completed
  const updates = bookings.map(async (booking) => {
    if (
      booking.endDateTime < now &&
      booking.status !== "cancelled" &&
      booking.status !== "completed"
    ) {
      booking.status = "completed";
      await booking.save();
    }
  });
  await Promise.all(updates);
  const updatedBookings = await Booking.find({ userId: req.user._id }).populate(
    "box"
  );
  res.json(updatedBookings);
};

export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns the booking (optional, if auth is used)
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const now = new Date();
    const timeDiff = booking.startDateTime.getTime() - now.getTime(); // in milliseconds
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return res.status(400).json({
        message: "Cannot cancel booking within 24 hours of start time",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res
      .status(200)
      .json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    console.error("❌ Error cancelling booking:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// owner Booking
export const getRecenetBooking = async (req, res) => {
  try {
    const box = await CricketBox.findOne({ owner: req.user._id });
    if (!box) return res.status(404).json({ message: "No box found" });

    const recenetBookings = await Booking.find({ box: box._id })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(5) // Limit to latest 5
      .populate("user box");

    res.json(recenetBookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to get Booking" });
    console.log("error in recentBooking Controller", error);
  }
};

export const getOwnersBookings = async (req, res) => {
  try {
    const box = await CricketBox.findOne({ owner: req.user._id });
    if (!box) return res.status(404).json({ message: "No box found" });

    const recenetBookings = await Booking.find({ box: box._id })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(5) // Limit to latest 5
      .populate("user box");

    res.json(recenetBookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to get Booking" });
    console.log("error in recentBooking Controller", error);
  }
};
