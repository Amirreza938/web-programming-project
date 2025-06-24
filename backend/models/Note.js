const mongoose = require('mongoose');

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
  }
}, {
  timestamps: true
});

// Compound index to ensure one note per user per ad
noteSchema.index({ user: 1, ad: 1 }, { unique: true });

module.exports = mongoose.model('Note', noteSchema);
