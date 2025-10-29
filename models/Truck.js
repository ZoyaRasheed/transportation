import mongoose from 'mongoose';

const TruckSchema = new mongoose.Schema({
  truckNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  plateNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  capacity: {
    type: Number,
    required: true // in kg
  },
  type: {
    type: String,
    required: true,
    enum: ['container', 'flatbed', 'refrigerated', 'tanker', 'van'],
    default: 'container'
  },
  status: {
    type: String,
    enum: ['available', 'assigned', 'maintenance', 'out_of_service'],
    default: 'available'
  },
  currentLocation: {
    type: String,
    trim: true
  },
  assignedDriverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  currentRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TruckRequest'
  },
  specifications: {
    length: Number, // in meters
    width: Number,  // in meters
    height: Number, // in meters
    fuelType: {
      type: String,
      enum: ['diesel', 'petrol', 'electric', 'hybrid'],
      default: 'diesel'
    }
  },
  maintenance: {
    lastService: Date,
    nextService: Date,
    mileage: Number // in km
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

TruckSchema.index({ status: 1, isActive: 1 });
TruckSchema.index({ truckNumber: 1 });
TruckSchema.index({ assignedDriverId: 1 });

export default mongoose.models.Truck || mongoose.model('Truck', TruckSchema);