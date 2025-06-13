// ===== src/models/User.js =====
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  fullName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  },
  profileImg: {
    type: String
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  authProvider: {
    type: String,
    enum: ['email', 'google', 'facebook'],
    default: 'email'
  },
  googleId: {
    type: String,
    sparse: true,
    index: true
  },
  facebookId: {
    type: String,
    sparse: true,
    index: true
  },
  otp: {
    type: String,
    select: false
  },
  otpExpiresAt: {
    type: Date,
    select: false
  },
  refreshToken: {
    type: String,
    select: false
  },
  deviceTokens: [{
    token: String,
    deviceId: String,
    platform: {
      type: String,
      enum: ['ios', 'android', 'web']
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }],
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for profile completion percentage
userSchema.virtual('profileCompletionPercentage').get(function () {
  let completed = 0;
  const fields = ['email', 'fullName', 'phone', 'profileImg'];
  fields.forEach(field => {
    if (this[field]) completed++;
  });
  return Math.round((completed / fields.length) * 100);
});

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.otp;
  delete obj.otpExpiresAt;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
