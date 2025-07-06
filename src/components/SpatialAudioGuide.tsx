import React from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Headphones, Globe, Volume2 } from 'lucide-react';

interface SpatialAudioGuideProps {
  onClose: () => void;
}

const SpatialAudioGuide: React.FC<SpatialAudioGuideProps> = ({ onClose }) => {
  const concepts = [
    {
      title: 'Place Coding in the Cochlea',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
      description: 'Different frequencies activate different locations along the cochlea',
      details: [
        'High frequencies (treble) activate the base of the cochlea',
        'Low frequencies (bass) activate the apex of the cochlea',
        'This creates a "frequency map" in your auditory system',
        'Brain uses this map to identify pitch and timbre'
      ],
      example: 'When you hear a 1000Hz tone, specific hair cells near the cochlea base fire'
    },
    {
      title: 'HRTF (Head-Related Transfer Function)',
      icon: Headphones,
      color: 'from-green-500 to-emerald-600',
      description: 'How your head and ears shape incoming sound waves',
      details: [
        'Sound waves interact with your head, ears, and torso',
        'Creates unique frequency filtering for each direction',
        'Brain learns these patterns to localize sounds',
        'Individual HRTF varies based on head/ear shape'
      ],
      example: 'Sound from above has different frequency content than sound from below'
    },
    {
      title: 'Interaural Time Difference (ITD)',
      icon: Volume2,
      color: 'from-blue-500 to-cyan-600',
      description: 'Time delay between sound reaching each ear',
      details: [
        'Sound reaches the closer ear first',
        'Brain calculates the time difference (microseconds)',
        'Primary cue for horizontal localization',
        'Most effective for low frequencies'
      ],
      example: 'Sound from your right reaches right ear ~0.6ms before left ear'
    },
    {
      title: 'Interaural Level Difference (ILD)',
      icon: Globe,
      color: 'from-yellow-500 to-orange-600',
      description: 'Volume difference between ears due to head shadowing',
      details: [
        'Your head blocks sound waves (acoustic shadow)',
        'Sound is louder in the ear closer to source',
        'More pronounced at high frequencies',
        'Helps with left-right localization'
      ],
      example: 'High-frequency sound from left is 10-20dB louder in left ear'
    }
  ];

  const practicalTips = [
    {
      title: 'Optimal Setup',
      tips: [
        'Use quality over-ear headphones',
        'Ensure proper left/right channel placement',
        'Sit in quiet environment',
        'Keep head still during tests'
      ]
    },
    {
      title: 'What to Listen For',
      tips: [
        'Direction of sound sources',
        'Distance perception',
        'Movement of sounds in 3D space',
        'Separation of multiple sources'
      ]
    },
    {
      title: 'Training Exercises',
      tips: [
        'Start with simple left-right tests',
        'Progress to front-back discrimination',
        'Practice with elevation changes',
        'Try multiple simultaneous sources'
      ]
    }
  ];

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
        className="bg-gray-900 rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Spatial Audio & Place Coding Guide
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Core Concepts */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Core Concepts</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {concepts.map((concept, index) => (
              <motion.div
                key={concept.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl bg-gradient-to-br ${concept.color} text-white`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <concept.icon className="w-8 h-8" />
                  <h4 className="text-xl font-bold">{concept.title}</h4>
                </div>
                
                <p className="mb-4 font-medium">{concept.description}</p>
                
                <div className="mb-4">
                  <h5 className="font-semibold mb-2">How it works:</h5>
                  <ul className="text-sm space-y-1">
                    {concept.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-white rounded-full mt-2 flex-shrink-0"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white/20 rounded-lg p-3">
                  <h5 className="font-semibold mb-1">Example:</h5>
                  <p className="text-sm">{concept.example}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Practical Tips */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Practical Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {practicalTips.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gray-800/50 rounded-xl border border-gray-700"
              >
                <h4 className="text-xl font-bold mb-3">{section.title}</h4>
                <ul className="space-y-2">
                  {section.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1 h-1 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scientific Background */}
        <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-500/30">
          <h3 className="text-xl font-bold mb-4">Scientific Background</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-green-400">Research Foundations:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Georg von Békésy's cochlear mechanics (Nobel Prize 1961)</li>
                <li>• Rayleigh's duplex theory of sound localization (1907)</li>
                <li>• Modern HRTF research by Wightman & Kistler (1989)</li>
                <li>• Binaural processing in superior olivary complex</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-yellow-400">Clinical Applications:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Hearing aid design and fitting</li>
                <li>• Cochlear implant programming</li>
                <li>• Auditory processing disorder diagnosis</li>
                <li>• Virtual reality audio systems</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SpatialAudioGuide;