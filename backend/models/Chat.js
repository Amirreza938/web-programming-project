const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'location', 'contact', 'system'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  attachments: [{
    url: String,
    type: String,
    name: String,
    size: Number
  }]
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
    required: true
  },
  
  messages: [messageSchema],
  
  lastMessage: messageSchema,
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isSuspicious: {
    type: Boolean,
    default: false
  },
  
  suspiciousReasons: [String],
  
  metadata: {
    totalMessages: {
      type: Number,
      default: 0
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
chatSchema.index({ participants: 1 });
chatSchema.index({ ad: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ 'messages.timestamp': -1 });

// Update message count on save
chatSchema.pre('save', function(next) {
  this.metadata.totalMessages = this.messages.length;
  next();
});

module.exports = mongoose.model('Chat', chatSchema);
