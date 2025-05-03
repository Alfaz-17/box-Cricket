// controllers/ownerController.js
import CricketBox from "../models/CricketBox.js";
import Booking from "../models/Booking.js";

export const getMyBookings = async (req, res) => {
 try {
    const box = await CricketBox.findOne({ owner: req.user._id });
    if (!box) return res.status(404).json({ message: "No box found" });
  
    const bookings = await Booking.find({ box: box._id }).populate("user", "name email");
    res.json(bookings);
 } catch (error) {
    res.status(500).json({ message: "Failed to get Booking" });
    console.log("error in getMybooking Controller",error)
 }
};

export const blockTimeSlot = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
  const box = await CricketBox.findOne({ owner: req.user._id });
  if (!box) return res.status(404).json({ message: "No box found" });

  box.blockedSlots.push({ date, startTime, endTime });
  await box.save();
  res.json({ message: "Time slot blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to blockTime Booking" });
    console.log("error in blockTimeSlots Controller",error)
  };
};


