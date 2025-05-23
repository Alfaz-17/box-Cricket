import BlockedSlot from "../models/BlockedSlot.js";
import CricketBox from "../models/CricketBox.js";
import {parseDateTime} from '../lib/parseDateTime.js'
import Booking from "../models/Booking.js";

export const blockTimeSlot = async (req, res) => {
  try {
    const { date, startTime, endTime, reason } = req.body;

    const box = await CricketBox.findOne({ owner: req.user._id });
    if (!box) return res.status(404).json({ message: "No box found. Please create a box." });

    const start = parseDateTime(date, startTime);
    const end = parseDateTime(date, endTime);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({ message: "Start time cannot be in the past" });
    }

    // 🧠 Check for overlapping blocked slots
    const overlapping = await BlockedSlot.findOne({
      boxId: box._id,
      date,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (overlapping) {
      return res.status(409).json({ message: "This time slot is already blocked or overlaps with another blocked slot." });
    }

    const newBlockedSlot = new BlockedSlot({
      boxId: box._id,
      date,
      startTime,
      endTime,
      reason
    });

    await newBlockedSlot.save();

    res.json({ message: "Time slot blocked successfully" });
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

    // 2. Get all bookings for the box
    const bookings = await Booking.find({ box: id });
const now =new Date();
    // 3. Format the slots
    const upcomingBookedSolts = bookings.filter((b) => {
       return b.endDateTime > now
    });

   const blockedSlots= (await BlockedSlot.find()).filter((b)=>{
 const endBlockedTime =parseDateTime(b.date,b.endTime);
 return endBlockedTime > now ;
    
   });

    res.json({ upcomingBookedSolts, blockedSlots });
  } catch (error) {
    console.error("Error getting slots:", error);
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

export const getBlockedSlot =async (req,res)=>{
      try {
        const box=await CricketBox.find({owner:req.user._id});

        if(!box){
          return res.status(400).json({message:"Box is not founded"})
        }

        const blockedSlot=await BlockedSlot.find({boxId:box._id})

      } catch (error) {
        
      }


}



