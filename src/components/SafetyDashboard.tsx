import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Clock, X, CheckCircle } from 'lucide-react';

interface SafetyDashboardProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SafetyDashboard: React.FC<SafetyDashboardProps> = ({ isOpen, onToggle }) => {
  const [sessionLimits, setSessionLimits] = useState({
    delta: 60, // minutes
    theta: 45,
    alpha: 60,
    beta: 30,
    gamma: 20
  });

  const [currentSessions, setCurrentSessions] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Safety protocols based on research
  const safetyProtocols = [
    {
      frequency: 'Delta (1-4 Hz)',
      limit: '60 minutes',
      warning: 'Prolonged delta exposure may cause excessive drowsiness',
      contraindications: ['Driving', 'Operating machinery', 'Important meetings']
    },
    {
      frequency: 'Theta (4-8 Hz)',
      limit: '45 minutes',
      warning: 'Extended theta sessions may cause disorientation',
      contraindications: ['Epilepsy', 'Seizure disorders', 'Pregnancy']
    },
    {
      frequency: 'Alpha (8-12 Hz)',
      limit: '60 minutes',
      warning: 'Generally safe for extended use',
      contraindications: ['None known']
    },
    {
      frequency: 'Beta (12-30 Hz)',
      limit: '30 minutes',
      warning: 'May cause anxiety or restlessness with overuse',
      contraindications: ['Anxiety disorders', 'Hypertension', 'Stimulant use']
    },
    {
      frequency: 'Gamma (30-100 Hz)',
      limit: '20 minutes',
      warning: 'Limited research - use with caution (UCSF Study 2023)',
      contraindications: ['Photosensitive epilepsy', 'Migraines', 'Bipolar disorder']
    }
  ];

  useEffect(() => {
    // Check for session warnings
    const checkWarnings = () => {
      const newWarnings: string[] = [];
      
      // Check stored session data
      const storedSessions = localStorage.getItem('neural-archive');
      if (storedSessions) {
        const sessions = JSON.parse(storedSessions);
        const today = new Date().toDateString();
        
        const todaySessions = sessions.filter((session: any) => 
          new Date(session.timestamp).toDateString() === today
        );

        // Calculate total time per frequency band
        const totalTimes = todaySessions.reduce((acc: any, session: any) => {
          const freq = session.data.deltaFreq || 0;
          let band = 'other';
          
          if (freq >= 1 && freq <= 4) band = 'delta';
          else if (freq >= 4 && freq <= 8) band = 'theta';
          else if (freq >= 8 && freq <= 12) band = 'alpha';
          else if (freq >= 12 && freq <= 30) band = 'beta';
          else if (freq >= 30) band = 'gamma';
          
          acc[band] = (acc[band] || 0) + (session.duration || 0);
          return acc;
        }, {});

        // Check against limits
        Object.entries(totalTimes).forEach(([band, time]) => {
          const limit = sessionLimits[band as keyof typeof sessionLimits] * 60; // Convert to seconds
          if (time > limit) {
            newWarnings.push(`Daily ${band} limit exceeded: ${Math.round(time / 60)}min / ${Math.round(limit / 60)}min`);
          }
        });
      }

      setWarnings(newWarnings);
    };

    checkWarnings();
    const interval = setInterval(checkWarnings, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sessionLimits]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 400 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 400 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 z-50 max-h-96 overflow-y-auto"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold">Safety Dashboard</h2>
          </div>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Warnings */}
        {warnings.length > 0 && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-red-400">Active Warnings</h3>
            </div>
            <div className="space-y-1">
              {warnings.map((warning, index) => (
                <div key={index} className="text-sm text-red-300">
                  • {warning}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety Protocols */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safetyProtocols.map((protocol, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold">{protocol.frequency}</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-green-400">Limit:</span> {protocol.limit}
                </div>
                
                <div>
                  <span className="font-medium text-yellow-400">Warning:</span>
                  <p className="text-gray-300 mt-1">{protocol.warning}</p>
                </div>
                
                <div>
                  <span className="font-medium text-red-400">Contraindications:</span>
                  <ul className="text-gray-300 mt-1">
                    {protocol.contraindications.map((item, i) => (
                      <li key={i} className="text-xs">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Session Limits Configuration */}
        <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Daily Session Limits
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(sessionLimits).map(([band, limit]) => (
              <div key={band} className="text-center">
                <label className="block text-sm font-medium mb-1 capitalize">{band}</label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setSessionLimits(prev => ({
                    ...prev,
                    [band]: Number(e.target.value)
                  }))}
                  className="w-full px-2 py-1 bg-gray-700 rounded text-center text-sm"
                  min="1"
                  max="120"
                />
                <span className="text-xs text-gray-400">minutes</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Stop */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              // Emergency stop all audio
              const audioContexts = (window as any).audioContexts || [];
              audioContexts.forEach((ctx: AudioContext) => {
                if (ctx.state !== 'closed') {
                  ctx.close();
                }
              });
              alert('All audio sessions terminated for safety');
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
          >
            Emergency Stop All Sessions
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SafetyDashboard;