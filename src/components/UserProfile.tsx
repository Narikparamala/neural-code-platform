import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Trophy, Calendar, Brain, Target, Edit3, Save, X } from 'lucide-react';

interface UserProfileProps {
  onClose: () => void;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  joinDate: string;
  totalSessions: number;
  totalTime: number;
  favoriteFrequency: number;
  achievements: number;
  level: number;
  experience: number;
  preferences: {
    defaultLab: string;
    sessionReminders: boolean;
    dataSharing: boolean;
    voiceChat: boolean;
  };
  stats: {
    deltaTime: number;
    thetaTime: number;
    alphaTime: number;
    betaTime: number;
    gammaTime: number;
  };
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    preferences: {
      defaultLab: 'rate',
      sessionReminders: true,
      dataSharing: false,
      voiceChat: true
    }
  });

  useEffect(() => {
    // Load user data (mock data for demo)
    const mockUserData: UserData = {
      id: 'user_123',
      username: 'Neural Explorer',
      email: 'explorer@neuralcode.com',
      avatar: '🧠',
      bio: 'Passionate about consciousness exploration and brainwave entrainment. Researcher in neuroscience and meditation practices.',
      joinDate: '2024-01-01',
      totalSessions: 47,
      totalTime: 28800, // 8 hours in seconds
      favoriteFrequency: 10,
      achievements: 12,
      level: 8,
      experience: 2340,
      preferences: {
        defaultLab: 'rate',
        sessionReminders: true,
        dataSharing: false,
        voiceChat: true
      },
      stats: {
        deltaTime: 3600,
        thetaTime: 7200,
        alphaTime: 10800,
        betaTime: 5400,
        gammaTime: 1800
      }
    };

    setUserData(mockUserData);
    setEditForm({
      username: mockUserData.username,
      bio: mockUserData.bio,
      preferences: mockUserData.preferences
    });
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const calculateLevelProgress = (experience: number) => {
    const currentLevelXP = (userData?.level || 1) * 300;
    const nextLevelXP = ((userData?.level || 1) + 1) * 300;
    const progress = ((experience - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const handleSave = () => {
    if (!userData) return;

    const updatedUserData = {
      ...userData,
      username: editForm.username,
      bio: editForm.bio,
      preferences: editForm.preferences
    };

    setUserData(updatedUserData);
    setIsEditing(false);

    // In a real app, this would save to the backend
    localStorage.setItem('neural-user-profile', JSON.stringify(updatedUserData));
  };

  const getBrainwaveStats = () => {
    if (!userData) return [];

    const total = Object.values(userData.stats).reduce((sum, time) => sum + time, 0);
    
    return [
      { name: 'Delta', time: userData.stats.deltaTime, percentage: (userData.stats.deltaTime / total) * 100, color: 'bg-purple-400' },
      { name: 'Theta', time: userData.stats.thetaTime, percentage: (userData.stats.thetaTime / total) * 100, color: 'bg-blue-400' },
      { name: 'Alpha', time: userData.stats.alphaTime, percentage: (userData.stats.alphaTime / total) * 100, color: 'bg-green-400' },
      { name: 'Beta', time: userData.stats.betaTime, percentage: (userData.stats.betaTime / total) * 100, color: 'bg-yellow-400' },
      { name: 'Gamma', time: userData.stats.gammaTime, percentage: (userData.stats.gammaTime / total) * 100, color: 'bg-red-400' }
    ];
  };

  if (!userData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">User Profile</h2>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                  {userData.avatar}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    className="text-xl font-bold bg-gray-700 rounded px-2 py-1 text-center w-full"
                  />
                ) : (
                  <h3 className="text-xl font-bold">{userData.username}</h3>
                )}
                <p className="text-gray-400 text-sm">{userData.email}</p>
              </div>

              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full p-3 bg-gray-700 rounded-lg text-sm resize-none"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-300 text-sm text-center">{userData.bio}</p>
              )}
            </div>

            {/* Level & Experience */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h4 className="font-semibold">Level & Progress</h4>
              </div>
              
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-yellow-400 mb-1">Level {userData.level}</div>
                <div className="text-sm text-gray-400">{userData.experience} XP</div>
              </div>

              <div className="w-full bg-gray-600 rounded-full h-3 mb-2">
                <div 
                  className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${calculateLevelProgress(userData.experience)}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 text-center">
                {Math.round(calculateLevelProgress(userData.experience))}% to next level
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Quick Stats
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Sessions</span>
                  <span className="font-mono">{userData.totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Time</span>
                  <span className="font-mono">{formatDuration(userData.totalTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Favorite Frequency</span>
                  <span className="font-mono">{userData.favoriteFrequency}Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Achievements</span>
                  <span className="font-mono">{userData.achievements}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="font-mono">{new Date(userData.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats & Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Brainwave Distribution */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Brainwave Training Distribution
              </h4>
              
              <div className="space-y-4">
                {getBrainwaveStats().map((stat) => (
                  <div key={stat.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{stat.name}</span>
                      <span className="text-sm text-gray-400">
                        {formatDuration(stat.time)} ({stat.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`${stat.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Preferences
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Default Lab</label>
                  {isEditing ? (
                    <select
                      value={editForm.preferences.defaultLab}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, defaultLab: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                    >
                      <option value="rate">Rate Lab</option>
                      <option value="place">Place Lab</option>
                      <option value="population">Population Lab</option>
                      <option value="monroe">Monroe Hub</option>
                      <option value="frequency">Frequency Lab</option>
                    </select>
                  ) : (
                    <div className="px-3 py-2 bg-gray-700 rounded-lg capitalize">
                      {userData.preferences.defaultLab} Lab
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session Reminders</span>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editForm.preferences.sessionReminders}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, sessionReminders: e.target.checked }
                        }))}
                        className="w-4 h-4"
                      />
                    ) : (
                      <div className={`w-4 h-4 rounded ${userData.preferences.sessionReminders ? 'bg-green-400' : 'bg-gray-600'}`} />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Sharing</span>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editForm.preferences.dataSharing}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, dataSharing: e.target.checked }
                        }))}
                        className="w-4 h-4"
                      />
                    ) : (
                      <div className={`w-4 h-4 rounded ${userData.preferences.dataSharing ? 'bg-green-400' : 'bg-gray-600'}`} />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Voice Chat</span>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editForm.preferences.voiceChat}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, voiceChat: e.target.checked }
                        }))}
                        className="w-4 h-4"
                      />
                    ) : (
                      <div className={`w-4 h-4 rounded ${userData.preferences.voiceChat ? 'bg-green-400' : 'bg-gray-600'}`} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                Recent Activity
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm">Completed 30-minute alpha session</div>
                    <div className="text-xs text-gray-400">2 hours ago</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm">Unlocked "Consistency Champion" achievement</div>
                    <div className="text-xs text-gray-400">1 day ago</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm">Joined "Gamma Research Group" session</div>
                    <div className="text-xs text-gray-400">2 days ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfile;