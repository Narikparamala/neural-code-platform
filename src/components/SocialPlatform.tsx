import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, MessageCircle, Heart, Share2, Search, Plus, Send, 
  Users, Settings, Bell, Camera, Edit3, Save, X, Eye,
  Headphones, Brain, Zap, Globe, MoreHorizontal, UserPlus,
  Hash, TrendingUp, Clock, Star, Award, Target, BarChart3
} from 'lucide-react';
import { SupabaseService, UserProfile, Post, ChatMessage, Notification } from '../lib/supabase';

interface SocialPlatformProps {
  currentUser: any;
  onSessionUpdate?: (data: any) => void;
}

const SocialPlatform: React.FC<SocialPlatformProps> = ({ currentUser, onSessionUpdate }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'profile' | 'chat' | 'explore' | 'analytics'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', type: 'text', tags: [] });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: '', bio: '' });
  const [randomChatUser, setRandomChatUser] = useState<any>(null);
  const [isSearchingRandom, setIsSearchingRandom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize data and subscriptions
  useEffect(() => {
    // Load mock data instead of Supabase
    loadMockData();
    
    // Set profile form data
    if (currentUser) {
      setProfileForm({
        username: currentUser.username,
        bio: currentUser.bio || ''
      });
    }
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
      currentChat: selectedUser?.user_id || null
    });
  }, [activeTab, posts, onlineUsers, notifications, selectedUser, onSessionUpdate]);

  const loadMockData = () => {
    setIsLoading(true);
    
    // Mock posts
    setPosts([
      {
        id: '1',
        author_id: 'user1',
        content: 'Just had an amazing gamma wave session! The 40Hz frequency really enhanced my focus and cognitive clarity. Anyone else experiencing similar results?',
        type: 'text',
        media: [],
        tags: ['gamma', 'focus', 'cognitive'],
        likes: ['user2', 'user3'],
        comments: [],
        shares: 2,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        author: {
          id: 'user1',
          username: 'Dr. Consciousness',
          user_id: 'drcons',
          avatar: '👨‍🔬',
          is_verified: true
        }
      },
      {
        id: '2',
        author_id: 'user2',
        content: 'Sharing my latest alpha wave preset for deep relaxation and stress relief.',
        type: 'preset',
        media: [],
        preset: {
          name: 'Alpha Relaxation',
          frequency: 10,
          carrier: 200,
          description: 'Perfect for meditation and stress relief'
        },
        tags: ['alpha', 'relaxation', 'meditation'],
        likes: ['user1', 'user3', 'user4'],
        comments: [],
        shares: 5,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        author: {
          id: 'user2',
          username: 'Frequency Master',
          user_id: 'freqmaster',
          avatar: '🎵',
          is_verified: false
        }
      }
    ]);

    // Mock online users
    setOnlineUsers([
      { id: 'user1', username: 'Dr. Consciousness', user_id: 'drcons', avatar: '👨‍🔬', status: 'online' },
      { id: 'user2', username: 'Frequency Master', user_id: 'freqmaster', avatar: '🎵', status: 'online' },
      { id: 'user3', username: 'Neural Explorer', user_id: 'neuralexp', avatar: '🧠', status: 'online' },
      { id: 'user4', username: 'Consciousness Researcher', user_id: 'consres', avatar: '🔬', status: 'online' }
    ]);

    // Mock notifications
    setNotifications([
      {
        id: '1',
        user_id: currentUser.id,
        type: 'like',
        message: 'Dr. Consciousness liked your post',
        data: {},
        read: false,
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ]);

    setIsLoading(false);
  };

  const createPost = () => {
    if (!newPost.content.trim()) return;

    const newPostData = {
      id: Date.now().toString(),
      author_id: currentUser.id,
      content: newPost.content,
      type: newPost.type,
      media: [],
      preset: newPost.type === 'preset' ? {
        name: 'Sample Preset',
        frequency: 10,
        carrier: 200,
        description: 'Sample description'
      } : undefined,
      tags: newPost.tags,
      likes: [],
      comments: [],
      shares: 0,
      created_at: new Date().toISOString(),
      author: currentUser
    };

    setPosts(prev => [newPostData, ...prev]);
    setNewPost({ content: '', type: 'text', tags: [] });
    setShowCreatePost(false);
  };

  const likePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(currentUser.id);
        const newLikes = isLiked 
          ? post.likes.filter(id => id !== currentUser.id)
          : [...post.likes, currentUser.id];
        return { ...post, likes: newLikes };
      }
      return post;
    }));
  };

  const searchUsers = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = onlineUsers.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.user_id.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const startChat = (user: any) => {
    setSelectedUser(user);
    setActiveTab('chat');
    
    // Load mock messages
    setChatMessages([
      {
        id: '1',
        sender_id: user.id,
        receiver_id: currentUser.id,
        content: 'Hey! How are your consciousness exploration sessions going?',
        type: 'text',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        sender: user
      }
    ]);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const message = {
      id: Date.now().toString(),
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      content: newMessage,
      type: 'text',
      created_at: new Date().toISOString(),
      sender: currentUser
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const findRandomUser = () => {
    setIsSearchingRandom(true);
    
    // Get random user from online users
    const availableUsers = onlineUsers.filter(user => user.id !== currentUser.id);
    
    if (availableUsers.length > 0) {
      const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      setRandomChatUser(randomUser);
    } else {
      setRandomChatUser(null);
    }
    
    setIsSearchingRandom(false);
  };

  const followUser = (userId: string) => {
    // Mock follow functionality
    console.log('Following user:', userId);
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    
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
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map(post => (
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
                    {post.author?.avatar || post.author?.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{post.author?.username}</span>
                      {post.author?.is_verified && <Star className="w-4 h-4 text-yellow-400" />}
                    </div>
                    <div className="text-sm text-gray-400">@{post.author?.user_id} • {formatTime(post.created_at)}</div>
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
          ))
        )}
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
                {currentUser.is_verified && <Star className="w-5 h-5 text-yellow-400" />}
              </div>
              <p className="text-gray-400">@{currentUser.user_id}</p>
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
            <div className="text-2xl font-bold text-purple-400">{posts.filter(p => p.author_id === currentUser.id).length}</div>
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
            <div className="text-2xl font-bold text-blue-400">{currentUser.stats?.totalSessions || 0}</div>
            <div className="text-sm text-gray-400">Total Sessions</div>
          </div>
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{Math.floor((currentUser.stats?.totalTime || 0) / 3600)}h</div>
            <div className="text-sm text-gray-400">Total Time</div>
          </div>
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{currentUser.stats?.favoriteFrequency || 10}Hz</div>
            <div className="text-sm text-gray-400">Favorite Freq</div>
          </div>
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">Level {currentUser.stats?.level || 1}</div>
            <div className="text-sm text-gray-400">Experience</div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4">Your Recent Posts</h3>
        {posts.filter(post => post.author_id === currentUser.id).length === 0 ? (
          <p className="text-gray-400 text-center py-8">No posts yet. Share your first insight!</p>
        ) : (
          <div className="space-y-4">
            {posts.filter(post => post.author_id === currentUser.id).slice(0, 3).map(post => (
              <div key={post.id} className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-gray-200 mb-2">{post.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{formatTime(post.created_at)}</span>
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
                  <div className="text-xs text-gray-400">@{randomChatUser.user_id}</div>
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
                      <div className="text-sm text-gray-400">@{user.user_id}</div>
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
                    <div className="text-sm text-gray-400">@{user.user_id}</div>
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
                  <div className="text-sm text-gray-400">@{selectedUser.user_id}</div>
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
                  <p>Start a conversation with @{selectedUser.user_id}</p>
                  <p className="text-sm mt-2">Share your consciousness insights and learn together!</p>
                </div>
              ) : (
                chatMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === currentUser.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-200'
                    }`}>
                      <p>{message.content}</p>
                      <div className={`text-xs mt-1 ${
                        message.sender_id === currentUser.id ? 'text-purple-200' : 'text-gray-400'
                      }`}>
                        {formatTime(message.created_at)}
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
                  <div className="text-sm text-gray-400">@{user.user_id}</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-3">{user.bio}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Level {user.stats?.level || 1} • {user.stats?.totalSessions || 0} sessions
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
                    onClick={async () => {
                      try {
                        await SupabaseService.updateUserProfile(currentUser.id, {
                          username: profileForm.username,
                          bio: profileForm.bio
                        });
                        setIsEditingProfile(false);
                      } catch (error) {
                        console.error('Error updating profile:', error);
                      }
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