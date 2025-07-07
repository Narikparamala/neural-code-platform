import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, MessageCircle, Heart, Share2, Search, Plus, Send, 
  Users, Settings, Bell, Camera, Edit3, Save, X, Eye,
  Headphones, Brain, Zap, Globe, MoreHorizontal, UserPlus,
  Hash, TrendingUp, Clock, Star, Award, Target, BarChart3
} from 'lucide-react';
import io, { Socket } from 'socket.io-client';

interface SocialPlatformProps {
  currentUser: any;
  onSessionUpdate?: (data: any) => void;
}

interface Post {
  id: string;
  author: {
    id: string;
    username: string;
    userID: string;
    avatar: string;
    isVerified: boolean;
  };
  content: string;
  type: 'text' | 'preset' | 'research' | 'image';
  media?: string[];
  preset?: {
    name: string;
    frequency: number;
    carrier: number;
    description: string;
  };
  tags: string[];
  likes: string[];
  comments: Comment[];
  shares: number;
  timestamp: number;
}

interface Comment {
  id: string;
  author: {
    id: string;
    username: string;
    userID: string;
    avatar: string;
  };
  content: string;
  timestamp: number;
  likes: string[];
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  senderUserID: string;
  content: string;
  timestamp: number;
  type: 'text' | 'preset';
  preset?: any;
}

interface UserProfile {
  id: string;
  username: string;
  userID: string;
  avatar: string;
  bio: string;
  isVerified: boolean;
  joinDate: string;
  followers: string[];
  following: string[];
  posts: Post[];
  presets: any[];
  stats: {
    totalSessions: number;
    totalTime: number;
    favoriteFrequency: number;
    level: number;
  };
}

