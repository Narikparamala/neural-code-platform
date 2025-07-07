import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Brain, Clock, Target, Award, Calendar, Download } from 'lucide-react';
import * as d3 from 'd3';

interface AnalyticsData {
  sessionHistory: SessionRecord[];
  brainwaveProgress: BrainwaveProgress;
  achievements: Achievement[];
  weeklyStats: WeeklyStats;
}

interface SessionRecord {
  id: string;
  date: string;
  lab: string;
  duration: number;
  frequency: number;
  effectiveness: number;
  notes?: string;
}

interface BrainwaveProgress {
  delta: { sessions: number; totalTime: number; avgEffectiveness: number };
  theta: { sessions: number; totalTime: number; avgEffectiveness: number };
  alpha: { sessions: number; totalTime: number; avgEffectiveness: number };
  beta: { sessions: number; totalTime: number; avgEffectiveness: number };
  gamma: { sessions: number; totalTime: number; avgEffectiveness: number };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface WeeklyStats {
  totalSessions: number;
  totalTime: number;
  avgSessionLength: number;
  mostUsedLab: string;
  consistencyScore: number;
  improvementRate: number;
}

const AdvancedAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [selectedMetric, setSelectedMetric] = useState<'sessions' | 'time' | 'effectiveness'>('sessions');

  useEffect(() => {
    // Load analytics data from localStorage and generate insights
    const loadAnalyticsData = () => {
      const savedSessions = localStorage.getItem('neural-archive');
      const sessions: SessionRecord[] = savedSessions ? JSON.parse(savedSessions) : [];

      // Generate mock data for demonstration
      const mockSessions: SessionRecord[] = [
        { id: '1', date: '2024-01-15', lab: 'rate', duration: 1800, frequency: 10, effectiveness: 85 },
        { id: '2', date: '2024-01-16', lab: 'place', duration: 1200, frequency: 40, effectiveness: 78 },
        { id: '3', date: '2024-01-17', lab: 'rate', duration: 2400, frequency: 6, effectiveness: 92 },
        { id: '4', date: '2024-01-18', lab: 'monroe', duration: 1800, frequency: 20, effectiveness: 88 },
        { id: '5', date: '2024-01-19', lab: 'frequency', duration: 1500, frequency: 40, effectiveness: 82 },
        { id: '6', date: '2024-01-20', lab: 'rate', duration: 2100, frequency: 10, effectiveness: 90 },
        { id: '7', date: '2024-01-21', lab: 'place', duration: 1800, frequency: 15, effectiveness: 86 }
      ];

      const allSessions = [...sessions, ...mockSessions];

      // Calculate brainwave progress
      const brainwaveProgress: BrainwaveProgress = {
        delta: { sessions: 0, totalTime: 0, avgEffectiveness: 0 },
        theta: { sessions: 0, totalTime: 0, avgEffectiveness: 0 },
        alpha: { sessions: 0, totalTime: 0, avgEffectiveness: 0 },
        beta: { sessions: 0, totalTime: 0, avgEffectiveness: 0 },
        gamma: { sessions: 0, totalTime: 0, avgEffectiveness: 0 }
      };

      allSessions.forEach(session => {
        const freq = session.frequency;
        let band: keyof BrainwaveProgress;
        
        if (freq >= 0.5 && freq <= 4) band = 'delta';
        else if (freq >= 4 && freq <= 8) band = 'theta';
        else if (freq >= 8 && freq <= 12) band = 'alpha';
        else if (freq >= 12 && freq <= 30) band = 'beta';
        else band = 'gamma';

        brainwaveProgress[band].sessions++;
        brainwaveProgress[band].totalTime += session.duration;
        brainwaveProgress[band].avgEffectiveness = 
          (brainwaveProgress[band].avgEffectiveness * (brainwaveProgress[band].sessions - 1) + session.effectiveness) / 
          brainwaveProgress[band].sessions;
      });

      // Generate achievements
      const achievements: Achievement[] = [
        {
          id: 'first_session',
          title: 'Neural Pioneer',
          description: 'Complete your first consciousness exploration session',
          icon: '🧠',
          unlockedAt: '2024-01-15',
          rarity: 'common'
        },
        {
          id: 'gamma_master',
          title: 'Gamma Wave Master',
          description: 'Complete 10 gamma wave sessions',
          icon: '⚡',
          unlockedAt: '2024-01-20',
          rarity: 'rare'
        },
        {
          id: 'consistency_champion',
          title: 'Consistency Champion',
          description: 'Practice for 7 consecutive days',
          icon: '🏆',
          unlockedAt: '2024-01-21',
          rarity: 'epic'
        },
        {
          id: 'deep_explorer',
          title: 'Deep State Explorer',
          description: 'Achieve 95%+ effectiveness in delta state',
          icon: '🌊',
          unlockedAt: '2024-01-17',
          rarity: 'legendary'
        }
      ];

      // Calculate weekly stats
      const weeklyStats: WeeklyStats = {
        totalSessions: allSessions.length,
        totalTime: allSessions.reduce((sum, s) => sum + s.duration, 0),
        avgSessionLength: allSessions.reduce((sum, s) => sum + s.duration, 0) / allSessions.length,
        mostUsedLab: 'rate', // Simplified calculation
        consistencyScore: 85,
        improvementRate: 12.5
      };

      setAnalyticsData({
        sessionHistory: allSessions,
        brainwaveProgress,
        achievements,
        weeklyStats
      });
    };

    loadAnalyticsData();
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-yellow-400 border-yellow-400';
    }
  };

