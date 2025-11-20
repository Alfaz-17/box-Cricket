import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Not required for system notifications (e.g., "Your booking was approved by Admin")
  },
  type: {
    type: String,
    enum: [
      'invite', // Group feature
      'join_request', // Group feature
      'added', // Group feature
      'booking_created', // Box booking
      'booking_cancelled',
      'booking_confirmed',
      'review_submitted',
      'box_blocked',
      'system_message', // General system updates
    ],
    required: true,
  },
  message: {
    type: String,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  boxId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CricketBox',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    // Only used for invite or join_request
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    // Optional object to store dynamic key-value pairs for specific cases
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model('Notification', notificationSchema)
