import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['invite', 'join_request', 'added'],
    required: true,
  },
  message: String,
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});


export default  mongoose.model('Notification', notificationSchema);

