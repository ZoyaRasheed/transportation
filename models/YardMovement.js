import mongoose from 'mongoose';

const YardMovementSchema = new mongoose.Schema({
  truckRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TruckRequest',
    required: true
  },
  truckId: {
    type: String,
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movementType: {
    type: String,
    enum: ['entry', 'queue', 'bay_assigned', 'loading', 'departure'],
    required: true
  },
  fromLocation: {
    type: String
  },
  toLocation: {
    type: String,
    required: true
  },
  loadingBayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoadingBay'
  },
  switcherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String
  },
  estimatedTime: {
    type: Date
  },
  actualTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

YardMovementSchema.index({ truckRequestId: 1, createdAt: -1 });
YardMovementSchema.index({ truckId: 1, createdAt: -1 });
YardMovementSchema.index({ switcherId: 1, createdAt: -1 });
YardMovementSchema.index({ movementType: 1, createdAt: -1 });

export default mongoose.models.YardMovement || mongoose.model('YardMovement', YardMovementSchema);