const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  type: {
    type: String,
    enum: ['text', 'audio', 'preset', 'research', 'tutorial'],
    default: 'text'
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'audio', 'document']
    },
    url: String,
    filename: String,
    size: Number
  }],
  audioFrequency: {
    baseFreq: Number,
    deltaFreq: Number,
    duration: Number,
    audioMode: {
      type: String,
      enum: ['binaural', 'isochronic', 'mono']
    }
  },
  preset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Preset'
  },
  tags: [{
    type: String,
    enum: [
      'delta-waves',
      'theta-waves',
      'alpha-waves',
      'beta-waves',
      'gamma-waves',
      'meditation',
      'focus',
      'sleep',
      'creativity',
      'healing',
      'research',
      'tutorial',
      'binaural-beats',
      'isochronic-tones',
      'frequency-therapy',
      'consciousness',
      'neuroscience',
      'brainwave-entrainment'
    ]
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  isEducational: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ tags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'likes.user': 1 });

module.exports = mongoose.model('Post', postSchema);