const express = require('express');
const { body, validationResult } = require('express-validator');
const Preset = require('../models/Preset');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create preset
router.post('/', auth, [
  body('name')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('type')
    .isIn(['frequency', 'meditation', 'focus', 'sleep', 'custom'])
    .withMessage('Invalid preset type'),
  body('category')
    .isIn(['sleep', 'meditation', 'focus', 'creativity', 'relaxation', 'healing', 'study', 'energy', 'custom'])
    .withMessage('Invalid category'),
  body('configuration.baseFreq')
    .isNumeric()
    .withMessage('Base frequency must be a number'),
  body('configuration.deltaFreq')
    .isNumeric()
    .withMessage('Delta frequency must be a number'),
  body('configuration.audioMode')
    .isIn(['binaural', 'isochronic', 'mono'])
    .withMessage('Invalid audio mode')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const preset = new Preset({
      ...req.body,
      creator: req.userId
    });

    await preset.save();

    // Add preset to user's presets array
    await User.findByIdAndUpdate(req.userId, {
      $push: { presets: preset._id }
    });

    await preset.populate('creator', 'username avatar reputation');

    res.status(201).json({
      message: 'Preset created successfully',
      preset
    });
  } catch (error) {
    console.error('Create preset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get presets
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      type, 
      tags, 
      sort = 'recent',
      search 
    } = req.query;

    let query = { isPublic: true };

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { downloads: -1 };
        break;
      case 'rating':
        sortOption = { 'rating.average': -1 };
        break;
      case 'recent':
      default:
        sortOption = { createdAt: -1 };
    }

    const presets = await Preset.find(query)
      .populate('creator', 'username avatar reputation isVerified')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOption);

    const total = await Preset.countDocuments(query);

    res.json({
      presets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get presets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single preset
router.get('/:presetId', async (req, res) => {
  try {
    const preset = await Preset.findById(req.params.presetId)
      .populate('creator', 'username avatar reputation isVerified')
      .populate('rating.reviews.user', 'username avatar');

    if (!preset) {
      return res.status(404).json({ message: 'Preset not found' });
    }

    res.json({ preset });
  } catch (error) {
    console.error('Get preset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download preset
router.post('/:presetId/download', auth, async (req, res) => {
  try {
    const preset = await Preset.findById(req.params.presetId);
    if (!preset) {
      return res.status(404).json({ message: 'Preset not found' });
    }

    // Increment download count
    preset.downloads += 1;
    await preset.save();

    res.json({
      message: 'Preset downloaded successfully',
      preset: {
        name: preset.name,
        configuration: preset.configuration,
        category: preset.category,
        tags: preset.tags
      }
    });
  } catch (error) {
    console.error('Download preset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rate preset
router.post('/:presetId/rate', auth, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const preset = await Preset.findById(req.params.presetId);
    if (!preset) {
      return res.status(404).json({ message: 'Preset not found' });
    }

    const { rating, comment } = req.body;

    // Check if user already rated this preset
    const existingReviewIndex = preset.rating.reviews.findIndex(
      review => review.user.toString() === req.userId
    );

    if (existingReviewIndex > -1) {
      // Update existing review
      preset.rating.reviews[existingReviewIndex].rating = rating;
      preset.rating.reviews[existingReviewIndex].comment = comment;
    } else {
      // Add new review
      preset.rating.reviews.push({
        user: req.userId,
        rating,
        comment
      });
    }

    // Recalculate average rating
    const totalRating = preset.rating.reviews.reduce((sum, review) => sum + review.rating, 0);
    preset.rating.average = totalRating / preset.rating.reviews.length;
    preset.rating.count = preset.rating.reviews.length;

    await preset.save();

    res.json({
      message: 'Rating submitted successfully',
      rating: {
        average: preset.rating.average,
        count: preset.rating.count
      }
    });
  } catch (error) {
    console.error('Rate preset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's presets
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const presets = await Preset.find({ 
      creator: req.params.userId,
      isPublic: true 
    })
      .populate('creator', 'username avatar reputation isVerified')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Preset.countDocuments({ 
      creator: req.params.userId,
      isPublic: true 
    });

    res.json({
      presets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get user presets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete preset
router.delete('/:presetId', auth, async (req, res) => {
  try {
    const preset = await Preset.findById(req.params.presetId);
    if (!preset) {
      return res.status(404).json({ message: 'Preset not found' });
    }

    // Check if user is the creator
    if (preset.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this preset' });
    }

    await Preset.findByIdAndDelete(req.params.presetId);

    // Remove preset from user's presets array
    await User.findByIdAndUpdate(req.userId, {
      $pull: { presets: req.params.presetId }
    });

    res.json({ message: 'Preset deleted successfully' });
  } catch (error) {
    console.error('Delete preset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;