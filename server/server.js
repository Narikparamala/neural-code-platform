const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const chatRoutes = require('./routes/chat');
const presetRoutes = require('./routes/presets');

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://kiran_rol:<QVfGYxCJp0zHfv0P>@conscioussynccluster.bgcmsyb.mongodb.net/consciousness_sync?retryWrites=true&w=majority&appName=ConsciousSyncCluster', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/presets', presetRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
const activeUsers = new Map();
const chatRooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with authentication
  socket.on('user_join', (userData) => {
    activeUsers.set(socket.id, {
      userId: userData.userId,
      username: userData.username,
      avatar: userData.avatar,
      status: 'online'
    });
    
    // Broadcast user online status
    socket.broadcast.emit('user_online', {
      userId: userData.userId,
      username: userData.username
    });
  });

  // Join chat room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    
    if (!chatRooms.has(roomId)) {
      chatRooms.set(roomId, new Set());
    }
    chatRooms.get(roomId).add(socket.id);
    
    // Notify room members
    socket.to(roomId).emit('user_joined_room', {
      userId: activeUsers.get(socket.id)?.userId,
      username: activeUsers.get(socket.id)?.username
    });
  });

  // Leave chat room
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    
    if (chatRooms.has(roomId)) {
      chatRooms.get(roomId).delete(socket.id);
      if (chatRooms.get(roomId).size === 0) {
        chatRooms.delete(roomId);
      }
    }
    
    // Notify room members
    socket.to(roomId).emit('user_left_room', {
      userId: activeUsers.get(socket.id)?.userId,
      username: activeUsers.get(socket.id)?.username
    });
  });

  // Handle chat messages
  socket.on('send_message', (data) => {
    const user = activeUsers.get(socket.id);
    if (!user) return;

    const messageData = {
      id: Date.now().toString(),
      roomId: data.roomId,
      userId: user.userId,
      username: user.username,
      avatar: user.avatar,
      message: data.message,
      timestamp: new Date(),
      type: data.type || 'text'
    };

    // Send to room members
    io.to(data.roomId).emit('receive_message', messageData);
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const user = activeUsers.get(socket.id);
    if (!user) return;
    
    socket.to(data.roomId).emit('user_typing', {
      userId: user.userId,
      username: user.username
    });
  });

  socket.on('typing_stop', (data) => {
    const user = activeUsers.get(socket.id);
    if (!user) return;
    
    socket.to(data.roomId).emit('user_stop_typing', {
      userId: user.userId
    });
  });

  // Handle preset sharing
  socket.on('share_preset', (data) => {
    const user = activeUsers.get(socket.id);
    if (!user) return;

    io.to(data.roomId).emit('preset_shared', {
      userId: user.userId,
      username: user.username,
      preset: data.preset,
      timestamp: new Date()
    });
  });

  // Handle frequency session sharing
  socket.on('share_frequency_session', (data) => {
    const user = activeUsers.get(socket.id);
    if (!user) return;

    io.to(data.roomId).emit('frequency_session_shared', {
      userId: user.userId,
      username: user.username,
      session: data.session,
      timestamp: new Date()
    });
  });

  // Handle random chat matching
  socket.on('find_random_chat', () => {
    const user = activeUsers.get(socket.id);
    if (!user) return;

    // Find another user looking for random chat
    const waitingUsers = Array.from(activeUsers.entries())
      .filter(([id, userData]) => 
        id !== socket.id && 
        userData.status === 'looking_for_chat'
      );

    if (waitingUsers.length > 0) {
      const [partnerId, partnerData] = waitingUsers[0];
      const roomId = `random_${Date.now()}`;

      // Join both users to the room
      socket.join(roomId);
      io.sockets.sockets.get(partnerId)?.join(roomId);

      // Update status
      activeUsers.get(socket.id).status = 'in_chat';
      activeUsers.get(partnerId).status = 'in_chat';

      // Notify both users
      io.to(roomId).emit('random_chat_matched', {
        roomId,
        partner: {
          userId: partnerData.userId,
          username: partnerData.username,
          avatar: partnerData.avatar
        }
      });
    } else {
      // Set user as waiting
      activeUsers.get(socket.id).status = 'looking_for_chat';
      socket.emit('waiting_for_match');
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      // Broadcast user offline status
      socket.broadcast.emit('user_offline', {
        userId: user.userId
      });
      
      // Remove from all rooms
      chatRooms.forEach((members, roomId) => {
        if (members.has(socket.id)) {
          members.delete(socket.id);
          socket.to(roomId).emit('user_left_room', {
            userId: user.userId,
            username: user.username
          });
        }
      });
    }
    
    activeUsers.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});