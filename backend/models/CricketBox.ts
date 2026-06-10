import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  name?: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface IQuarter {
  _id?: mongoose.Types.ObjectId;
  name: string;
}

export interface ICustomPricing {
  duration: number;
  price: number;
}

export interface ICricketBox extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  location: string;
  address?: string;
  hourlyRate: number;
  weekendHourlyRate?: number;
  mobileNumber: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  image?: string;
  images: string[];
  customPricing: ICustomPricing[];
  weekendCustomPricing: ICustomPricing[];
  features: string[];
  facilities: string[];
  openingHours: {
    weekdays: string;
    weekends: string;
  };
  quarters: IQuarter[];
  reviews: IReview[];
  blockedSlots: Array<{
    date?: string;
    startTime?: string;
    endTime?: string;
    reason?: string;
  }>;
  updatedAt?: Date;
  rating: number;
  reviewCount: number;
}

const reviewSchema: Schema<IReview> = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

const cricketBoxSchema: Schema<ICricketBox> = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String, required: true },
  address: { type: String },
  hourlyRate: { type: Number, required: true },
  weekendHourlyRate: { type: Number },
  mobileNumber: { type: String, required: true, match: /^[6-9]\d{9}$/ },
  coordinates: { lat: Number, lng: Number },
  image: { type: String },
  images: [{ type: String }],
  customPricing: [{ duration: { type: Number, required: true }, price: { type: Number, required: true } }],
  weekendCustomPricing: [{ duration: { type: Number, required: true }, price: { type: Number, required: true } }],
  features: [{ type: String }],
  facilities: [{ type: String }],
  openingHours: {
    weekdays: { type: String, default: '6:00 AM - 12:00 PM' },
    weekends: { type: String, default: '12:00 AM - 12:00 AM(24 houres)' },
  },
  quarters: [{ name: String }],
  reviews: [reviewSchema],
  blockedSlots: [{ date: String, startTime: String, endTime: String, reason: String }],
  updatedAt: { type: Date },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
});

const CricketBox: Model<ICricketBox> = mongoose.models.CricketBox || mongoose.model<ICricketBox>('CricketBox', cricketBoxSchema);
export default CricketBox;
