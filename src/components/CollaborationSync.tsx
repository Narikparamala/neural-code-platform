import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Users, Plus, Settings, Send, Smile, 
  Paperclip, Phone, Video, Search, Hash, Lock, 
  Globe, UserPlus, Crown, Shield, Heart, Share2,
  Camera, Mic, Image, FileText, Headphones, Brain,
  LogIn, UserCheck, Mail, Eye, EyeOff, User, X,
  Upload, Download, Star, Zap, Waves
} from 'lucide-react';
import io, { Socket } from 'socket.io-client';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  expertise: string[];
  reputation: number;
  isVerified: boolean;
  followers: any[];
  following: any[];
  posts: any[];
  presets: any[];
}

interface Message {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'preset' | 'frequency' | 'image';
  attachments?: any[];
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'educational' | 'research';
  category: string;
  members: any[];
  creator: any;
  isActive: boolean;
}

interface Post {
  id: string;
  author: User;
  title: string;
  content: string;
  type: 'text' | 'audio' | 'preset' | 'research' | 'tutorial';
  media: any[];
  tags: string[];
  likes: any[];
  comments: any[];
  createdAt: Date;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  creator: User;
  type: string;
  configuration: any;
  category: string;
  tags: string[];
  downloads: number;
  rating: {
    average: number;
    count: number;
  };
}

const CollaborationSync: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  
  // App state
  const [activeView, setActiveView] = useState<'feed' | 'chat' | 'profile' | 'explore' | 'presets'>('feed');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  // UI state
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreatePreset, setShowCreatePreset] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Socket connection
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // API base URL
  const API_BASE = process.env.NODE_ENV === 'production' 
    ? 'https://your-render-app.onrender.com/api' 
    : 'http://localhost:5000/api';

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setShowAuth(true);
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      initializeSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, currentUser]);

  // Fetch initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms();
      fetchPosts();
      fetchPresets();
    }
  }, [isAuthenticated]);

  // Auto-scroll messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-render-app.onrender.com' 
      : 'http://localhost:5000';
    
    socketRef.current = io(socketUrl);

    // Join with user data
    socketRef.current.emit('user_join', {
      userId: currentUser?.id,
      username: currentUser?.username,
      avatar: currentUser?.avatar
    });

    // Socket event listeners
    socketRef.current.on('receive_message', (messageData: Message) => {
      setMessages(prev => [...prev, messageData]);
    });

    socketRef.current.on('user_typing', (data) => {
      setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username]);
    });

    socketRef.current.on('user_stop_typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u !== data.username));
    });

    socketRef.current.on('user_online', (data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    socketRef.current.on('user_offline', (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    socketRef.current.on('preset_shared', (data) => {
      const presetMessage: Message = {
        id: Date.now().toString(),
        roomId: selectedRoom || '',
        userId: data.userId,
        username: data.username,
        avatar: '',
        message: `Shared a preset: ${data.preset.name}`,
        timestamp: new Date(),
        type: 'preset',
        attachments: [data.preset]
      };
      setMessages(prev => [...prev, presetMessage]);
    });
  };

  const fetchCurrentUser = async (token: string) => {
    try {
      setAuthLoading(true);
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setShowAuth(false);
      } else {
        localStorage.removeItem('token');
        setShowAuth(true);
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      setShowAuth(true);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuth = async (formData: any) => {
    try {
      setAuthLoading(true);
      setError('');
      
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setShowAuth(false);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Network error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/chat/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error('Fetch rooms error:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE}/posts/feed`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
    }
  };

  const fetchPresets = async () => {
    try {
      const response = await fetch(`${API_BASE}/presets`);
      if (response.ok) {
        const data = await response.json();
        setPresets(data.presets);
      }
    } catch (error) {
      console.error('Fetch presets error:', error);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/chat/rooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const joinRoom = (roomId: string) => {
    if (selectedRoom) {
      socketRef.current?.emit('leave_room', selectedRoom);
    }
    
    setSelectedRoom(roomId);
    socketRef.current?.emit('join_room', roomId);
    fetchMessages(roomId);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedRoom || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      roomId: selectedRoom,
      message: newMessage,
      type: 'text'
    });

    setNewMessage('');
    setIsTyping(false);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      socketRef.current?.emit('typing_start', { roomId: selectedRoom });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketRef.current?.emit('typing_stop', { roomId: selectedRoom });
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createRoom = async (roomData: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/chat/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(roomData)
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(prev => [data.room, ...prev]);
        setShowCreateRoom(false);
      }
    } catch (error) {
      console.error('Create room error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      Object.keys(postData).forEach(key => {
        if (key === 'media' && postData[key]) {
          Array.from(postData[key]).forEach((file: any) => {
            formData.append('media', file);
          });
        } else if (typeof postData[key] === 'object') {
          formData.append(key, JSON.stringify(postData[key]));
        } else {
          formData.append(key, postData[key]);
        }
      });

      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prev => [data.post, ...prev]);
        setShowCreatePost(false);
      }
    } catch (error) {
      console.error('Create post error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPreset = async (presetData: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/presets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(presetData)
      });

      if (response.ok) {
        const data = await response.json();
        setPresets(prev => [data.preset, ...prev]);
        setShowCreatePreset(false);
      }
    } catch (error) {
      console.error('Create preset error:', error);
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: data.isLiked 
                ? [...post.likes, { user: currentUser?.id }]
                : post.likes.filter(like => like.user !== currentUser?.id)
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Like post error:', error);
    }
  };

  const downloadPreset = async (presetId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/presets/${presetId}/download`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update download count
        setPresets(prev => prev.map(preset => 
          preset.id === presetId 
            ? { ...preset, downloads: preset.downloads + 1 }
            : preset
        ));
        
        // You can implement actual download logic here
        alert('Preset downloaded successfully!');
      }
    } catch (error) {
      console.error('Download preset error:', error);
    }
  };

  // Authentication Modal Component
  const AuthModal = () => {
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
      expertise: []
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleAuth(formData);
    };

    if (authLoading) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-700">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-gray-300">Connecting to Consciousness Sync...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 rounded-xl p-8 max-w-md w-full border border-gray-700"
        >
          <div className="text-center mb-6">
            <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Consciousness Sync
            </h2>
            <p className="text-gray-400 mt-2">
              {authMode === 'login' ? 'Welcome back!' : 'Join the community'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-4 pr-10 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
            >
              {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              {authMode === 'login' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Main Navigation
  const Navigation = () => (
    <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Brain className="w-8 h-8 text-purple-400" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Consciousness Sync
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {[
              { id: 'feed', icon: Hash, label: 'Feed' },
              { id: 'chat', icon: MessageCircle, label: 'Chat' },
              { id: 'presets', icon: Zap, label: 'Presets' },
              { id: 'explore', icon: Search, label: 'Explore' },
              { id: 'profile', icon: User, label: 'Profile' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  activeView === item.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden md:block">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <img
              src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username}`}
              alt={currentUser?.username}
              className="w-8 h-8 rounded-full"
            />
            <span className="hidden md:block text-sm font-medium">{currentUser?.username}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Feed View
  const FeedView = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Knowledge Feed</h2>
        <button
          onClick={() => setShowCreatePost(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Share Knowledge
        </button>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`}
                alt={post.author.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{post.author.username}</span>
                  {post.author.isVerified && (
                    <UserCheck className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2">{post.title}</h3>
            <p className="text-gray-300 mb-4">{post.content}</p>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={() => likePost(post.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                  post.likes.some(like => like.user === currentUser?.id)
                    ? 'bg-red-600/20 text-red-400'
                    : 'hover:bg-gray-700'
                }`}
              >
                <Heart className="w-4 h-4" />
                {post.likes.length}
              </button>
              <button className="flex items-center gap-2 px-3 py-1 hover:bg-gray-700 rounded-lg transition-colors">
                <MessageCircle className="w-4 h-4" />
                {post.comments.length}
              </button>
              <button className="flex items-center gap-2 px-3 py-1 hover:bg-gray-700 rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Presets View
  const PresetsView = () => (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Frequency Presets Library</h2>
        <button
          onClick={() => setShowCreatePreset(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Preset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presets.map((preset) => (
          <motion.div
            key={preset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <Waves className="w-8 h-8 text-cyan-400" />
              <div>
                <h3 className="font-bold">{preset.name}</h3>
                <p className="text-sm text-gray-400">{preset.category}</p>
              </div>
            </div>

            <p className="text-gray-300 mb-4 text-sm">{preset.description}</p>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">{preset.rating.average.toFixed(1)}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-400">{preset.downloads} downloads</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {preset.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-cyan-600/20 text-cyan-300 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => downloadPreset(preset.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Chat View (keeping the existing implementation)
  const ChatView = () => (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Rooms Sidebar */}
      <div className="w-80 bg-gray-800/50 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Chat Rooms</h3>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {rooms
            .filter(room => 
              room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              room.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((room) => (
              <button
                key={room.id}
                onClick={() => joinRoom(room.id)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedRoom === room.id
                    ? 'bg-purple-600 text-white'
                    : 'hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {room.type === 'private' ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Hash className="w-4 h-4" />
                  )}
                  <span className="font-medium truncate">{room.name}</span>
                </div>
                <p className="text-sm text-gray-400 truncate">{room.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{room.members.length} members</span>
                  <span className="text-xs text-gray-500">{room.category}</span>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">
                    {rooms.find(r => r.id === selectedRoom)?.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {rooms.find(r => r.id === selectedRoom)?.members.length} members
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.userId === currentUser?.id ? 'flex-row-reverse' : ''
                  }`}
                >
                  <img
                    src={message.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.username}`}
                    alt={message.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className={`max-w-xs lg:max-w-md ${
                    message.userId === currentUser?.id ? 'text-right' : ''
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{message.username}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      message.userId === currentUser?.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700'
                    }`}>
                      {message.type === 'preset' ? (
                        <div className="flex items-center gap-2">
                          <Headphones className="w-4 h-4" />
                          <span>{message.message}</span>
                        </div>
                      ) : (
                        <p>{message.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Image className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Headphones className="w-4 h-4" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Share your knowledge..."
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Select a room to start chatting</h3>
              <p className="text-gray-400">Join a room or create a new one to begin sharing knowledge</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Profile View
  const ProfileView = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
        <div className="flex items-center gap-6 mb-8">
          <img
            src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username}`}
            alt={currentUser?.username}
            className="w-24 h-24 rounded-full"
          />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">{currentUser?.username}</h2>
              {currentUser?.isVerified && (
                <UserCheck className="w-6 h-6 text-blue-400" />
              )}
            </div>
            <p className="text-gray-400 mb-2">{currentUser?.bio}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-purple-400">Reputation: {currentUser?.reputation}</span>
              <span className="text-gray-400">Joined: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {currentUser?.expertise && currentUser.expertise.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {currentUser.expertise.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{currentUser?.posts?.length || 0}</div>
            <div className="text-sm text-gray-400">Posts Shared</div>
          </div>
          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{currentUser?.presets?.length || 0}</div>
            <div className="text-sm text-gray-400">Presets Created</div>
          </div>
          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{currentUser?.followers?.length || 0}</div>
            <div className="text-sm text-gray-400">Followers</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Create Room Modal
  const CreateRoomModal = () => {
    const [roomData, setRoomData] = useState({
      name: '',
      description: '',
      type: 'public',
      category: 'general',
      maxMembers: 100
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createRoom(roomData);
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowCreateRoom(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Create Chat Room</h3>
            <button
              onClick={() => setShowCreateRoom(false)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Room Name</label>
              <input
                type="text"
                value={roomData.name}
                onChange={(e) => setRoomData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={roomData.description}
                onChange={(e) => setRoomData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={roomData.type}
                  onChange={(e) => setRoomData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="educational">Educational</option>
                  <option value="research">Research</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={roomData.category}
                  onChange={(e) => setRoomData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="general">General</option>
                  <option value="meditation">Meditation</option>
                  <option value="research">Research</option>
                  <option value="frequency-therapy">Frequency Therapy</option>
                  <option value="consciousness">Consciousness</option>
                  <option value="neuroscience">Neuroscience</option>
                  <option value="beginners">Beginners</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateRoom(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  // Create Post Modal
  const CreatePostModal = () => {
    const [postData, setPostData] = useState({
      title: '',
      content: '',
      type: 'text',
      tags: [],
      media: null
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createPost(postData);
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowCreatePost(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Share Knowledge</h3>
            <button
              onClick={() => setShowCreatePost(false)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={postData.title}
                onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="What knowledge are you sharing?"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={postData.content}
                onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={6}
                placeholder="Share your insights, research, or educational content..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={postData.type}
                  onChange={(e) => setPostData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="text">Text</option>
                  <option value="research">Research</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="audio">Audio</option>
                  <option value="preset">Preset</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Media</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,audio/*,.pdf"
                  onChange={(e) => setPostData(prev => ({ ...prev, media: e.target.files }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreatePost(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Sharing...' : 'Share Knowledge'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  // Create Preset Modal
  const CreatePresetModal = () => {
    const [presetData, setPresetData] = useState({
      name: '',
      description: '',
      type: 'frequency',
      category: 'meditation',
      configuration: {
        baseFreq: 200,
        deltaFreq: 10,
        audioMode: 'binaural',
        duration: 1800,
        volume: 0.5
      },
      tags: []
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createPreset(presetData);
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowCreatePreset(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Create Frequency Preset</h3>
            <button
              onClick={() => setShowCreatePreset(false)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Preset Name</label>
              <input
                type="text"
                value={presetData.name}
                onChange={(e) => setPresetData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter preset name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={presetData.description}
                onChange={(e) => setPresetData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Describe your preset..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={presetData.category}
                  onChange={(e) => setPresetData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="meditation">Meditation</option>
                  <option value="focus">Focus</option>
                  <option value="sleep">Sleep</option>
                  <option value="creativity">Creativity</option>
                  <option value="relaxation">Relaxation</option>
                  <option value="healing">Healing</option>
                  <option value="study">Study</option>
                  <option value="energy">Energy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Audio Mode</label>
                <select
                  value={presetData.configuration.audioMode}
                  onChange={(e) => setPresetData(prev => ({ 
                    ...prev, 
                    configuration: { ...prev.configuration, audioMode: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="binaural">Binaural</option>
                  <option value="isochronic">Isochronic</option>
                  <option value="mono">Monaural</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Base Frequency (Hz)</label>
                <input
                  type="number"
                  value={presetData.configuration.baseFreq}
                  onChange={(e) => setPresetData(prev => ({ 
                    ...prev, 
                    configuration: { ...prev.configuration, baseFreq: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="50"
                  max="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Delta Frequency (Hz)</label>
                <input
                  type="number"
                  value={presetData.configuration.deltaFreq}
                  onChange={(e) => setPresetData(prev => ({ 
                    ...prev, 
                    configuration: { ...prev.configuration, deltaFreq: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0.5"
                  max="100"
                  step="0.5"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreatePreset(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Preset'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navigation />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'feed' && <FeedView />}
          {activeView === 'chat' && <ChatView />}
          {activeView === 'presets' && <PresetsView />}
          {activeView === 'profile' && <ProfileView />}
          {activeView === 'explore' && <FeedView />}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showCreateRoom && <CreateRoomModal />}
        {showCreatePost && <CreatePostModal />}
        {showCreatePreset && <CreatePresetModal />}
      </AnimatePresence>
    </div>
  );
};

export default CollaborationSync;