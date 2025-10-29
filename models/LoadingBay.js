import mongoose from 'mongoose';

const LoadingBaySchema = new mongoose.Schema({
  bayNumber: {
    type: String,
    required: true,
    unique: true
  },
  bayName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
  },
  currentTruck: {
    truckId: String,
    driverId: mongoose.Schema.Types.ObjectId,
    assignedAt: Date,
    estimatedDeparture: Date
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

LoadingBaySchema.index({ status: 1, isActive: 1 });
LoadingBaySchema.index({ bayNumber: 1 });

export default mongoose.models.LoadingBay || mongoose.model('LoadingBay', LoadingBaySchema);