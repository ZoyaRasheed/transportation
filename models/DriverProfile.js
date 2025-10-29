import mongoose from 'mongoose';

const DriverProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  licenseExpiry: {
    type: Date,
    required: true
  },
  licenseType: {
    type: String,
    enum: ['LMV', 'HMV', 'TRANSPORT'],
    required: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  experience: {
    years: Number,
    previousCompanies: [String]
  },
  currentTruckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Truck'
  },
  status: {
    type: String,
    enum: ['available', 'assigned', 'on_trip', 'on_leave', 'off_duty'],
    default: 'available'
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    lastUpdated: Date
  },
  ratings: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  documents: {
    license: String, // URL to license image
    aadhar: String,  // URL to aadhar image
    pan: String,     // URL to pan image
    photo: String    // URL to driver photo
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

DriverProfileSchema.index({ userId: 1 });
DriverProfileSchema.index({ status: 1, isActive: 1 });
DriverProfileSchema.index({ licenseNumber: 1 });

export default mongoose.models.DriverProfile || mongoose.model('DriverProfile', DriverProfileSchema);