import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['loader', 'switcher', 'dispatcher', 'supervisor', 'admin'],
    default: 'loader'
  },
  department: {
    type: String,
    required: true,
    enum: ['loading', 'transportation', 'management', 'admin'],
    default: 'loading'
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deviceTokens: [{
    type: String
  }],
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    }
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.deviceTokens;
  return userObject;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);