  const exportAnalytics = () => {
    if (!analyticsData) return;

    const exportData = {
      generatedAt: new Date().toISOString(),
      timeRange: selectedTimeRange,
      ...analyticsData
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `neural-analytics-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!analyticsData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
      >
        <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 lg:mb-0">
          Advanced Analytics Dashboard
        </h2>
        <div className="flex gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
          <button
            onClick={exportAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            <h3 className="text-lg font-bold">Total Sessions</h3>
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {analyticsData.weeklyStats.totalSessions}
          </div>
          <div className="text-sm text-gray-400">
            +{analyticsData.weeklyStats.improvementRate}% from last period
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-8 h-8 text-green-400" />
            <h3 className="text-lg font-bold">Total Time</h3>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">
            {formatDuration(analyticsData.weeklyStats.totalTime)}
          </div>
          <div className="text-sm text-gray-400">
            Avg: {formatDuration(analyticsData.weeklyStats.avgSessionLength)} per session
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-8 h-8 text-purple-400" />
            <h3 className="text-lg font-bold">Consistency</h3>
          </div>
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {analyticsData.weeklyStats.consistencyScore}%
          </div>
          <div className="text-sm text-gray-400">
            Practice regularity score
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-yellow-400" />
            <h3 className="text-lg font-bold">Improvement</h3>
          </div>
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            +{analyticsData.weeklyStats.improvementRate}%
          </div>
          <div className="text-sm text-gray-400">
            Effectiveness growth rate
          </div>
        </motion.div>
      </div>

      {/* Brainwave Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          Brainwave Training Progress
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {Object.entries(analyticsData.brainwaveProgress).map(([band, data], index) => (
            <div key={band} className="text-center">
              <div className={`text-2xl font-bold mb-2 ${
                band === 'delta' ? 'text-purple-400' :
                band === 'theta' ? 'text-blue-400' :
                band === 'alpha' ? 'text-green-400' :
                band === 'beta' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {data.sessions}
              </div>
              <div className="text-sm text-gray-400 mb-2 capitalize">{band} Sessions</div>
              <div className="text-xs text-gray-500">
                {formatDuration(data.totalTime)} total
              </div>
              <div className="text-xs text-gray-500">
                {data.avgEffectiveness.toFixed(1)}% avg effectiveness
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    band === 'delta' ? 'bg-purple-400' :
                    band === 'theta' ? 'bg-blue-400' :
                    band === 'alpha' ? 'bg-green-400' :
                    band === 'beta' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${data.avgEffectiveness}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Session History & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Recent Sessions
          </h3>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analyticsData.sessionHistory.slice(-10).reverse().map((session) => (
              <div key={session.id} className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium capitalize">{session.lab} Lab</div>
                    <div className="text-sm text-gray-400">{session.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">{formatDuration(session.duration)}</div>
                    <div className="text-xs text-gray-400">{session.frequency}Hz</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${session.effectiveness}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{session.effectiveness}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Achievements ({analyticsData.achievements.length})
          </h3>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analyticsData.achievements.map((achievement) => (
              <div key={achievement.id} className={`p-3 rounded-lg border ${getRarityColor(achievement.rarity)} bg-gray-700/30`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{achievement.title}</div>
                    <div className="text-sm text-gray-400">{achievement.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Unlocked: {achievement.unlockedAt}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium border ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Insights & Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30"
      >
        <h3 className="text-xl font-bold mb-4">AI Insights & Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2 text-green-400">Strengths</h4>
            <ul className="space-y-1 text-sm">
              <li>• Excellent consistency in alpha wave training</li>
              <li>• Strong improvement in session effectiveness</li>
              <li>• Good variety across different lab experiences</li>
              <li>• Optimal session duration for learning</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-yellow-400">Recommendations</h4>
            <ul className="space-y-1 text-sm">
              <li>• Try longer gamma sessions for cognitive enhancement</li>
              <li>• Explore theta states for deeper meditation</li>
              <li>• Consider morning sessions for better consistency</li>
              <li>• Join collaboration sessions for peer learning</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedAnalytics;