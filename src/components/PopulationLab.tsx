import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Brain } from 'lucide-react';

interface PopulationLabProps {
  onSessionUpdate: (data: any) => void;
}

const PopulationLab: React.FC<PopulationLabProps> = ({ onSessionUpdate }) => {
  const [score, setScore] = useState(0);
  const [activeCluster, setActiveCluster] = useState<'left' | 'right' | null>(null);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Users className="w-12 h-12 text-purple-400" />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Population Lab - Neural Cluster Dynamics
          </h2>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
          <h3 className="text-2xl font-semibold mb-4">Neural Training Games</h3>
          <p className="text-gray-300 mb-6">
            Enhance your cognitive abilities through interactive neural training games.
            Challenge your attention, focus, and mental agility with brain training exercises.
          </p>
          
          <div className="h-96 bg-gray-900/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="flex gap-8 justify-center mb-8">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setActiveCluster('left')}
                  className={`w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                    activeCluster === 'left' 
                      ? 'bg-purple-500/50 shadow-lg shadow-purple-500/25' 
                      : 'bg-gray-700/50 hover:bg-gray-600/50'
                  }`}
                >
                  <Brain className="w-16 h-16 text-purple-400" />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setActiveCluster('right')}
                  className={`w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                    activeCluster === 'right' 
                      ? 'bg-pink-500/50 shadow-lg shadow-pink-500/25' 
                      : 'bg-gray-700/50 hover:bg-gray-600/50'
                  }`}
                >
                  <Brain className="w-16 h-16 text-pink-400" />
                </motion.div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">Score: {score}</div>
                <p className="text-gray-400">Click clusters to activate neural populations</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Algorithm: attention_score = (cluster_accuracy × session_duration) ÷ distractions
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PopulationLab;