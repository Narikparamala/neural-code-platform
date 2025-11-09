# Neural Code Platform - Consciousness Sync

A comprehensive MERN stack platform for consciousness exploration, neural frequency research, and educational content sharing.

## Features

### Frontend (React + TypeScript)
- **Neural Labs**: Rate Lab, Place Lab, Population Lab, Monroe Research Hub, Frequency Laboratory
- **Real-time Chat**: Socket.IO powered messaging with rooms and direct messages
- **Social Features**: Instagram-like profiles, educational posts, preset sharing
- **Authentication**: JWT-based login/signup system
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend (Node.js + Express)
- **RESTful API**: Complete CRUD operations for users, posts, presets, chat
- **Real-time Communication**: Socket.IO for instant messaging and collaboration
- **MongoDB Integration**: Mongoose ODM with optimized schemas
- **File Upload**: Multer integration for media handling
- **Security**: Helmet, CORS, rate limiting, input validation

### Database (MongoDB Atlas)
- **User Management**: Profiles, authentication, expertise tracking
- **Content System**: Posts, comments, likes, educational content
- **Chat System**: Rooms, messages, real-time communication
- **Preset Library**: Frequency configurations, sharing, ratings

## Quick Start

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure your MongoDB Atlas URI and JWT secret
npm run dev
```

### Frontend Setup
```bash
npm install
npm run dev
```

### Environment Variables
Create `.env` in the server directory:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/consciousness-sync
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:5173
PORT=5000
```

## Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy as a Web Service

### Frontend (Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables for production API URL

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Configure network access and database user
3. Use the connection string in your environment variables

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile/:userId` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/follow/:userId` - Follow/unfollow user

### Posts
- `GET /api/posts/feed` - Get posts feed
- `POST /api/posts` - Create post
- `POST /api/posts/:postId/like` - Like/unlike post
- `POST /api/posts/:postId/comment` - Add comment

### Chat
- `GET /api/chat/rooms` - Get chat rooms
- `POST /api/chat/rooms` - Create room
- `POST /api/chat/rooms/:roomId/join` - Join room
- `GET /api/chat/rooms/:roomId/messages` - Get messages

### Presets
- `GET /api/presets` - Get presets
- `POST /api/presets` - Create preset
- `POST /api/presets/:presetId/download` - Download preset

## Socket.IO Events

### Client to Server
- `user_join` - User joins with authentication
- `join_room` - Join a chat room
- `send_message` - Send message to room
- `typing_start/stop` - Typing indicators
- `share_preset` - Share frequency preset

### Server to Client
- `receive_message` - Receive new message
- `user_typing` - User typing notification
- `user_online/offline` - User status updates
- `preset_shared` - Preset sharing notification

## Features Overview

### Educational Content System
- **Strict Content Guidelines**: Only educational, research-based content
- **Expertise Tags**: Users can tag their areas of expertise
- **Reputation System**: Community-driven quality control
- **Media Support**: Images, audio files, research documents

### Real-time Collaboration
- **Chat Rooms**: Public, private, educational, research categories
- **Direct Messaging**: One-on-one conversations
- **Preset Sharing**: Share frequency configurations in real-time
- **Typing Indicators**: Live typing status
- **Online Status**: See who's currently active

### Neural Frequency Labs
- **Rate Lab**: Binaural beats, isochronic tones, neural firing simulation
- **Place Lab**: 3D spatial audio with HRTF processing
- **Population Lab**: Neural cluster dynamics and attention training
- **Monroe Research Hub**: Hemi-Sync® protocols and consciousness research
- **Frequency Laboratory**: Advanced multi-method brainwave entrainment

### Profile System
- **Instagram-like Interface**: Visual profile with posts, followers, following
- **Expertise Showcase**: Display areas of knowledge and research
- **Content Portfolio**: Share presets, research, educational content
- **Reputation Tracking**: Community recognition system

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Express-validator for all inputs
- **Rate Limiting**: Prevent spam and abuse
- **CORS Protection**: Secure cross-origin requests
- **Helmet Security**: Security headers and protection
- **File Upload Limits**: Secure file handling with size limits

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Socket.IO Client for real-time features
- Lucide React for icons
- Three.js for 3D visualizations

### Backend
- Node.js with Express
- Socket.IO for real-time communication
- MongoDB with Mongoose ODM
- JWT for authentication
- Multer for file uploads
- Express-validator for input validation

### DevOps
- Render for backend deployment
- Netlify for frontend deployment
- MongoDB Atlas for database hosting
- GitHub for version control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.