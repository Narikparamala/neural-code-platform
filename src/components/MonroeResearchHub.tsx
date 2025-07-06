import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, Headphones, FileText } from 'lucide-react';

const MonroeResearchHub: React.FC = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

  const hemiSyncProtocols = [
    {
      id: 'focus-10',
      name: 'Focus 10',
      description: 'Mind awake, body asleep state',
      frequency: '10 Hz',
      duration: '30 minutes',
      research: 'Developed by Robert Monroe, proven to induce relaxed awareness while maintaining mental clarity.'
    },
    {
      id: 'focus-12',
      name: 'Focus 12',
      description: 'Expanded awareness state',
      frequency: '12 Hz',
      duration: '45 minutes',
      research: 'Enhanced state of consciousness with expanded sensory perception and intuitive abilities.'
    },
    {
      id: 'focus-15',
      name: 'Focus 15',
      description: 'State of no time',
      frequency: '15 Hz',
      duration: '60 minutes',
      research: 'Transcendent state where linear time perception dissolves, allowing for deep introspection.'
    },
    {
      id: 'focus-21',
      name: 'Focus 21',
      description: 'Bridge to higher consciousness',
      frequency: '21 Hz',
      duration: '90 minutes',
      research: 'Advanced state used for consciousness exploration and potential out-of-body experiences.'
    }
  ];

  const researchFindings = [
    {
      title: 'Consciousness Mapping',
      description: 'Monroe\'s extensive research mapped different states of consciousness using audio technology.',
      citation: 'Monroe, R. (1971). Journeys Out of the Body'
    },
    {
      title: 'Binaural Beat Synchronization',
      description: 'Demonstrated that binaural beats can synchronize brainwaves to specific frequencies.',
      citation: 'Monroe Institute Research Division (1975-1995)'
    },
    {
      title: 'Enhanced Learning States',
      description: 'Studies showed improved memory and learning in specific brainwave states.',
      citation: 'Atwater, F.H. (1997). Accessing Anomalous States of Consciousness'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-12 h-12 text-orange-400" />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Monroe Research Hub
          </h2>
        </div>
        
        <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto">
          Explore Robert Monroe's groundbreaking research on consciousness and the Hemi-Sync® technology
          that revolutionized our understanding of brain states and human potential.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hemi-Sync Protocols */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-6">
            <Headphones className="w-6 h-6 text-orange-400" />
            <h3 className="text-2xl font-bold">Hemi-Sync® Protocol Library</h3>
          </div>
          
          <div className="space-y-4">
            {hemiSyncProtocols.map((protocol) => (
              <motion.div
                key={protocol.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedProtocol(protocol.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedProtocol === protocol.id
                    ? 'bg-orange-600/20 border border-orange-500/50'
                    : 'bg-gray-700/50 hover:bg-gray-600/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-lg">{protocol.name}</h4>
                  <span className="text-sm text-orange-400">{protocol.frequency}</span>
                </div>
                <p className="text-gray-300 mb-2">{protocol.description}</p>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Duration: {protocol.duration}</span>
                  <span>Research Available</span>
                </div>
                {selectedProtocol === protocol.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-3 bg-gray-900/50 rounded-lg"
                  >
                    <p className="text-sm text-gray-300">{protocol.research}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Research Findings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h3 className="text-2xl font-bold">Research Findings</h3>
          </div>
          
          <div className="space-y-6">
            {researchFindings.map((finding, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 bg-gray-700/50 rounded-lg"
              >
                <h4 className="font-semibold text-lg mb-2">{finding.title}</h4>
                <p className="text-gray-300 mb-3">{finding.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span>{finding.citation}</span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <h4 className="font-semibold mb-2">AI-Powered Analysis</h4>
            <p className="text-sm text-gray-300">
              Our AI system analyzes your session data against Monroe's empirical results to provide 
              personalized insights and recommendations for consciousness exploration.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Monroe Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 text-center"
      >
        <blockquote className="text-xl italic text-gray-300 max-w-4xl mx-auto">
          "The greatest illusion is that mankind has limitations. The reality is that mankind has no limitations 
          save those that he accepts or permits."
        </blockquote>
        <p className="mt-4 text-gray-400">— Robert Monroe</p>
      </motion.div>
    </div>
  );
};

export default MonroeResearchHub;