const SocialPlatform: React.FC<SocialPlatformProps> = ({ currentUser, onSessionUpdate }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'profile' | 'chat' | 'explore' | 'analytics'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', type: 'text', tags: [] });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: '', bio: '' });
  const [randomChatUser, setRandomChatUser] = useState<UserProfile | null>(null);
  const [isSearchingRandom, setIsSearchingRandom] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection and load data
  useEffect(() => {
    // Initialize socket (simulated for demo)
    // socketRef.current = io('http://localhost:5000');
    
    // Load initial data
    loadPosts();
    loadOnlineUsers();
    loadNotifications();
    
    // Set profile form data
    if (currentUser) {
      setProfileForm({
        username: currentUser.username,
        bio: currentUser.bio || ''
      });
    }

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Simulate new notifications
      if (Math.random() > 0.8) {
        addNotification({
          id: Date.now().toString(),
          type: 'like',
          message: 'Someone liked your post',
          timestamp: Date.now()
        });
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Update session data
  useEffect(() => {
    onSessionUpdate?.({
      lab: 'social',
      activeTab,
      postsCount: posts.length,
      onlineUsers: onlineUsers.length,
      notifications: notifications.length,
      currentChat: selectedUser?.userID || null
    });
  }, [activeTab, posts, onlineUsers, notifications, selectedUser, onSessionUpdate]);

  const loadPosts = () => {
    // Load posts from localStorage or generate mock data
    const savedPosts = localStorage.getItem('neural-social-posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      // Generate mock posts
      const mockPosts: Post[] = [
        {
          id: '1',
          author: {
            id: 'user1',
            username: 'Dr. Consciousness',
            userID: 'dr_consciousness',
            avatar: '🧠',
            isVerified: true
          },
          content: 'Just discovered an amazing correlation between 40Hz gamma waves and enhanced creativity! The neural synchronization patterns are fascinating. Anyone else experimenting with gamma entrainment?',
          type: 'research',
          tags: ['gamma', 'creativity', 'research', 'neuroscience'],
          likes: ['user2', 'user3'],
          comments: [],
          shares: 5,
          timestamp: Date.now() - 3600000
        },
        {
          id: '2',
          author: {
            id: 'user2',
            username: 'Frequency Explorer',
            userID: 'freq_explorer',
            avatar: '🎵',
            isVerified: false
          },
          content: 'Sharing my latest alpha wave preset for deep meditation. This configuration has helped me achieve incredible states of relaxation and awareness.',
          type: 'preset',
          preset: {
            name: 'Deep Alpha Meditation',
            frequency: 10,
            carrier: 200,
            description: 'Perfect for meditation and relaxation'
          },
          tags: ['alpha', 'meditation', 'preset'],
          likes: ['user1'],
          comments: [],
          shares: 3,
          timestamp: Date.now() - 7200000
        }
      ];
      setPosts(mockPosts);
      localStorage.setItem('neural-social-posts', JSON.stringify(mockPosts));
    }
  };

  const loadOnlineUsers = () => {
    // Simulate online users
    const mockUsers: UserProfile[] = [
      {
        id: 'user1',
        username: 'Dr. Consciousness',
        userID: 'dr_consciousness',
        avatar: '🧠',
        bio: 'Neuroscientist researching consciousness and brainwave entrainment',
        isVerified: true,
        joinDate: '2024-01-01',
        followers: ['user2', 'user3'],
        following: ['user2'],
        posts: [],
        presets: [],
        stats: { totalSessions: 150, totalTime: 45000, favoriteFrequency: 40, level: 12 }
      },
      {
        id: 'user2',
        username: 'Frequency Explorer',
        userID: 'freq_explorer',
        avatar: '🎵',
        bio: 'Sound healing practitioner and frequency researcher',
        isVerified: false,
        joinDate: '2024-01-15',
        followers: ['user1'],
        following: ['user1', 'user3'],
        posts: [],
        presets: [],
        stats: { totalSessions: 89, totalTime: 28000, favoriteFrequency: 10, level: 8 }
      },
      {
        id: 'user3',
        username: 'Theta Dreamer',
        userID: 'theta_dreamer',
        avatar: '🌙',
        bio: 'Lucid dreaming enthusiast and theta wave specialist',
        isVerified: false,
        joinDate: '2024-02-01',
        followers: [],
        following: ['user1', 'user2'],
        posts: [],
        presets: [],
        stats: { totalSessions: 67, totalTime: 22000, favoriteFrequency: 6, level: 6 }
      }
    ];
    setOnlineUsers(mockUsers);
  };

  const loadNotifications = () => {
    const savedNotifications = localStorage.getItem('neural-notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  };

  const addNotification = (notification: any) => {
    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem('neural-notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const createPost = () => {
    if (!newPost.content.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      author: {
        id: currentUser.id,
        username: currentUser.username,
        userID: currentUser.userID,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified || false
      },
      content: newPost.content,
      type: newPost.type as any,
      tags: newPost.tags,
      likes: [],
      comments: [],
      shares: 0,
      timestamp: Date.now()
    };

    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('neural-social-posts', JSON.stringify(updatedPosts));
    
    setNewPost({ content: '', type: 'text', tags: [] });
    setShowCreatePost(false);
  };

  const likePost = (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(currentUser.id);
        return {
          ...post,
          likes: isLiked 
            ? post.likes.filter(id => id !== currentUser.id)
            : [...post.likes, currentUser.id]
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem('neural-social-posts', JSON.stringify(updatedPosts));
  };

  const searchUsers = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = onlineUsers.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.userID.toLowerCase().includes(query.toLowerCase()) ||
      user.bio.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  const startChat = (user: UserProfile) => {
    setSelectedUser(user);
    setActiveTab('chat');
    // Load chat history
    const chatKey = `chat_${[currentUser.id, user.id].sort().join('_')}`;
    const savedChat = localStorage.getItem(chatKey);
    if (savedChat) {
      setChatMessages(JSON.parse(savedChat));
    } else {
      setChatMessages([]);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      senderUserID: currentUser.userID,
      content: newMessage,
      timestamp: Date.now(),
      type: 'text'
    };

    const updatedMessages = [...chatMessages, message];
    setChatMessages(updatedMessages);
    
    // Save to localStorage
    const chatKey = `chat_${[currentUser.id, selectedUser.id].sort().join('_')}`;
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    
    setNewMessage('');
  };

  const findRandomUser = () => {
    setIsSearchingRandom(true);
    
    // Simulate search delay
    setTimeout(() => {
      const availableUsers = onlineUsers.filter(user => 
        user.id !== currentUser.id && 
        !currentUser.following?.includes(user.id)
      );
      
      if (availableUsers.length > 0) {
        const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
        setRandomChatUser(randomUser);
      } else {
        setRandomChatUser(null);
      }
      setIsSearchingRandom(false);
    }, 2000);
  };

  const followUser = (userId: string) => {
    // Update following list
    const updatedUser = {
      ...currentUser,
      following: currentUser.following?.includes(userId)
        ? currentUser.following.filter((id: string) => id !== userId)
        : [...(currentUser.following || []), userId]
    };
    
    // Save to localStorage
    localStorage.setItem('neural-user', JSON.stringify(updatedUser));
    
    // Add notification to target user
    addNotification({
      id: Date.now().toString(),
      type: 'follow',
      message: `@${currentUser.userID} started following you`,
      timestamp: Date.now()
    });
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  const getBrainwaveColor = (frequency: number) => {
    if (frequency >= 0.5 && frequency <= 4) return 'text-purple-400';
    if (frequency >= 4 && frequency <= 8) return 'text-blue-400';
    if (frequency >= 8 && frequency <= 12) return 'text-green-400';
    if (frequency >= 12 && frequency <= 30) return 'text-yellow-400';
    if (frequency >= 30) return 'text-red-400';
    return 'text-gray-400';
  };

  const renderFeed = () => (
    <div className="space-y-6">
      {/* Create Post */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            {currentUser.avatar || currentUser.username.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex-1 text-left px-4 py-3 bg-gray-700 rounded-lg text-gray-400 hover:bg-gray-600 transition-colors"
          >
            Share your consciousness insights...
          </button>
          <button
            onClick={() => setShowCreatePost(true)}
            className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map(post => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
          >
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  {post.author.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{post.author.username}</span>
                    {post.author.isVerified && <Star className="w-4 h-4 text-yellow-400" />}
                  </div>
                  <div className="text-sm text-gray-400">@{post.author.userID} • {formatTime(post.timestamp)}</div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-200 mb-3">{post.content}</p>
              
              {/* Preset Display */}
              {post.type === 'preset' && post.preset && (
                <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones className="w-5 h-5 text-purple-400" />
                    <span className="font-medium">{post.preset.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Frequency:</span>
                      <span className={`ml-2 font-mono ${getBrainwaveColor(post.preset.frequency)}`}>
                        {post.preset.frequency}Hz
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Carrier:</span>
                      <span className="ml-2 font-mono">{post.preset.carrier}Hz</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">{post.preset.description}</p>
                  <button className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors">
                    Try Preset
                  </button>
                </div>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-6 pt-3 border-t border-gray-700">
              <button
                onClick={() => likePost(post.id)}
                className={`flex items-center gap-2 transition-colors ${
                  post.likes.includes(currentUser.id) ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.likes.includes(currentUser.id) ? 'fill-current' : ''}`} />
                <span>{post.likes.length}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments.length}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors">
                <Share2 className="w-5 h-5" />
                <span>{post.shares}</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-2xl">
              {currentUser.avatar || currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{currentUser.username}</h2>
                {currentUser.isVerified && <Star className="w-5 h-5 text-yellow-400" />}
              </div>
              <p className="text-gray-400">@{currentUser.userID}</p>
              <p className="text-gray-300 mt-2">{currentUser.bio}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingProfile(true)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{currentUser.posts?.length || 0}</div>
            <div className="text-gray-400 text-sm">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{currentUser.followers?.length || 0}</div>
            <div className="text-gray-400 text-sm">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{currentUser.following?.length || 0}</div>
            <div className="text-gray-400 text-sm">Following</div>
          </div>
        </div>
      </div>

      {/* User Analytics */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Your Analytics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">47</div>
            <div className="text-sm text-gray-400">Total Sessions</div>
          </div>
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-green-400">28h</div>
            <div className="text-sm text-gray-400">Total Time</div>
          </div>
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">10Hz</div>
            <div className="text-sm text-gray-400">Favorite Freq</div>
          </div>
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">Level 8</div>
            <div className="text-sm text-gray-400">Experience</div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4">Your Recent Posts</h3>
        {posts.filter(post => post.author.id === currentUser.id).length === 0 ? (
          <p className="text-gray-400 text-center py-8">No posts yet. Share your first insight!</p>
        ) : (
          <div className="space-y-4">
            {posts.filter(post => post.author.id === currentUser.id).slice(0, 3).map(post => (
              <div key={post.id} className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-gray-200 mb-2">{post.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{formatTime(post.timestamp)}</span>
                  <span>{post.likes.length} likes</span>
                  <span>{post.comments.length} comments</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Chat List */}
      <div className="lg:col-span-1 bg-gray-800/50 rounded-xl border border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold mb-4">Messages</h3>
          
          {/* Search Users */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchUsers(e.target.value);
              }}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Random Chat */}
          <button
            onClick={findRandomUser}
            disabled={isSearchingRandom}
            className="w-full p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg transition-colors mb-4 flex items-center justify-center gap-2"
          >
            {isSearchingRandom ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Users className="w-4 h-4" />
            )}
            {isSearchingRandom ? 'Searching...' : 'Random Chat'}
          </button>

          {/* Random Chat Result */}
          {randomChatUser && (
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm">
                  {randomChatUser.avatar}
                </div>
                <div>
                  <div className="font-medium">{randomChatUser.username}</div>
                  <div className="text-xs text-gray-400">@{randomChatUser.userID}</div>
                </div>
              </div>
              <button
                onClick={() => startChat(randomChatUser)}
                className="w-full py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
              >
                Start Chat
              </button>
            </div>
          )}

          {!isSearchingRandom && !randomChatUser && searchQuery === '' && (
            <div className="text-center text-gray-400 text-sm py-4">
              Search for users or try random chat
            </div>
          )}
        </div>

        {/* Search Results / Online Users */}
        <div className="flex-1 overflow-y-auto p-4">
          {searchQuery ? (
            searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map(user => (
                  <button
                    key={user.id}
                    onClick={() => startChat(user)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-700/50 rounded-lg transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-gray-400">@{user.userID}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm py-8">No users found</div>
            )
          ) : (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Online Users ({onlineUsers.length})</h4>
              {onlineUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => startChat(user)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-700/50 rounded-lg transition-colors text-left"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      {user.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-gray-400">@{user.userID}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="lg:col-span-2 bg-gray-800/50 rounded-xl border border-gray-700 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  {selectedUser.avatar}
                </div>
                <div>
                  <div className="font-medium">{selectedUser.username}</div>
                  <div className="text-sm text-gray-400">@{selectedUser.userID}</div>
                </div>
              </div>
              <button
                onClick={() => followUser(selectedUser.id)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {currentUser.following?.includes(selectedUser.id) ? 'Unfollow' : 'Follow'}
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with @{selectedUser.userID}</p>
                  <p className="text-sm mt-2">Share your consciousness insights and learn together!</p>
                </div>
              ) : (
                chatMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === currentUser.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-200'
                    }`}>
                      <p>{message.content}</p>
                      <div className={`text-xs mt-1 ${
                        message.senderId === currentUser.id ? 'text-purple-200' : 'text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Select a user to start chatting</p>
              <p className="text-sm">Connect with consciousness explorers worldwide</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderExplore = () => (
    <div className="space-y-6">
      {/* Trending Topics */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Trending Topics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['#gamma', '#meditation', '#binaural', '#consciousness'].map(tag => (
            <div key={tag} className="p-3 bg-gray-700/50 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-400">{tag}</div>
              <div className="text-sm text-gray-400">{Math.floor(Math.random() * 100) + 20} posts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Users */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Featured Researchers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {onlineUsers.slice(0, 4).map(user => (
            <div key={user.id} className="p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  {user.avatar}
                </div>
                <div>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-sm text-gray-400">@{user.userID}</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-3">{user.bio}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Level {user.stats.level} • {user.stats.totalSessions} sessions
                </div>
                <button
                  onClick={() => startChat(user)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Research Insights */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Latest Research Insights
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <h4 className="font-medium mb-2">Gamma Waves and Cognitive Enhancement</h4>
            <p className="text-gray-400 text-sm mb-2">
              Recent studies show 40Hz gamma entrainment can improve working memory and attention span by up to 23%.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>2 hours ago</span>
              <span>•</span>
              <span>Dr. Consciousness</span>
            </div>
          </div>
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <h4 className="font-medium mb-2">Theta States and Creativity</h4>
            <p className="text-gray-400 text-sm mb-2">
              New research reveals theta wave training (4-8Hz) significantly enhances creative problem-solving abilities.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>5 hours ago</span>
              <span>•</span>
              <span>Frequency Explorer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">
              Collaboration Sync - Consciousness Network
            </h1>
            <p className="text-gray-400">
              Connect, share knowledge, and explore consciousness with researchers worldwide
            </p>
          </div>
          
          {/* Notifications */}
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <div className="relative">
              <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </button>
            </div>
            <div className="text-sm text-gray-400">
              {onlineUsers.length} users online
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'feed', label: 'Feed', icon: Hash },
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'chat', label: 'Chat', icon: MessageCircle },
          { id: 'explore', label: 'Explore', icon: Search },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'feed' && renderFeed()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'chat' && renderChat()}
          {activeTab === 'explore' && renderExplore()}
          {activeTab === 'analytics' && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">Social Analytics</h3>
              <p className="text-gray-400">Detailed analytics coming soon...</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreatePost(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 max-w-lg w-full border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Create Post</h3>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your consciousness insights..."
                  className="w-full p-3 bg-gray-800 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                />

                <div>
                  <label className="block text-sm font-medium mb-2">Post Type</label>
                  <select
                    value={newPost.type}
                    onChange={(e) => setNewPost(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="text">Text Post</option>
                    <option value="research">Research</option>
                    <option value="preset">Preset Share</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    onChange={(e) => setNewPost(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }))}
                    placeholder="consciousness, meditation, research"
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createPost}
                    disabled={!newPost.content.trim()}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsEditingProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 max-w-lg w-full border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Edit Profile</h3>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full p-3 bg-gray-800 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Update user profile
                      const updatedUser = {
                        ...currentUser,
                        username: profileForm.username,
                        bio: profileForm.bio
                      };
                      localStorage.setItem('neural-user', JSON.stringify(updatedUser));
                      setIsEditingProfile(false);
                    }}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialPlatform;