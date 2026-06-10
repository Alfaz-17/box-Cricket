import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBooking extends Document {
  user: string;
  userId?: mongoose.Types.ObjectId;
  quarterName: string;
  box: mongoose.Types.ObjectId;
  quarter: mongoose.Types.ObjectId;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number;
  amountPaid: number;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'processing';
  sabpaisaTxnId?: string;
  sabpaisaPaymentId?: string;
  sabpaisaResponse?: string;
  contactNumber?: string;
  confirmedAt?: Date;
  cancelledAt?: Date;
  status: 'pending' | 'completed' | 'confirmed' | 'cancelled';
  completedAt?: Date;
  notes?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  bookedBy?: mongoose.Types.ObjectId;
  isOffline: boolean;
  method?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema: Schema<IBooking> = new mongoose.Schema(
  {
    user: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quarterName: { type: String, required: true },
    box: { type: mongoose.Schema.Types.ObjectId, ref: 'CricketBox', required: true },
    quarter: { type: mongoose.Schema.Types.ObjectId, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String },
    duration: { type: Number, required: true },
    amountPaid: { type: Number, required: true, default: 500 },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'processing'] },
    sabpaisaTxnId: { type: String },
    sabpaisaPaymentId: { type: String },
    sabpaisaResponse: { type: String },
    contactNumber: { type: String },
    confirmedAt: { type: Date },
    cancelledAt: { type: Date },
    status: { type: String, enum: ['pending', 'completed', 'confirmed', 'cancelled'], default: 'pending' },
    completedAt: { type: Date },
    notes: { type: String },
    startDateTime: { type: Date },
    endDateTime: { type: Date },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isOffline: { type: Boolean, default: false },
    method: String,
  },
  { timestamps: true }
);

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);
export default Booking;
