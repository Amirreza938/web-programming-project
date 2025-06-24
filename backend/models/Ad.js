const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      'vehicles', 'real-estate', 'electronics', 'home-garden',
      'fashion-beauty', 'entertainment', 'services', 'jobs',
      'community', 'business-industrial', 'others'
    ]
  },
  subcategory: {
    type: String,
    required: true
  },
  
  // Location
  city: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  
  // Media
  images: [{
    url: String,
    alt: String,
    order: Number
  }],
  
  // Owner Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'sold', 'deleted'],
    default: 'draft'
  },
  
  // Features
  features: {
    isUrgent: { type: Boolean, default: false },
    isNegotiable: { type: Boolean, default: true },
    condition: {
      type: String,
      enum: ['new', 'like-new', 'good', 'fair', 'poor'],
      required: true
    },
    exchange: { type: Boolean, default: false }
  },
  
  // Statistics
  stats: {
    views: { type: Number, default: 0 },
    contacts: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 },
    chats: { type: Number, default: 0 }
  },
  
  // Professional Features
  isProfessionalAd: {
    type: Boolean,
    default: false
  },
  promotionData: {
    isPromoted: { type: Boolean, default: false },
    promotedUntil: Date,
    promotionType: {
      type: String,
      enum: ['highlight', 'top-list', 'urgent']
    }
  },
  
  // Moderation
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  
  // Metadata
  publishedAt: Date,
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
adSchema.index({ city: 1, category: 1, status: 1 });
adSchema.index({ owner: 1, status: 1 });
adSchema.index({ location: '2dsphere' });
adSchema.index({ createdAt: -1 });
adSchema.index({ 'stats.views': -1 });

// Pre-save middleware
adSchema.pre('save', function(next) {
  if (this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Virtual for time remaining
adSchema.virtual('timeRemaining').get(function() {
  if (!this.expiresAt) return null;
  const now = new Date();
  const remaining = this.expiresAt - now;
  return remaining > 0 ? remaining : 0;
});

// Methods
adSchema.methods.incrementView = function() {
  this.stats.views += 1;
  return this.save();
};

adSchema.methods.incrementContact = function() {
  this.stats.contacts += 1;
  return this.save();
};

module.exports = mongoose.model('Ad', adSchema);
