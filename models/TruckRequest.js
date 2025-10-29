import mongoose from 'mongoose';

const TruckRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loadId: {
    type: String,
    required: true
  },
  loadDescription: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  pickupLocation: {
    type: String,
    required: true
  },
  deliveryLocation: {
    type: String,
    required: true
  },
  estimatedWeight: {
    type: Number
  },
  requestedTime: {
    type: Date,
    default: Date.now
  },
  requiredTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedTruck: {
    truckId: String,
    driverId: mongoose.Schema.Types.ObjectId,
    assignedAt: Date,
    assignedBy: mongoose.Schema.Types.ObjectId
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

TruckRequestSchema.index({ requesterId: 1, status: 1 });
TruckRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.TruckRequest || mongoose.model('TruckRequest', TruckRequestSchema);