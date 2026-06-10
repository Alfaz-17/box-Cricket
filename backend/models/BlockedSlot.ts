import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBlockedSlot extends Document {
  boxId: mongoose.Types.ObjectId;
  quarterName?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  quarterId: mongoose.Types.ObjectId;
}

const BlockedSlotSchema: Schema<IBlockedSlot> = new mongoose.Schema({
  boxId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box',
    required: true,
  },
  quarterName: String,
  date: {
    type: String, // or Date
    required: true,
  },
  startTime: String, // e.g., "2:00 AM"
  endTime: String,
  reason: String, // Optional (e.g., maintenance, holiday)
  quarterId: { type: mongoose.Schema.Types.ObjectId, required: true },
});

const BlockedSlot: Model<IBlockedSlot> = mongoose.models.BlockedSlot || mongoose.model<IBlockedSlot>('BlockedSlot', BlockedSlotSchema);
export default BlockedSlot;
