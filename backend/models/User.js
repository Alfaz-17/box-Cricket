import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  contactNumber: { type: String, required: true, unique: true },
  otp: { type: String },  // optional, for storing latest OTP
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "owner"],
    default: "user",
  },
  ownerCode: { type: String, default:null }, // For owners, to verify ownership
}, { timestamps: true });

export default mongoose.model("User", userSchema);
