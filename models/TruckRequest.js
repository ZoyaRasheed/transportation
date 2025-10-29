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
    enum: ['pending', 'assigned', 'ready_for_loading', 'in_progress', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedTruck: {
    truckId: mongoose.Schema.Types.ObjectId,
    driverId: mongoose.Schema.Types.ObjectId,
    assignedAt: Date,
    assignedBy: mongoose.Schema.Types.ObjectId
  },
  timeline: {
    assignedAt: Date,
    pickupStarted: Date,
    pickupCompleted: Date,
    deliveryStarted: Date,
    deliveryCompleted: Date,
    returnedToYard: Date
  },
  deliveryProof: {
    pickupImages: [String], // Array of image URLs
    deliveryImages: [String], // Array of image URLs
    receiverName: String,
    receiverSignature: String, // Image URL
    deliveryNotes: String,
    actualWeight: Number,
    actualDeliveryTime: Date
  },
  tracking: {
    currentLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
      lastUpdated: Date
    },
    estimatedArrival: Date,
    distanceCovered: Number, // in km
    fuelUsed: Number // in liters
  },
  notes: {
    type: String
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    submittedBy: mongoose.Schema.Types.ObjectId,
    submittedAt: Date
  }
}, {
  timestamps: true
});

TruckRequestSchema.index({ requesterId: 1, status: 1 });
TruckRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.TruckRequest || mongoose.model('TruckRequest', TruckRequestSchema);