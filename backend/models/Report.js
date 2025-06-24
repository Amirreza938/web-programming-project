const mongoose = require('mongoose');

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
  reportedChat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  },
  type: {
    type: String,
    enum: ['scam', 'spam', 'inappropriate', 'fake', 'harassment', 'other'],
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
    default: 'pending'
  },
  evidence: {
    screenshots: [String],
    messages: [String]
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
