const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['public', 'private', 'educational', 'research'],
    default: 'public'
  },
  category: {
    type: String,
    enum: [
      'general',
      'meditation',
      'research',
      'frequency-therapy',
      'consciousness',
      'neuroscience',
      'beginners',
      'advanced',
      'support'
    ],
    default: 'general'
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxMembers: {
    type: Number,
    default: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  rules: [{
    type: String
  }],
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);