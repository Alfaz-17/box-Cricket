import Booking from "../models/Booking.js";
import CricketBox from "../models/CricketBox.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import dotenv from 'dotenv'


dotenv.config();
// Check slot availability
export const checkSlotAvailability = async (req, res) => {
  const { boxId, date, startTime, endTime } = req.body;

  const box = await CricketBox.findById(boxId);
  if (!box) return res.status(404).json({ message: "Box not found" });

  const overlappingBooking = await Booking.findOne({
    box: boxId,
    date,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    paymentStatus: "paid",
  });

  const blocked = box.blockedSlots.some(slot =>
    slot.date === date &&
    slot.startTime < endTime &&
    slot.endTime > startTime
  );

  if (overlappingBooking || blocked) {
    return res.status(400).json({ message: "Slot not available" });
  }

  res.json({ available: true });
};

// Create Stripe Checkout session
export const createStripeCheckout = async (req, res) => {
  const { boxId, date, startTime, endTime ,contactNumber} = req.body;
  const box = await CricketBox.findById(boxId);
  if (!box) return res.status(404).json({ message: "Box not found" });

  const amount = 500 * 100; // ₹500 in paise

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card','upi'],
    line_items: [{
      price_data: {
        currency: "inr",
        product_data: { name: `Cricket Box Booking - ${box.location}` },
        unit_amount: amount,
      },
      quantity: 1,
    }],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/booking-success`,
    cancel_url: `${process.env.CLIENT_URL}/booking-fail`,
    metadata: {
      userId: req.user._id.toString(),
      boxId,
      date,
      startTime,
      endTime,
    contactNumber
    },
  });

  res.json({ id: session.id });
};

// Stripe webhook handler

export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, boxId, date, startTime, endTime, contactNumber } = session.metadata;

    try {
      const booking = await Booking.create({
        user: userId,
        box: boxId,
        date,
        startTime,
        endTime,
        contactNumber,
        amountPaid: session.amount_total / 100,
        paymentStatus: 'paid',
        paymentIntentId: session.payment_intent,
      });

      console.log('✅ Booking created successfully:', booking._id);
    } catch (err) {
      console.error('❌ Error saving booking:', err.message);
      return res.status(500).send('Internal Server Error');
    }
  }
  res.status(200).json({ received: true });
};


// User's bookings
export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate("box");
  res.json(bookings);
};


export const getBlockedAndBookedSlots = async (req, res) => {
  try {
    const { boxId } = req.params;

    // 1. Find the box
    const box = await CricketBox.findById(boxId);
    if (!box) return res.status(404).json({ message: "Cricket box not found" });

    // 2. Get all bookings for the box
    const bookings = await Booking.find({ box: boxId });

    // 3. Format the slots
    const bookedSlots = bookings.map(b => ({
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
    }));

    const blockedSlots = box.blockedSlots.map(slot => ({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));

    res.json({ bookedSlots, blockedSlots });

  } catch (error) {
    console.error("Error getting slots:", error);
    res.status(500).json({ message: "Server error" });
  }
};