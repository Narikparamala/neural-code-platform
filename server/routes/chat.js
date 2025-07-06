const express = require('express');
const { body, validationResult } = require('express-validator');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create chat room
router.post('/rooms', auth, [
  body('name')
    .isLength({ min: 3, max: 100 })
    .withMessage('Room name must be between 3 and 100 characters'),
  body('type')
    .isIn(['public', 'private', 'educational', 'research'])
    .withMessage('Invalid room type'),
  body('category')
    .isIn(['general', 'meditation', 'research', 'frequency-therapy', 'consciousness', 'neuroscience', 'beginners', 'advanced', 'support'])
    .withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, type, category, maxMembers, rules } = req.body;

    const room = new ChatRoom({
      name,
      description,
      type,
      category,
      creator: req.userId,
      maxMembers: maxMembers || 100,
      rules: rules || [],
      members: [{
        user: req.userId,
        role: 'admin'
      }]
    });

    await room.save();
    await room.populate('creator', 'username avatar');
    await room.populate('members.user', 'username avatar');

    res.status(201).json({
      message: 'Chat room created successfully',
      room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat rooms
router.get('/rooms', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, type, search } = req.query;

    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const rooms = await ChatRoom.find(query)
      .populate('creator', 'username avatar')
      .populate('members.user', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ lastActivity: -1 });

    const total = await ChatRoom.countDocuments(query);

    res.json({
      rooms,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single room
router.get('/rooms/:roomId', auth, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId)
      .populate('creator', 'username avatar reputation')
      .populate('members.user', 'username avatar reputation');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is a member or if room is public
    const isMember = room.members.some(
      member => member.user._id.toString() === req.userId
    );

    if (!isMember && room.type === 'private') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ room });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join room
router.post('/rooms/:roomId/join', auth, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if already a member
    const isMember = room.members.some(
      member => member.user.toString() === req.userId
    );

    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this room' });
    }

    // Check room capacity
    if (room.members.length >= room.maxMembers) {
      return res.status(400).json({ message: 'Room is full' });
    }

    room.members.push({
      user: req.userId,
      role: 'member'
    });

    room.lastActivity = new Date();
    await room.save();

    await room.populate('members.user', 'username avatar');

    res.json({
      message: 'Joined room successfully',
      room
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave room
router.post('/rooms/:roomId/leave', auth, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is a member
    const memberIndex = room.members.findIndex(
      member => member.user.toString() === req.userId
    );

    if (memberIndex === -1) {
      return res.status(400).json({ message: 'Not a member of this room' });
    }

    // Don't allow creator to leave if there are other members
    const member = room.members[memberIndex];
    if (member.role === 'admin' && room.members.length > 1) {
      return res.status(400).json({ 
        message: 'Transfer admin role before leaving or delete the room' 
      });
    }

    room.members.splice(memberIndex, 1);

    // If no members left, deactivate room
    if (room.members.length === 0) {
      room.isActive = false;
    }

    await room.save();

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get room messages
router.get('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // Check if user is a member
    const room = await ChatRoom.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const isMember = room.members.some(
      member => member.user.toString() === req.userId
    );

    if (!isMember && room.type === 'private') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ 
      room: req.params.roomId,
      isDeleted: false 
    })
      .populate('sender', 'username avatar reputation')
      .populate('replyTo', 'content sender')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/rooms/:roomId/messages', auth, [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is a member
    const room = await ChatRoom.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const isMember = room.members.some(
      member => member.user.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Must be a member to send messages' });
    }

    const { content, type, replyTo, attachments } = req.body;

    const message = new Message({
      room: req.params.roomId,
      sender: req.userId,
      content,
      type: type || 'text',
      replyTo,
      attachments: attachments || []
    });

    await message.save();

    // Update room last activity
    room.lastActivity = new Date();
    await room.save();

    await message.populate('sender', 'username avatar reputation');
    if (replyTo) {
      await message.populate('replyTo', 'content sender');
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's rooms
router.get('/my-rooms', auth, async (req, res) => {
  try {
    const rooms = await ChatRoom.find({
      'members.user': req.userId,
      isActive: true
    })
      .populate('creator', 'username avatar')
      .populate('members.user', 'username avatar')
      .sort({ lastActivity: -1 });

    res.json({ rooms });
  } catch (error) {
    console.error('Get user rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;