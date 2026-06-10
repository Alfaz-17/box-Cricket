import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOtp extends Document {
  contactNumber: string;
  otp: string;
  createdAt: Date;
}

const otpSchema: Schema<IOtp> = new mongoose.Schema({
  contactNumber: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // The document will be automatically deleted after 300 seconds (5 minutes)
  },
});

const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>('Otp', otpSchema);
export default Otp;
