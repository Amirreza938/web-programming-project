const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Profile
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500
  },
  city: {
    type: String,
    required: true
  },
  
  // Verification Status
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isIdentityVerified: {
    type: Boolean,
    default: false
  },
  identityVerificationData: {
    nationalId: String,
    documents: [String], // URLs to uploaded documents
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    submittedAt: Date,
    reviewedAt: Date
  },
  
  // Professional Account
  isProfessional: {
    type: Boolean,
    default: false
  },
  professionalInfo: {
    businessName: String,
    businessType: String,
    upgradedAt: Date,
    features: [String]
  },
  
  // Chat Settings
  chatDisplayName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  chatSettings: {
    showAnonymousCalls: {
      type: Boolean,
      default: false
    },
    showInactiveChats: {
      type: Boolean,
      default: true
    },
    showDisabledChats: {
      type: Boolean,
      default: false
    },
    autoFilterSuspicious: {
      type: Boolean,
      default: true
    },
    availabilityHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '18:00'
      }
    }
  },
  
  // Settings
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
      vibration: { type: Boolean, default: true }
    },
    privacy: {
      showPhone: { type: Boolean, default: true },
      showOnlineStatus: { type: Boolean, default: true }
    },
    suggestedAds: {
      type: Boolean,
      default: true
    }
  },
  
  // Security
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  activeSessions: [{
    sessionId: String,
    deviceInfo: String,
    ipAddress: String,
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
  }],
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get public profile data
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.activeSessions;
  delete userObject.identityVerificationData;
  delete userObject.settings;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
