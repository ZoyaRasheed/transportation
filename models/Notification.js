import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['truck_request', 'status_update', 'assignment', 'general'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    truckRequestId: mongoose.Schema.Types.ObjectId,
    status: String,
    priority: String,
    actionUrl: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  pushSent: {
    type: Boolean,
    default: false
  },
  pushSentAt: {
    type: Date
  }
}, {
  timestamps: true
});

NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, isRead: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);