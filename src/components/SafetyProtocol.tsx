import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Shield } from 'lucide-react';

interface SafetyProtocolProps {
  frequency: number;
  sessionTime: number;
  isPlaying: boolean;
}

const SafetyProtocol: React.FC<SafetyProtocolProps> = ({ frequency, sessionTime, isPlaying }) => {
  const getFrequencyBand = (freq: number) => {
    if (freq >= 1 && freq <= 4) return 'Delta';
    if (freq >= 4 && freq <= 8) return 'Theta';
    if (freq >= 8 && freq <= 12) return 'Alpha';
    if (freq >= 12 && freq <= 30) return 'Beta';
    if (freq >= 30) return 'Gamma';
    return 'Unknown';
  };

  const getRecommendedLimit = (freq: number) => {
    if (freq >= 1 && freq <= 4) return 60; // Delta: 60 minutes
    if (freq >= 4 && freq <= 8) return 45; // Theta: 45 minutes
    if (freq >= 8 && freq <= 12) return 60; // Alpha: 60 minutes
    if (freq >= 12 && freq <= 30) return 30; // Beta: 30 minutes
    if (freq >= 30) return 20; // Gamma: 20 minutes
    return 30;
  };

  const getSafetyLevel = (freq: number, time: number) => {
    const limit = getRecommendedLimit(freq);
    const timeInMinutes = time / 60;
    
    if (timeInMinutes > limit) return 'danger';
    if (timeInMinutes > limit * 0.8) return 'warning';
    return 'safe';
  };

  const band = getFrequencyBand(frequency);
  const limit = getRecommendedLimit(frequency);
  const safetyLevel = getSafetyLevel(frequency, sessionTime);
  const timeInMinutes = Math.floor(sessionTime / 60);

  const getWarningMessage = () => {
    if (frequency >= 30 && sessionTime > 1200) { // 20 minutes
      return 'Gamma sessions should be limited to 20 minutes - UCSF Study 2023';
    }
    if (frequency >= 1 && frequency <= 4 && sessionTime > 3600) { // 60 minutes
      return 'Extended delta exposure may cause excessive drowsiness';
    }
    if (frequency >= 4 && frequency <= 8 && sessionTime > 2700) { // 45 minutes
      return 'Extended theta sessions may cause disorientation';
    }
    if (frequency >= 12 && frequency <= 30 && sessionTime > 1800) { // 30 minutes
      return 'Extended beta sessions may cause anxiety or restlessness';
    }
    return null;
  };

  const warningMessage = getWarningMessage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        safetyLevel === 'danger' 
          ? 'bg-red-900/20 border-red-500/50' 
          : safetyLevel === 'warning'
          ? 'bg-yellow-900/20 border-yellow-500/50'
          : 'bg-green-900/20 border-green-500/50'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Shield className={`w-5 h-5 ${
          safetyLevel === 'danger' ? 'text-red-400' : 
          safetyLevel === 'warning' ? 'text-yellow-400' : 'text-green-400'
        }`} />
        <h4 className="font-semibold">Safety Protocol</h4>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Band:</span>
          <span className="ml-2 font-medium">{band}</span>
        </div>
        <div>
          <span className="text-gray-400">Frequency:</span>
          <span className="ml-2 font-medium">{frequency}Hz</span>
        </div>
        <div>
          <span className="text-gray-400">Session:</span>
          <span className="ml-2 font-medium">{timeInMinutes}min</span>
        </div>
        <div>
          <span className="text-gray-400">Limit:</span>
          <span className="ml-2 font-medium">{limit}min</span>
        </div>
      </div>
      
      {warningMessage && (
        <div className="mt-3 flex items-center gap-2 p-2 bg-yellow-900/30 rounded">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-300">{warningMessage}</span>
        </div>
      )}
      
      {isPlaying && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Session active - monitoring safety parameters</span>
        </div>
      )}
    </motion.div>
  );
};

export default SafetyProtocol;