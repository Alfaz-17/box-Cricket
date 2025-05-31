
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name:{
    type:String,
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const cricketBoxSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String, required: true },
  address: { type: String }, // Optional but mock data has it
  hourlyRate: { type: Number, required: true },

  mobileNumber: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/, // Validates Indian-style 10-digit number
  },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  image: { type: String },        // Primary image
  images: [{ type: String }],     // Multiple images from Cloudinary

  features: [{ type: String }],   // List of features

  facilities: [{ type: String }], // Optional: From mock data if you want this separately

  openingHours: {
    weekdays: { type: String ,default:"6:00 AM - 12:00 PM"},
    weekends: { type: String ,default:"12:00 AM - 12:00 AM(24 houres)"},
  },
quarters: [
  {
    name: String,         // e.g., "Quarter 1"
    isAvailable: { type: Boolean, default: true }
  }
],

  reviews: [reviewSchema],

  blockedSlots: [
    {
      date: { type: String },
      startTime: { type: String },
      endTime: { type: String },
      reason:{type:String}
    },
  ],
  updatedAt:{type:Date},

  rating: { type: Number, default: 0 },        // Optional: Computed later
  reviewCount: { type: Number, default: 0 },   // Optional: Computed later
});

export default mongoose.model("CricketBox", cricketBoxSchema);
