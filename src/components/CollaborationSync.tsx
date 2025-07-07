import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageCircle, Share2, Wifi, WifiOff, Send, 
  Mic, MicOff, Video, VideoOff, Settings, UserPlus,
  Download, Upload, Zap, Brain, Headphones, Globe
} from 'lucide-react';
import io, { Socket } from 'socket.io-client';

interface CollaborationSyncProps {
  onSessionUpdate?: (data: any) => void;
}

interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'in_session';
  currentLab?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  type: 'text' | 'preset' | 'session_data';
  data?: any;
}

interface SyncSession {
  id: string;
  name: string;
  host: string;
  participants: User[];
  lab: string;
  isActive: boolean;
  settings: {
    allowPresetSharing: boolean;
    allowVoiceChat: boolean;
    allowSessionControl: boolean;
  };
}

const CollaborationSync: React.FC<CollaborationSyncProps> = ({ onSessionUpdate }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeSessions, setActiveSessions] = useState<SyncSession[]>([]);
  const [currentSession, setCurrentSession] = useState<SyncSession | null>(null);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [selectedLab, setSelectedLab] = useState('rate');
  const [isVoiceChatEnabled, setIsVoiceChatEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sharedPresets, setSharedPresets] = useState<any[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // For demo purposes, we'll simulate the connection
    // In production, this would connect to your actual server
    const initializeConnection = () => {
      setIsConnected(true);
      setCurrentUser({
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        username: 'Neural Explorer',
        avatar: '🧠',
        status: 'online'
      });

      // Simulate some online users
      setOnlineUsers([
        { id: 'user_1', username: 'Dr. Monroe', avatar: '👨‍🔬', status: 'online', currentLab: 'monroe' },
        { id: 'user_2', username: 'Frequency Master', avatar: '🎵', status: 'in_session', currentLab: 'rate' },
        { id: 'user_3', username: 'Spatial Audio Pro', avatar: '🌍', status: 'online', currentLab: 'place' },
        { id: 'user_4', username: 'Consciousness Researcher', avatar: '🔬', status: 'online', currentLab: 'population' }
      ]);

      // Simulate some active sessions
      setActiveSessions([
        {
          id: 'session_1',
          name: 'Gamma Wave Research Group',
          host: 'Dr. Monroe',
          participants: [
            { id: 'user_1', username: 'Dr. Monroe', avatar: '👨‍🔬', status: 'in_session' },
            { id: 'user_2', username: 'Frequency Master', avatar: '🎵', status: 'in_session' }
          ],
          lab: 'rate',
          isActive: true,
          settings: {
            allowPresetSharing: true,
            allowVoiceChat: true,
            allowSessionControl: false
          }
        },
        {
          id: 'session_2',
          name: 'Spatial Audio Training',
          host: 'Spatial Audio Pro',
          participants: [
            { id: 'user_3', username: 'Spatial Audio Pro', avatar: '🌍', status: 'in_session' }
          ],
          lab: 'place',
          isActive: true,
          settings: {
            allowPresetSharing: true,
            allowVoiceChat: false,
            allowSessionControl: true
          }
        }
      ]);

      // Simulate some chat messages
      setChatMessages([
        {
          id: 'msg_1',
          userId: 'user_1',
          username: 'Dr. Monroe',
          message: 'Welcome to the Neural Code Platform! Ready to explore consciousness together?',
          timestamp: Date.now() - 300000,
          type: 'text'
        },
        {
          id: 'msg_2',
          userId: 'user_2',
          username: 'Frequency Master',
          message: 'Just shared a new 40Hz gamma preset - check it out!',
          timestamp: Date.now() - 180000,
          type: 'preset',
          data: { name: 'Gamma Focus', frequency: 40, carrier: 200 }
        },
        {
          id: 'msg_3',
          userId: 'user_3',
          username: 'Spatial Audio Pro',
          message: 'The HRTF processing in Place Lab is incredible! Anyone want to join a spatial training session?',
          timestamp: Date.now() - 60000,
          type: 'text'
        }
      ]);
    };

    initializeConnection();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Update session data
  useEffect(() => {
    onSessionUpdate?.({
      lab: 'collaboration',
      isConnected,
      currentUser,
      onlineUsers: onlineUsers.length,
      activeSessions: activeSessions.length,
      currentSession: currentSession?.name || null
    });
  }, [isConnected, currentUser, onlineUsers, activeSessions, currentSession, onSessionUpdate]);

  const sendMessage = () => {
    if (!newMessage.trim() || !currentUser) return;

    const message: ChatMessage = {
      id: 'msg_' + Date.now(),
      userId: currentUser.id,
      username: currentUser.username,
      message: newMessage.trim(),
      timestamp: Date.now(),
      type: 'text'
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const sharePreset = (preset: any) => {
    if (!currentUser) return;

    const message: ChatMessage = {
      id: 'msg_' + Date.now(),
      userId: currentUser.id,
      username: currentUser.username,
      message: `Shared preset: ${preset.name}`,
      timestamp: Date.now(),
      type: 'preset',
      data: preset
    };

    setChatMessages(prev => [...prev, message]);
    setSharedPresets(prev => [...prev, { ...preset, sharedBy: currentUser.username, timestamp: Date.now() }]);
  };

  const createSession = () => {
    if (!sessionName.trim() || !currentUser) return;

    const newSession: SyncSession = {
      id: 'session_' + Date.now(),
      name: sessionName.trim(),
      host: currentUser.username,
      participants: [currentUser],
      lab: selectedLab,
      isActive: true,
      settings: {
        allowPresetSharing: true,
        allowVoiceChat: false,
        allowSessionControl: true
      }
    };

    setActiveSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession);
    setShowCreateSession(false);
    setSessionName('');
  };

  const joinSession = (session: SyncSession) => {
    if (!currentUser) return;

    const updatedSession = {
      ...session,
      participants: [...session.participants, currentUser]
    };

    setActiveSessions(prev => prev.map(s => s.id === session.id ? updatedSession : s));
    setCurrentSession(updatedSession);
  };

  const leaveSession = () => {
    if (!currentSession || !currentUser) return;

    const updatedSession = {
      ...currentSession,
      participants: currentSession.participants.filter(p => p.id !== currentUser.id)
    };

    if (updatedSession.participants.length === 0) {
      setActiveSessions(prev => prev.filter(s => s.id !== currentSession.id));
    } else {
      setActiveSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
    }

    setCurrentSession(null);
  };

  const toggleVoiceChat = async () => {
    if (!isVoiceChatEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setIsVoiceChatEnabled(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please check permissions.');
      }
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      setIsVoiceChatEnabled(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLabIcon = (lab: string) => {
    switch (lab) {
      case 'rate': return <Zap className="w-4 h-4" />;
      case 'place': return <Globe className="w-4 h-4" />;
      case 'population': return <Users className="w-4 h-4" />;
      case 'monroe': return <Brain className="w-4 h-4" />;
      case 'frequency': return <Headphones className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getLabName = (lab: string) => {
    switch (lab) {
      case 'rate': return 'Rate Lab';
      case 'place': return 'Place Lab';
      case 'population': return 'Population Lab';
      case 'monroe': return 'Monroe Hub';
      case 'frequency': return 'Frequency Lab';
      default: return 'Unknown Lab';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center lg:text-left"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4 lg:mb-0">
            Collaboration Sync - Consciousness Network
          </h2>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isConnected ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
            }`}>
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={() => setShowCreateSession(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Create Session
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Online Users & Sessions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="xl:col-span-1 space-y-6"
        >
          {/* Current Session */}
          {currentSession && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Current Session</h3>
                <button
                  onClick={leaveSession}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                >
                  Leave
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="font-medium">{currentSession.name}</div>
                  <div className="text-sm text-gray-400">Host: {currentSession.host}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    {getLabIcon(currentSession.lab)}
                    {getLabName(currentSession.lab)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Participants ({currentSession.participants.length})</div>
                  <div className="space-y-1">
                    {currentSession.participants.map(participant => (
                      <div key={participant.id} className="flex items-center gap-2 text-sm">
                        <span>{participant.avatar}</span>
                        <span>{participant.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleVoiceChat}
                    className={`flex-1 flex items-center justify-center gap-2 p-2 rounded transition-colors ${
                      isVoiceChatEnabled ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    {isVoiceChatEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`flex-1 flex items-center justify-center gap-2 p-2 rounded transition-colors ${
                      isMuted ? 'bg-red-600' : 'bg-gray-600'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Online Users */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Online Users ({onlineUsers.length})</h3>
            <div className="space-y-3">
              {onlineUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{user.avatar}</span>
                    <div>
                      <div className="font-medium text-sm">{user.username}</div>
                      {user.currentLab && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          {getLabIcon(user.currentLab)}
                          {getLabName(user.currentLab)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    user.status === 'online' ? 'bg-green-400' : 
                    user.status === 'in_session' ? 'bg-yellow-400' : 'bg-gray-400'
                  }`} />
                </div>
              ))}
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Active Sessions ({activeSessions.length})</h3>
            <div className="space-y-3">
              {activeSessions.map(session => (
                <div key={session.id} className="p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{session.name}</div>
                    {!currentSession && (
                      <button
                        onClick={() => joinSession(session)}
                        className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs transition-colors"
                      >
                        Join
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    <div>Host: {session.host}</div>
                    <div className="flex items-center gap-1">
                      {getLabIcon(session.lab)}
                      {getLabName(session.lab)} • {session.participants.length} participants
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Chat & Communication */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="xl:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-2xl font-bold mb-6">Global Chat</h3>
          
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="h-96 bg-gray-900/50 rounded-lg p-4 mb-4 overflow-y-auto space-y-3"
          >
            {chatMessages.map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.userId === currentUser?.id ? 'flex-row-reverse' : ''}`}
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm">
                    {message.username.charAt(0)}
                  </div>
                </div>
                <div className={`flex-1 ${message.userId === currentUser?.id ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.username}</span>
                    <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                  </div>
                  <div className={`p-3 rounded-lg max-w-xs ${
                    message.userId === currentUser?.id 
                      ? 'bg-indigo-600 text-white ml-auto' 
                      : 'bg-gray-700'
                  }`}>
                    {message.type === 'preset' ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Share2 className="w-4 h-4" />
                          <span className="font-medium">Preset Shared</span>
                        </div>
                        <div className="text-sm">
                          <div>{message.data?.name}</div>
                          <div className="text-xs opacity-80">
                            {message.data?.frequency}Hz @ {message.data?.carrier}Hz
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Handle preset download/import
                            alert(`Importing preset: ${message.data?.name}`);
                          }}
                          className="mt-2 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
                        >
                          Import
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm">{message.message}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => sharePreset({
                name: 'Alpha Relaxation',
                frequency: 10,
                carrier: 200,
                description: 'Relaxed awareness state'
              })}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share Preset
            </button>
            <button
              onClick={() => {
                // Handle session data sharing
                alert('Session data shared with group!');
              }}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
            >
              <Upload className="w-4 h-4" />
              Share Session
            </button>
          </div>
        </motion.div>

        {/* Shared Resources */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="xl:col-span-1 space-y-6"
        >
          {/* Shared Presets */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Shared Presets</h3>
            <div className="space-y-3">
              {sharedPresets.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No presets shared yet
                </p>
              ) : (
                sharedPresets.map((preset, index) => (
                  <div key={index} className="p-3 bg-gray-700/50 rounded-lg">
                    <div className="font-medium text-sm">{preset.name}</div>
                    <div className="text-xs text-gray-400 mb-2">
                      By {preset.sharedBy} • {formatTime(preset.timestamp)}
                    </div>
                    <div className="text-xs text-gray-300 mb-2">
                      {preset.frequency}Hz @ {preset.carrier}Hz
                    </div>
                    <button
                      onClick={() => alert(`Downloading ${preset.name}`)}
                      className="w-full px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs transition-colors"
                    >
                      <Download className="w-3 h-3 inline mr-1" />
                      Download
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Collaboration Stats */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Network Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Online Users</span>
                <span className="font-mono text-green-400">{onlineUsers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Active Sessions</span>
                <span className="font-mono text-blue-400">{activeSessions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Shared Presets</span>
                <span className="font-mono text-purple-400">{sharedPresets.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Messages Today</span>
                <span className="font-mono text-yellow-400">{chatMessages.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Connect */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Quick Connect</h3>
            <div className="space-y-2">
              <button className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors">
                Join Random Session
              </button>
              <button className="w-full p-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors">
                Find Study Partner
              </button>
              <button className="w-full p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors">
                Research Collaboration
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Session Modal */}
      <AnimatePresence>
        {showCreateSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateSession(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Create Collaboration Session</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Session Name</label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="Enter session name..."
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Lab Focus</label>
                  <select
                    value={selectedLab}
                    onChange={(e) => setSelectedLab(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="rate">Rate Lab</option>
                    <option value="place">Place Lab</option>
                    <option value="population">Population Lab</option>
                    <option value="monroe">Monroe Hub</option>
                    <option value="frequency">Frequency Lab</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowCreateSession(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createSession}
                  disabled={!sessionName.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded-lg transition-colors"
                >
                  Create Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollaborationSync;