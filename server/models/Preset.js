const mongoose = require('mongoose');

const presetSchema = new mongoose.Schema({
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
    enum: ['frequency', 'meditation', 'focus', 'sleep', 'custom'],
    required: true
  },
  configuration: {
    baseFreq: {
      type: Number,
      required: true
    },
    deltaFreq: {
      type: Number,
      required: true
    },
    audioMode: {
      type: String,
      enum: ['binaural', 'isochronic', 'mono'],
      required: true
    },
    duration: {
      type: Number,
      default: 1800 // 30 minutes
    },
    volume: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1
    },
    backgroundSounds: [{
      type: {
        type: String,
        enum: ['white', 'pink', 'brown', 'nature']
      },
      volume: {
        type: Number,
        min: 0,
        max: 1
      },
      enabled: Boolean
    }],
    rampingEnabled: {
      type: Boolean,
      default: false
    },
    rampDuration: Number,
    startFreq: Number,
    endFreq: Number
  },
  category: {
    type: String,
    enum: [
      'sleep',
      'meditation',
      'focus',
      'creativity',
      'relaxation',
      'healing',
      'study',
      'energy',
      'custom'
    ],
    required: true
  },
  tags: [{
    type: String,
    enum: [
      'delta',
      'theta',
      'alpha',
      'beta',
      'gamma',
      'binaural',
      'isochronic',
      'mono',
      'beginner',
      'intermediate',
      'advanced',
      'research-based',
      'clinical'
    ]
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    },
    reviews: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  usage: {
    totalSessions: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for search and filtering
presetSchema.index({ category: 1, tags: 1 });
presetSchema.index({ 'rating.average': -1 });
presetSchema.index({ downloads: -1 });
presetSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Preset', presetSchema);