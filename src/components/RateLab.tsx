import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Info, Volume2, VolumeX, HelpCircle, Download } from 'lucide-react';
import BinauralGenerator from './BinauralGenerator';
import OscilloscopeVisualization from './OscilloscopeVisualization';
import NeuroPrimerCard from './NeuroPrimerCard';
import SafetyProtocol from './SafetyProtocol';
import FrequencyGuide from './FrequencyGuide';

interface RateLabProps {
  onSessionUpdate: (data: any) => void;
}

const RateLab: React.FC<RateLabProps> = ({ onSessionUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [baseFreq, setBaseFreq] = useState(180);
  const [deltaFreq, setDeltaFreq] = useState(40);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const [showPrimer, setShowPrimer] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [audioMode, setAudioMode] = useState<'binaural' | 'isochronic' | 'mono'>('binaural');
  const [leftEarEnabled, setLeftEarEnabled] = useState(true);
  const [rightEarEnabled, setRightEarEnabled] = useState(true);
  const [beatPatternEnabled, setBeatPatternEnabled] = useState(true);
  
  const binauralRef = useRef<any>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const presets = [
    { name: 'Delta Sleep (1Hz)', base: 180, delta: 1, description: 'Deep sleep induction', benefits: 'Promotes deep sleep, healing, regeneration' },
    { name: 'Theta Meditation (6Hz)', base: 180, delta: 6, description: 'Meditative state', benefits: 'Enhanced creativity, deep meditation, memory' },
    { name: 'Alpha Relaxation (10Hz)', base: 180, delta: 10, description: 'Relaxed awareness', benefits: 'Stress reduction, calm alertness, learning' },
    { name: 'Beta Focus (20Hz)', base: 180, delta: 20, description: 'Enhanced focus', benefits: 'Improved concentration, problem solving, alertness' },
    { name: 'Gamma Hyperfocus (40Hz)', base: 180, delta: 40, description: 'Peak cognitive performance', benefits: 'Enhanced perception, binding consciousness, peak performance' }
  ];

  useEffect(() => {
    if (isPlaying) {
      sessionTimerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    onSessionUpdate({
      lab: 'rate',
      baseFreq,
      deltaFreq,
      sessionTime,
      isPlaying,
      preset: selectedPreset,
      audioMode,
      leftEarEnabled,
      rightEarEnabled,
      beatPatternEnabled
    });
  }, [baseFreq, deltaFreq, sessionTime, isPlaying, selectedPreset, audioMode, leftEarEnabled, rightEarEnabled, beatPatternEnabled, onSessionUpdate]);

  const handlePlay = () => {
    if (binauralRef.current) {
      if (isPlaying) {
        binauralRef.current.stop();
      } else {
        binauralRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePresetSelect = (preset: typeof presets[0]) => {
    setBaseFreq(preset.base);
    setDeltaFreq(preset.delta);
    setSelectedPreset(preset.name);
  };

  const handleReset = () => {
    if (binauralRef.current) {
      binauralRef.current.stop();
    }
    setIsPlaying(false);
    setSessionTime(0);
    setBaseFreq(180);
    setDeltaFreq(40);
    setSelectedPreset('');
    setLeftEarEnabled(true);
    setRightEarEnabled(true);
    setBeatPatternEnabled(true);
  };

  const exportSession = () => {
    const sessionData = {
      timestamp: Date.now(),
      lab: 'rate',
      baseFreq,
      deltaFreq,
      sessionTime,
      audioMode,
      preset: selectedPreset,
      leftEarEnabled,
      rightEarEnabled,
      beatPatternEnabled
    };
    
    const dataStr = JSON.stringify(sessionData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `rate-lab-session-${Date.now()}.nsd`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBrainwaveState = (freq: number) => {
    if (freq >= 0.5 && freq <= 4) return { name: 'Delta', color: 'text-purple-400', description: 'Deep sleep, healing' };
    if (freq >= 4 && freq <= 8) return { name: 'Theta', color: 'text-blue-400', description: 'Meditation, creativity' };
    if (freq >= 8 && freq <= 12) return { name: 'Alpha', color: 'text-green-400', description: 'Relaxed awareness' };
    if (freq >= 12 && freq <= 30) return { name: 'Beta', color: 'text-yellow-400', description: 'Active thinking' };
    if (freq >= 30) return { name: 'Gamma', color: 'text-red-400', description: 'Peak performance' };
    return { name: 'Custom', color: 'text-gray-400', description: 'Custom frequency' };
  };

  const currentState = getBrainwaveState(deltaFreq);

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
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4 lg:mb-0">
            Rate Lab - Neural Firing Frequency Simulator
          </h1>
          <div className="flex gap-2 justify-center lg:justify-end">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
              title="Frequency Guide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowPrimer(!showPrimer)}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
              title="Neural Primer"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={exportSession}
              className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
              title="Export Session"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <SafetyProtocol 
          frequency={deltaFreq} 
          sessionTime={sessionTime} 
          isPlaying={isPlaying} 
        />
      </motion.div>

      {/* Modals */}
      {showPrimer && (
        <NeuroPrimerCard
          title="Neural Rate Coding"
          content="Rate coding is how neurons encode information through their firing frequency. By using binaural beats, isochronic tones, and mono neural tones, we can influence brainwave patterns and experience different states of consciousness. Use the audio controls to isolate different ears and understand how your brain synchronizes to these frequencies."
          onClose={() => setShowPrimer(false)}
        />
      )}

      {showGuide && (
        <FrequencyGuide onClose={() => setShowGuide(false)} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="xl:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 space-y-6"
        >
          <h3 className="text-2xl font-bold">Frequency Controls</h3>
          
          {/* Current State Display */}
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <div className="text-center">
              <div className={`text-2xl font-bold ${currentState.color}`}>{currentState.name}</div>
              <div className="text-sm text-gray-400">{currentState.description}</div>
              <div className="text-lg font-mono mt-2">{deltaFreq}Hz</div>
            </div>
          </div>

          {/* Audio Mode Selection */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Audio Mode</h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                { mode: 'binaural' as const, label: 'Binaural Beats', desc: 'Different frequencies in each ear' },
                { mode: 'isochronic' as const, label: 'Isochronic Tones', desc: 'Rhythmic pulses at target frequency' },
                { mode: 'mono' as const, label: 'Mono Neural Tones', desc: 'Single frequency to both ears' }
              ].map((option) => (
                <button
                  key={option.mode}
                  onClick={() => setAudioMode(option.mode)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    audioMode === option.mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm opacity-80">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Audio Channel Controls */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Channel Control</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setLeftEarEnabled(!leftEarEnabled)}
                className={`p-3 rounded-lg flex flex-col items-center transition-all ${
                  leftEarEnabled ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                {leftEarEnabled ? <Volume2 className="w-5 h-5 mb-1" /> : <VolumeX className="w-5 h-5 mb-1" />}
                <span className="text-xs">Left Ear</span>
              </button>
              <button
                onClick={() => setRightEarEnabled(!rightEarEnabled)}
                className={`p-3 rounded-lg flex flex-col items-center transition-all ${
                  rightEarEnabled ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                {rightEarEnabled ? <Volume2 className="w-5 h-5 mb-1" /> : <VolumeX className="w-5 h-5 mb-1" />}
                <span className="text-xs">Right Ear</span>
              </button>
              <button
                onClick={() => setBeatPatternEnabled(!beatPatternEnabled)}
                className={`p-3 rounded-lg flex flex-col items-center transition-all ${
                  beatPatternEnabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                {beatPatternEnabled ? <Volume2 className="w-5 h-5 mb-1" /> : <VolumeX className="w-5 h-5 mb-1" />}
                <span className="text-xs">Beat</span>
              </button>
            </div>
          </div>

          {/* Preset Selection */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Presets</h4>
            <div className="space-y-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedPreset === preset.name
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{preset.name}</div>
                  <div className="text-xs opacity-80">{preset.benefits}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Base Frequency: {baseFreq}Hz
              </label>
              <input
                type="range"
                min="100"
                max="500"
                value={baseFreq}
                onChange={(e) => setBaseFreq(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>100Hz</span>
                <span>500Hz</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Delta Frequency: {deltaFreq}Hz (Beat Frequency)
              </label>
              <input
                type="range"
                min="0.5"
                max="100"
                step="0.5"
                value={deltaFreq}
                onChange={(e) => setDeltaFreq(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0.5Hz</span>
                <span>100Hz</span>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlay}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg font-medium transition-colors ${
                isPlaying 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? 'Pause' : 'Play'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Session Info */}
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Session Time</span>
              <span className="font-mono text-lg">{formatTime(sessionTime)}</span>
            </div>
          </div>
        </motion.div>

        {/* Visualization Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="xl:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-2xl font-bold mb-6">Live Oscilloscope</h3>
          <OscilloscopeVisualization 
            baseFreq={baseFreq} 
            deltaFreq={deltaFreq} 
            isPlaying={isPlaying}
            leftEarEnabled={leftEarEnabled}
            rightEarEnabled={rightEarEnabled}
            beatPatternEnabled={beatPatternEnabled}
            audioMode={audioMode}
          />
          
          {/* Analysis Panel */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <h4 className="font-semibold mb-2">Left Ear</h4>
              <div className="text-2xl font-mono">{baseFreq}Hz</div>
              <div className="text-sm text-gray-400">Base frequency</div>
            </div>
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <h4 className="font-semibold mb-2">Right Ear</h4>
              <div className="text-2xl font-mono">{baseFreq + deltaFreq}Hz</div>
              <div className="text-sm text-gray-400">Base + delta</div>
            </div>
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <h4 className="font-semibold mb-2">Beat Pattern</h4>
              <div className={`text-2xl font-mono ${currentState.color}`}>{deltaFreq}Hz</div>
              <div className="text-sm text-gray-400">{currentState.name} wave</div>
            </div>
          </div>
        </motion.div>
      </div>

      <BinauralGenerator
        ref={binauralRef}
        baseFreq={baseFreq}
        deltaFreq={deltaFreq}
        audioMode={audioMode}
        leftEarEnabled={leftEarEnabled}
        rightEarEnabled={rightEarEnabled}
        beatPatternEnabled={beatPatternEnabled}
      />
    </div>
  );
};

export default RateLab;