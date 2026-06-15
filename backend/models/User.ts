import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  contactNumber?: string;
  googleId?: string;
  otp?: string;
  password?: string;
  role: 'user' | 'owner';
  ownerCode?: string;
  profileImg?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contactNumber: { type: String, unique: true, sparse: true },
    googleId: { type: String, unique: true, sparse: true },
    otp: { type: String }, // optional, for storing latest OTP
    password: { type: String },
    role: {
      type: String,
      enum: ['user', 'owner'],
      default: 'user',
    },
    ownerCode: { type: String, default: null },
    profileImg: { type: String, default: '' },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;
