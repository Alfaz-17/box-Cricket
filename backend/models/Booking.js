import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    box: { type: mongoose.Schema.Types.ObjectId, ref: "CricketBox", required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    duration: { type: Number, required: true },
    amountPaid: { type: Number, required: true , default:500},
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentIntentId: { type: String },
    contactNumber: { type: String },
  }, { timestamps: true });
  

export default mongoose.model("Booking", bookingSchema);
