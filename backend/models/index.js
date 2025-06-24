const mongoose = require('mongoose');

// Bookmark Schema
const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
    required: true
  },
  note: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Note Schema
const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  isPrivate: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Recent Activity Schema
const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
    required: true
  },
  activityType: {
    type: String,
    enum: ['view', 'contact', 'bookmark', 'search'],
    required: true
  },
  metadata: {
    searchQuery: String,
    contactMethod: String,
    deviceInfo: String
  }
}, {
  timestamps: true
});

// Report Schema
const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportedAd: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad'
  },
  reportType: {
    type: String,
    enum: ['spam', 'scam', 'inappropriate', 'fake', 'harassment', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNotes: String,
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Phone Verification Schema
const phoneVerificationSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    }
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  }
}, {
  timestamps: true
});

// Password Reset Schema
const passwordResetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    }
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
bookmarkSchema.index({ user: 1, ad: 1 }, { unique: true });
noteSchema.index({ user: 1, ad: 1 });
activitySchema.index({ user: 1, createdAt: -1 });
reportSchema.index({ reporter: 1, status: 1 });
phoneVerificationSchema.index({ phoneNumber: 1, expiresAt: 1 });
passwordResetSchema.index({ token: 1, expiresAt: 1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
const Note = mongoose.model('Note', noteSchema);
const Activity = mongoose.model('Activity', activitySchema);
const Report = mongoose.model('Report', reportSchema);
const PhoneVerification = mongoose.model('PhoneVerification', phoneVerificationSchema);
const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = {
  Bookmark,
  Note,
  Activity,
  Report,
  PhoneVerification,
  PasswordReset
};
