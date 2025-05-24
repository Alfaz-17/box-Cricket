// controllers/ownerController.js
import CricketBox from "../models/CricketBox.js";
import Booking from "../models/Booking.js";




export const getMyBookings = async (req, res) => {
 try {


    const box = await CricketBox.findOne({ owner: req.user._id });
    if (!box) return res.status(404).json({ message: "No box found" });
  
    const bookings = await Booking.find({ box: box._id }).populate("user box");
    res.json(bookings);
 } catch (error) {
    res.status(500).json({ message: "Failed to get Booking" });
    console.log("error in getMybooking Controller",error)
 }
};


export const getRecenetBooking=async(req,res)=>{
  try {
    const box = await CricketBox.findOne({ owner: req.user._id });
    if (!box) return res.status(404).json({ message: "No box found" });
  

const recenetBookings = await Booking.find({ box: box._id })
  .sort({ createdAt: -1 }) // Sort by newest first
  .limit(5)                // Limit to latest 5
  .populate("user box",);

  res.json(recenetBookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to get Booking" });
    console.log("error in recentBooking Controller",error)
 }
}




