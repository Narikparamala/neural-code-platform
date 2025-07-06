import React from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Zap, Moon, Eye, Target } from 'lucide-react';

interface FrequencyGuideProps {
  onClose: () => void;
}

const FrequencyGuide: React.FC<FrequencyGuideProps> = ({ onClose }) => {
  const frequencyBands = [
    {
      name: 'Delta Waves',
      range: '0.5 - 4 Hz',
      icon: Moon,
      color: 'from-purple-500 to-indigo-600',
      description: 'Deep sleep, healing, regeneration',
      benefits: [
        'Promotes deep, restorative sleep',
        'Enhances immune system function',
        'Accelerates healing processes',
        'Releases growth hormone'
      ],
      usage: 'Use before bedtime or during rest periods. Limit to 60 minutes.',
      examples: ['1Hz - Deep sleep induction', '2Hz - Pain relief', '3Hz - Healing meditation']
    },
    {
      name: 'Theta Waves',
      range: '4 - 8 Hz',
      icon: Eye,
      color: 'from-blue-500 to-cyan-600',
      description: 'Deep meditation, creativity, memory',
      benefits: [
        'Enhanced creativity and intuition',
        'Deep meditative states',
        'Improved memory consolidation',
        'Emotional healing and processing'
      ],
      usage: 'Ideal for meditation, creative work, and learning. Limit to 45 minutes.',
      examples: ['4Hz - Deep meditation', '6Hz - Creative flow', '7Hz - Memory enhancement']
    },
    {
      name: 'Alpha Waves',
      range: '8 - 12 Hz',
      icon: Brain,
      color: 'from-green-500 to-emerald-600',
      description: 'Relaxed awareness, learning',
      benefits: [
        'Stress reduction and relaxation',
        'Enhanced learning ability',
        'Improved focus without tension',
        'Bridge between conscious and subconscious'
      ],
      usage: 'Safe for extended use. Great for studying and relaxation.',
      examples: ['8Hz - Stress relief', '10Hz - Learning state', '12Hz - Calm alertness']
    },
    {
      name: 'Beta Waves',
      range: '12 - 30 Hz',
      icon: Target,
      color: 'from-yellow-500 to-orange-600',
      description: 'Active thinking, problem solving',
      benefits: [
        'Enhanced concentration and focus',
        'Improved analytical thinking',
        'Increased alertness',
        'Better problem-solving abilities'
      ],
      usage: 'Use for work and study sessions. Limit to 30 minutes to avoid overstimulation.',
      examples: ['15Hz - Mental clarity', '20Hz - Peak focus', '25Hz - High alertness']
    },
    {
      name: 'Gamma Waves',
      range: '30 - 100 Hz',
      icon: Zap,
      color: 'from-red-500 to-pink-600',
      description: 'Peak performance, consciousness binding',
      benefits: [
        'Enhanced perception and awareness',
        'Improved cognitive processing',
        'Heightened consciousness',
        'Peak mental performance'
      ],
      usage: 'Use sparingly. Limit to 20 minutes. Research is ongoing.',
      examples: ['40Hz - Cognitive enhancement', '60Hz - Heightened awareness', '80Hz - Peak states']
    }
  ];

  const audioModes = [
    {
      name: 'Binaural Beats',
      description: 'Different frequencies played in each ear create a "beat" frequency in the brain',
      howItWorks: 'Left ear: 180Hz, Right ear: 220Hz = 40Hz beat frequency (Gamma)',
      benefits: 'Most researched method, effective for brainwave entrainment',
      requirements: 'Requires stereo headphones'
    },
    {
      name: 'Isochronic Tones',
      description: 'Rhythmic pulses of sound at the target frequency',
      howItWorks: 'Single tone pulsed on/off at 40Hz creates direct 40Hz stimulation',
      benefits: 'Works with speakers, more direct stimulation',
      requirements: 'Can use speakers or headphones'
    },
    {
      name: 'Mono Neural Tones',
      description: 'Single frequency played to both ears simultaneously',
      howItWorks: 'Both ears receive 40Hz tone directly',
      benefits: 'Simple, direct frequency exposure',
      requirements: 'Headphones or speakers'
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
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Frequency Guide & Audio Modes
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Brainwave Frequencies */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Brainwave Frequencies</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {frequencyBands.map((band, index) => (
              <motion.div
                key={band.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl bg-gradient-to-br ${band.color} text-white`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <band.icon className="w-8 h-8" />
                  <div>
                    <h4 className="text-xl font-bold">{band.name}</h4>
                    <p className="text-sm opacity-90">{band.range}</p>
                  </div>
                </div>
                
                <p className="mb-4 font-medium">{band.description}</p>
                
                <div className="mb-4">
                  <h5 className="font-semibold mb-2">Benefits:</h5>
                  <ul className="text-sm space-y-1">
                    {band.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-white rounded-full mt-2 flex-shrink-0"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h5 className="font-semibold mb-2">Usage Guidelines:</h5>
                  <p className="text-sm">{band.usage}</p>
                </div>
                
                <div>
                  <h5 className="font-semibold mb-2">Examples:</h5>
                  <div className="space-y-1">
                    {band.examples.map((example, i) => (
                      <div key={i} className="text-sm bg-white/20 rounded px-2 py-1">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Audio Modes */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Audio Delivery Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {audioModes.map((mode, index) => (
              <motion.div
                key={mode.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gray-800/50 rounded-xl border border-gray-700"
              >
                <h4 className="text-xl font-bold mb-3">{mode.name}</h4>
                <p className="text-gray-300 mb-4">{mode.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-semibold text-sm text-blue-400">How it works:</h5>
                    <p className="text-sm text-gray-300">{mode.howItWorks}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-sm text-green-400">Benefits:</h5>
                    <p className="text-sm text-gray-300">{mode.benefits}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-sm text-yellow-400">Requirements:</h5>
                    <p className="text-sm text-gray-300">{mode.requirements}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Usage Tips */}
        <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-500/30">
          <h3 className="text-xl font-bold mb-4">Usage Tips for Optimal Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-green-400">Do:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Use quality headphones for binaural beats</li>
                <li>• Start with lower frequencies and shorter sessions</li>
                <li>• Stay hydrated during sessions</li>
                <li>• Use in a quiet, comfortable environment</li>
                <li>• Monitor your response and adjust accordingly</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-red-400">Don't:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Exceed recommended session times</li>
                <li>• Use while driving or operating machinery</li>
                <li>• Use if you have epilepsy or seizure disorders</li>
                <li>• Use gamma frequencies for extended periods</li>
                <li>• Ignore safety warnings and protocols</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FrequencyGuide;