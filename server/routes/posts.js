const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Create post
router.post('/', auth, upload.array('media', 5), [
  body('title')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  body('type')
    .isIn(['text', 'audio', 'preset', 'research', 'tutorial'])
    .withMessage('Invalid post type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      content,
      type,
      tags,
      audioFrequency,
      preset
    } = req.body;

    // Process uploaded files
    const media = req.files ? req.files.map(file => ({
      type: file.mimetype.startsWith('image/') ? 'image' : 
            file.mimetype.startsWith('audio/') ? 'audio' : 'document',
      url: file.path,
      filename: file.originalname,
      size: file.size
    })) : [];

    const post = new Post({
      author: req.userId,
      title,
      content,
      type,
      media,
      tags: tags ? JSON.parse(tags) : [],
      audioFrequency: audioFrequency ? JSON.parse(audioFrequency) : undefined,
      preset
    });

    await post.save();

    // Add post to user's posts array
    await User.findByIdAndUpdate(req.userId, {
      $push: { posts: post._id }
    });

    // Populate author info
    await post.populate('author', 'username avatar reputation isVerified');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get posts feed
router.get('/feed', async (req, res) => {
  try {
    const { page = 1, limit = 10, tags, type, sort = 'recent' } = req.query;

    let query = { isApproved: true };
    
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    
    if (type) {
      query.type = type;
    }

    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { 'likes.length': -1, createdAt: -1 };
        break;
      case 'trending':
        sortOption = { views: -1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar reputation isVerified')
      .populate('preset', 'name description')
      .populate('comments.user', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOption);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'username avatar reputation isVerified')
      .populate('preset')
      .populate('comments.user', 'username avatar reputation');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.userId
    );

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ user: req.userId });
    }

    await post.save();

    res.json({
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:postId/comment', auth, [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.userId,
      content: req.body.content
    };

    post.comments.push(comment);
    await post.save();

    // Populate the new comment
    await post.populate('comments.user', 'username avatar reputation');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.postId);

    // Remove post from user's posts array
    await User.findByIdAndUpdate(req.userId, {
      $pull: { posts: req.params.postId }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search posts
router.get('/search', async (req, res) => {
  try {
    const { q, tags, type, page = 1, limit = 10 } = req.query;

    let query = { isApproved: true };

    if (q) {
      query.$text = { $search: q };
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (type) {
      query.type = type;
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar reputation isVerified')
      .populate('preset', 'name description')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 });

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;