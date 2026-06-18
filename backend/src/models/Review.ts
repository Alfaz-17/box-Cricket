import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IReviewDoc extends Document {
  boxId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  comment: string;
  name?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHelpAndSupport extends Document {
  name: string;
  contactNumber: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewsSchema: Schema<IReviewDoc> = new mongoose.Schema(
  {
    boxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Box',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    name: String, // Name of the reviewer
    rating: Number, // Rating for this review
  },
  { timestamps: true }
);

const HelpAndSupportSchema: Schema<IHelpAndSupport> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Review: Model<IReviewDoc> = mongoose.models.Review || mongoose.model<IReviewDoc>('Review', ReviewsSchema);
export const HelpAndSupport: Model<IHelpAndSupport> = mongoose.models.HelpAndSupport || mongoose.model<IHelpAndSupport>('HelpAndSupport', HelpAndSupportSchema);
