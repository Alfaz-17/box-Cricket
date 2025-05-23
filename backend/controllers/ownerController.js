// controllers/ownerController.js
import CricketBox from "../models/CricketBox.js";
import Booking from "../models/Booking.js";




export const getMyBookings = async (req, res) => {
 try {


    const box = await CricketBox.findOne({ owner: req.user._id });
    if (!box) return res.status(404).json({ message: "No box found" });
  
    const bookings = await Booking.find({ box: box._id }).populate("user box", "name email");
    res.json(bookings);
 } catch (error) {
    res.status(500).json({ message: "Failed to get Booking" });
    console.log("error in getMybooking Controller",error)
 }
};

// export const blockTimeSlot = async (req, res) => {
//   try {
//     const { date, startTime, endTime, reason } = req.body;

//     const box = await CricketBox.findOne({ owner: req.user._id });
//     if (!box) return res.status(404).json({ message: "No box found. Please create a box." });

//     const start = parseDateTime(date, startTime);
//     const end = parseDateTime(date, endTime);
//     const now = new Date();

//     if (start < now) {
//       return res.status(400).json({ message: "Start time cannot be in the past" });
//     }

//     // 🧠 Check for overlapping blocked slots
//     const overlapping = await BlockedSlot.findOne({
//       boxId: box._id,
//       date,
//       $or: [
//         {
//           startTime: { $lt: endTime },
//           endTime: { $gt: startTime }
//         }
//       ]
//     });

//     if (overlapping) {
//       return res.status(409).json({ message: "This time slot is already blocked or overlaps with another blocked slot." });
//     }

//     const newBlockedSlot = new BlockedSlot({
//       boxId: box._id,
//       date,
//       startTime,
//       endTime,
//       reason
//     });

//     await newBlockedSlot.save();

//     res.json({ message: "Time slot blocked successfully" });
//   } catch (error) {
//     console.log("❌ Error in blockTimeSlot controller:", error);
//     res.status(500).json({ message: "Failed to block time slot" });
//   }
// };

export const getRecenetBooking=async(req,res)=>{
  try {
    const box = await CricketBox.findOne({ owner: req.user._id });
    if (!box) return res.status(404).json({ message: "No box found" });
  

const recenetBookings = await Booking.find({ box: box._id })
  .sort({ createdAt: -1 }) // Sort by newest first
  .limit(5)                // Limit to latest 5
  .populate("user box", "name email");

  res.json(recenetBookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to get Booking" });
    console.log("error in recentBooking Controller",error)
 }
}




