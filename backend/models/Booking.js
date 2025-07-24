import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: String, required: true },
   userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },
  quarterName: { type: String, required: true },

  box: { type: mongoose.Schema.Types.ObjectId, ref: "CricketBox", required: true },
   quarter: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: String, required: true }, // For display/filtering
  startTime: { type: String, required: true }, // For display
  endTime: { type: String }, // For display
  duration: { type: Number, required: true },
  amountPaid: { type: Number, required: true, default: 500 },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  paymentIntentId: { type: String },
  contactNumber: { type: String },
  confirmedAt: { type: Date },
  cancelledAt: { type: Date },
  status: { type: String, enum: ["completed", "confirmed", "cancelled"], default: "confirmed"},
  completedAt: { type: Date },
  notes: { type: String },
  startDateTime: { type: Date },  // ✅ Needed for accurate slot checking
  endDateTime: { type: Date },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // owner/admin who created the booking
isOffline: { type: Boolean, default: false },
method:String
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
