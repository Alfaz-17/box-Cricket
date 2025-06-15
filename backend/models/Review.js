import mongoose from 'mongoose';

// 📌 Review Schema
const ReviewsSchema = new mongoose.Schema({
  boxId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  name: String,             // Name of the reviewer
  rating: Number,           // Rating for this review

  // ❌ These two fields should NOT be in each review document — averageRating & reviewCount
  // If you're tracking average rating and total count, you should store that in the Box model.
}, { timestamps: true });

// 📌 Help & Support Schema
const HelpAndSupportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String, // Changed to String to preserve leading zeros and support international format
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true });

// 📦 Export models
export const Review = mongoose.model("Review", ReviewsSchema);
export const HelpAndSupport = mongoose.model("HelpAndSupport", HelpAndSupportSchema);
