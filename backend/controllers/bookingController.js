import Booking from "../models/Booking.js";
import CricketBox from "../models/CricketBox.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import dotenv from "dotenv";
dotenv.config();
import {parseDateTime} from '../lib/parseDateTime.js'
import BlockedSlot from "../models/BlockedSlot.js";


// function parseDateTime(dateStr, timeStr) {
//   const dateTime = moment(`${dateStr} ${timeStr}`, "YYYY-MM-DD hh:mm A");
//   if (!dateTime.isValid()) throw new Error("Invalid date or time format");
//   return dateTime.toDate();
// }

export const checkSlotAvailability = async (req, res) => {
  try {
    const { boxId, quarterId, date, startTime, duration } = req.body;

    if (!boxId || !quarterId || !date || !startTime || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const now = new Date();
    const start = parseDateTime(date, startTime);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

    // check start time not less than current time
    if (start < now) {
      return res.status(400).json({ message: "Start time cannot be in the past" });
    }

    // Check if quarter exists and is available in the box quarters
    const box = await CricketBox.findById(boxId);
    if (!box) {
      return res.status(404).json({ message: "Box not found" });
    }
    const quarter = box.quarters.find(q => q._id.toString() === quarterId);
    if (!quarter) {
      return res.status(400).json({ message: "Invalid quarter selected" });
    }
    if (!quarter.isAvailable) {
      return res.json({ available: false, error: `Quarter ${quarter.name} is not available for booking.` });
    }

    // Check blocked slots (optional: if blocking is per quarter, add quarter check here)
    const blockedSlots = await BlockedSlot.find({ boxId });

    const isBlocked = blockedSlots.some((slot) => {
      const blockStart = parseDateTime(slot.date, slot.startTime);
      const blockEnd = parseDateTime(slot.date, slot.endTime);

      if (blockEnd <= blockStart) {
        blockEnd.setDate(blockEnd.getDate() + 1);
      }

      // You might want to check if slot.quarterId === quarterId if blocking is quarter specific
      return blockStart < end && blockEnd > start;
    });

    if (isBlocked) {
      return res.json({ available: false, error: "Slot is blocked by admin" });
    }

    // Check overlapping bookings **for the specific quarter**
    const overlappingBookings = await Booking.find({
      box: boxId,
      quarter: quarterId,
      startDateTime: { $lt: end },
      endDateTime: { $gt: start },
    });

    if (overlappingBookings.length > 0) {
      return res.json({ available: false, error: "Slot not available" });
    }

    return res.json({ available: true, message: "Slot is available" });
  } catch (err) {
    console.error("❌ Error checking slot:", err.message);
    res.status(500).json({ message: err.message || "Server error" });
  }
};


// Create Stripe Checkout session
export const createStripeCheckout = async (req, res) => {
  const { boxId, date, startTime, duration, contactNumber } = req.body;
  const box = await CricketBox.findById(boxId);
  if (!box) return res.status(404).json({ message: "Box not found" });

  const amount = 500 * 100; // ₹500 in paise

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: { name: `Cricket Box Booking - ${box.location}` },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/booking-success`,
    cancel_url: `${process.env.CLIENT_URL}/booking-fail`,
    metadata: {
      userId: req.user._id.toString(),
      boxId,
      date,
      startTime,
      duration,
      contactNumber,
    },
  });

  res.json({ id: session.id });
};


// TEMP: Create booking directly (no Stripe, no conflict check)
export const createTempBooking = async (req, res) => {
  try {
    const { boxId, quarterId, date, startTime, duration, contactNumber } = req.body;
    const now = new Date();
    const start = parseDateTime(date, startTime);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
    const formattedEndTime = end.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (!/^\d{10}$/.test(contactNumber)) {
      return res.status(400).json({ message: "Invalid contact number. It must be exactly 10 digits." });
    }

    if (start < now) {
      return res.status(400).json({ message: "Start time cannot be in the past" });
    }

    // 1. Fetch box to check quarters
    const box = await CricketBox.findById(boxId);
    if (!box) {
      return res.status(404).json({ message: "Box not found" });
    }

    // 2. Check if quarterId exists and is available
    const quarter = box.quarters.find(q => q._id.toString() === quarterId);
    if (!quarter) {
      return res.status(400).json({ message: "Invalid quarter selected" });
    }
    if (!quarter.isAvailable) {
      return res.status(400).json({ message: `Quarter ${quarter.name} is not available for booking.` });
    }

if(req.user.role === "owner"){
  return res.status(400).json({message:"Owner cant booking Box"})
}
    // 3. Check for overlapping bookings on this quarter
    const overlappingBooking = await Booking.findOne({
      box: boxId,
      quarter: quarterId,
      date,
      $or: [
        { startDateTime: { $lt: end }, endDateTime: { $gt: start } },
      ],
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: `Quarter ${quarter.name} is already booked for this time slot.` });
    }

    // 4. Create booking with quarter
    const booking = await Booking.create({
      user: req.user.name,
      userId: req.user._id,
      box: boxId,
      quarter: quarterId,
      quarterName: quarter.name,
      date,
      startTime,
      endTime: formattedEndTime,
      duration,
      contactNumber,
      startDateTime: start,
      endDateTime: end,
      amountPaid: 500,
      paymentIntentId: "manual",
      paymentStatus: "paid",
    });

    //send confirmation message

    res.status(201).json({ message: "Temporary booking created", booking });
  } catch (err) {
    console.error("❌ Error creating temp booking:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({
      bookingId: booking._id,
      paymentStatus: booking.paymentStatus,
      amountPaid: booking.amountPaid,
    });
  } catch (err) {
    console.error("❌ Error fetching payment status:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyBookingRecipt = async (req, res) =>{
  try {
    const bookingId=req.params.id;
    const booking=await Booking.findById(bookingId).populate("box");

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
      quarterName: booking.quarterName
    });



  }catch{
    console.error("❌ Error fetching booking receipt:", err.message);
    return res.status(500).json({ message: "Server error" });

  }
}


// Stripe webhook handler

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, boxId, date, startTime, duration, contactNumber } =
      session.metadata;

    try {
      const booking = await Booking.create({
        user: userId,
        box: boxId,
        date,
        startTime,
        duration,
        contactNumber,
        amountPaid: session.amount_total / 100,
        paymentStatus: "paid",
        paymentIntentId: session.payment_intent,
      });

      console.log("✅ Booking created successfully:", booking._id);
    } catch (err) {
      console.error("❌ Error saving booking:", err.message);
      return res.status(500).send("Internal Server Error");
    }
  }
  res.status(200).json({ received: true });
};

// User's bookings

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
      return res
        .status(400)
        .json({
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


