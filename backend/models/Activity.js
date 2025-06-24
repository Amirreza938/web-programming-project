const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['view', 'search', 'bookmark', 'contact'],
    required: true
  },
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad'
  },
  searchQuery: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ user: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
