import mongoose from 'mongoose'


const BlockedSlotSchema = new mongoose.Schema({

  boxId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box',
    required: true
  },
  quarterName:String,
  date: {
    type: String, // or Date
    required: true
  },
  startTime: String, // e.g., "2:00 AM"
  endTime: String,
  reason: String, // Optional (e.g., maintenance, holiday)
});

export default mongoose.model("BlockedSlot", BlockedSlotSchema);
