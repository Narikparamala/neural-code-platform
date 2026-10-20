import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Info, Play, Pause, RotateCcw, Brain, Headphones, Volume2, VolumeX, Download, HelpCircle } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

interface PlaceLabProps {
  onSessionUpdate: (data: any) => void;
}

interface SoundSource {
  id: string;
  position: [number, number, number];
  frequency: number;
  active: boolean;
  label: string;
}

interface AIAnalysis {
  spatialAccuracy: number;
  localizationScore: number;
  hrtfEffectiveness: number;
  recommendations: string[];
  brainRegionActivation: {
    auditoryCortex: number;
    superiorOlivaryComplex: number;
    inferiorColliculus: number;
  };
}

// Simple AI Analysis Engine (Client-side only)
class SpatialAudioAI {
  private sessionData: any[] = [];
  
  analyzeSession(sources: SoundSource[], userInteractions: any[]): AIAnalysis {
    // Spatial accuracy calculation
    const spatialAccuracy = this.calculateSpatialAccuracy(sources, userInteractions);
    
    // Localization score based on user responses
    const localizationScore = this.calculateLocalizationScore(userInteractions);
    
    // HRTF effectiveness simulation
    const hrtfEffectiveness = this.calculateHRTFEffectiveness(sources);
    
    // Brain region activation simulation
    const brainRegionActivation = this.simulateBrainActivation(sources, spatialAccuracy);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(spatialAccuracy, localizationScore, hrtfEffectiveness);
    
    return {
      spatialAccuracy,
      localizationScore,
      hrtfEffectiveness,
      recommendations,
      brainRegionActivation
    };
  }
  
  private calculateSpatialAccuracy(sources: SoundSource[], interactions: any[]): number {
    if (interactions.length === 0) return 0;
    
    // Simulate accuracy based on source distribution and user interactions
    const activeSourceCount = sources.filter(s => s.active).length;
    const interactionVariance = this.calculateVariance(interactions.map(i => i.responseTime || 1000));
    
    // Higher accuracy with more sources and consistent interactions
    const baseAccuracy = Math.min(activeSourceCount * 20, 80);
    const consistencyBonus = Math.max(0, 20 - (interactionVariance / 100));
    
    return Math.min(100, baseAccuracy + consistencyBonus);
  }
  
  private calculateLocalizationScore(interactions: any[]): number {
    if (interactions.length === 0) return 0;
    
    // Simulate localization based on interaction patterns
    const avgResponseTime = interactions.reduce((sum, i) => sum + (i.responseTime || 1000), 0) / interactions.length;
    const score = Math.max(0, 100 - (avgResponseTime - 500) / 10);
    
    return Math.min(100, Math.max(0, score));
  }
  
  private calculateHRTFEffectiveness(sources: SoundSource[]): number {
    // Simulate HRTF effectiveness based on source positioning
    const positionVariance = this.calculatePositionVariance(sources);
    const frequencyRange = this.calculateFrequencyRange(sources);
    
    // Better effectiveness with varied positions and frequencies
    const positionScore = Math.min(50, positionVariance * 10);
    const frequencyScore = Math.min(50, frequencyRange / 20);
    
    return positionScore + frequencyScore;
  }
  
  private simulateBrainActivation(sources: SoundSource[], accuracy: number): any {
    // Simulate brain region activation based on spatial audio complexity
    const complexity = sources.filter(s => s.active).length;
    const baseActivation = accuracy / 100;
    
    return {
      auditoryCortex: Math.min(100, baseActivation * 80 + complexity * 5),
      superiorOlivaryComplex: Math.min(100, baseActivation * 60 + complexity * 8),
      inferiorColliculus: Math.min(100, baseActivation * 70 + complexity * 6)
    };
  }
  
  private generateRecommendations(spatial: number, localization: number, hrtf: number): string[] {
    const recommendations: string[] = [];
    
    if (spatial < 50) {
      recommendations.push("Try moving sound sources to more distinct positions for better spatial separation");
    }
    
    if (localization < 60) {
      recommendations.push("Focus on identifying sound direction before moving sources");
    }
    
    if (hrtf < 40) {
      recommendations.push("Use headphones for optimal HRTF processing and spatial audio experience");
    }
    
    if (spatial > 80 && localization > 80) {
      recommendations.push("Excellent spatial awareness! Try more complex multi-source scenarios");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Continue practicing to improve spatial audio perception");
    }
    
    return recommendations;
  }
  
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
  
  private calculatePositionVariance(sources: SoundSource[]): number {
    if (sources.length < 2) return 0;
    
    const positions = sources.map(s => s.position);
    const distances = [];
    
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dist = Math.sqrt(
          Math.pow(positions[i][0] - positions[j][0], 2) +
          Math.pow(positions[i][1] - positions[j][1], 2) +
          Math.pow(positions[i][2] - positions[j][2], 2)
        );
        distances.push(dist);
      }
    }
    
    return this.calculateVariance(distances);
  }
  
  private calculateFrequencyRange(sources: SoundSource[]): number {
    if (sources.length === 0) return 0;
    const frequencies = sources.map(s => s.frequency);
    return Math.max(...frequencies) - Math.min(...frequencies);
  }
}

// 3D Brain Model Component
function BrainModel({ sources, onSourceMove }: { sources: SoundSource[], onSourceMove: (id: string, position: [number, number, number]) => void }) {
  const brainRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (brainRef.current) {
      brainRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  return (
    <>
      {/* Brain Model */}
      <Sphere ref={brainRef} args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#8B5CF6" 
          transparent 
          opacity={0.3} 
          wireframe={false}
        />
      </Sphere>
      
      {/* Cochlea representation */}
      <Sphere args={[0.3, 16, 16]} position={[-2.2, 0, 0]}>
        <meshStandardMaterial color="#10B981" />
      </Sphere>
      <Sphere args={[0.3, 16, 16]} position={[2.2, 0, 0]}>
        <meshStandardMaterial color="#10B981" />
      </Sphere>
      
      {/* Sound Sources */}
      {sources.map((source) => (
        <group key={source.id}>
          <Sphere 
            args={[0.2, 16, 16]} 
            position={source.position}
            onClick={(e) => {
              e.stopPropagation();
              // Handle source interaction
            }}
          >
            <meshStandardMaterial 
              color={source.active ? "#F59E0B" : "#6B7280"} 
              emissive={source.active ? "#F59E0B" : "#000000"}
              emissiveIntensity={source.active ? 0.3 : 0}
            />
          </Sphere>
          <Text
            position={[source.position[0], source.position[1] + 0.5, source.position[2]]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {source.label}
          </Text>
        </group>
      ))}
      
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
    </>
  );
}

const PlaceLab: React.FC<PlaceLabProps> = ({ onSessionUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [userInteractions, setUserInteractions] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  
  const aiEngine = useRef(new SpatialAudioAI());
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodesRef = useRef<Map<string, any>>(new Map());
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [soundSources, setSoundSources] = useState<SoundSource[]>([
    { id: 'front', position: [0, 0, 3], frequency: 440, active: true, label: 'Front' },
    { id: 'back', position: [0, 0, -3], frequency: 880, active: false, label: 'Back' },
    { id: 'left', position: [-3, 0, 0], frequency: 220, active: false, label: 'Left' },
    { id: 'right', position: [3, 0, 0], frequency: 660, active: false, label: 'Right' },
    { id: 'top', position: [0, 3, 0], frequency: 1100, active: false, label: 'Top' },
    { id: 'bottom', position: [0, -3, 0], frequency: 330, active: false, label: 'Bottom' }
  ]);

  const presets = [
    { 
      name: 'Basic Stereo Test', 
      description: 'Simple left-right audio test',
      sources: ['left', 'right'],
      frequencies: [440, 880]
    },
    { 
      name: 'Surround Sound Demo', 
      description: 'Full 360-degree audio experience',
      sources: ['front', 'back', 'left', 'right'],
      frequencies: [440, 880, 220, 660]
    },
    { 
      name: 'Vertical Localization', 
      description: 'Test elevation perception',
      sources: ['top', 'bottom', 'front'],
      frequencies: [1100, 330, 440]
    },
    { 
      name: 'Cocktail Party Effect', 
      description: 'Multiple simultaneous sources',
      sources: ['front', 'left', 'right'],
      frequencies: [440, 550, 660]
    }
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
      lab: 'place',
      soundSources,
      sessionTime,
      isPlaying,
      preset: selectedPreset,
      aiAnalysis
    });
  }, [soundSources, sessionTime, isPlaying, selectedPreset, aiAnalysis, onSessionUpdate]);

  // Run AI analysis periodically
  useEffect(() => {
    if (isPlaying && userInteractions.length > 0) {
      const analysis = aiEngine.current.analyzeSession(soundSources, userInteractions);
      setAiAnalysis(analysis);
    }
  }, [soundSources, userInteractions, isPlaying]);

  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const createSpatialAudio = (source: SoundSource) => {
    const ctx = initializeAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const pannerNode = ctx.createPanner();

    // Configure 3D audio
    pannerNode.panningModel = 'HRTF';
    pannerNode.distanceModel = 'inverse';
    pannerNode.refDistance = 1;
    pannerNode.maxDistance = 10;
    pannerNode.rolloffFactor = 1;
    pannerNode.coneInnerAngle = 360;
    pannerNode.coneOuterAngle = 0;
    pannerNode.coneOuterGain = 0;

    // Set position
    pannerNode.positionX.setValueAtTime(source.position[0], ctx.currentTime);
    pannerNode.positionY.setValueAtTime(source.position[1], ctx.currentTime);
    pannerNode.positionZ.setValueAtTime(source.position[2], ctx.currentTime);

    // Set listener position (center)
    ctx.listener.positionX.setValueAtTime(0, ctx.currentTime);
    ctx.listener.positionY.setValueAtTime(0, ctx.currentTime);
    ctx.listener.positionZ.setValueAtTime(0, ctx.currentTime);

    oscillator.frequency.setValueAtTime(source.frequency, ctx.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(pannerNode);
    pannerNode.connect(ctx.destination);

    return { oscillator, gainNode, pannerNode };
  };

  const handlePlay = () => {
    if (isPlaying) {
      // Stop all sources
      sourceNodesRef.current.forEach((nodes) => {
        nodes.oscillator.stop();
      });
      sourceNodesRef.current.clear();
      setIsPlaying(false);
    } else {
      // Start active sources
      soundSources.forEach((source) => {
        if (source.active) {
          const nodes = createSpatialAudio(source);
          nodes.oscillator.start();
          sourceNodesRef.current.set(source.id, nodes);
        }
      });
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    sourceNodesRef.current.forEach((nodes) => {
      nodes.oscillator.stop();
    });
    sourceNodesRef.current.clear();
    setIsPlaying(false);
    setSessionTime(0);
    setUserInteractions([]);
    setAiAnalysis(null);
    setSoundSources(prev => prev.map(s => ({ ...s, active: s.id === 'front' })));
  };

  const handlePresetSelect = (preset: typeof presets[0]) => {
    setSoundSources(prev => prev.map(source => ({
      ...source,
      active: preset.sources.includes(source.id),
      frequency: preset.sources.includes(source.id) 
        ? preset.frequencies[preset.sources.indexOf(source.id)] 
        : source.frequency
    })));
    setSelectedPreset(preset.name);
  };

  const toggleSource = (sourceId: string) => {
    setSoundSources(prev => prev.map(source => 
      source.id === sourceId ? { ...source, active: !source.active } : source
    ));
    
    // Record user interaction
    setUserInteractions(prev => [...prev, {
      timestamp: Date.now(),
      action: 'toggle_source',
      sourceId,
      responseTime: Math.random() * 1000 + 500 // Simulate response time
    }]);

    // Update audio in real-time if playing
    if (isPlaying) {
      const source = soundSources.find(s => s.id === sourceId);
      if (source) {
        if (sourceNodesRef.current.has(sourceId)) {
          // Stop existing source
          const nodes = sourceNodesRef.current.get(sourceId);
          nodes.oscillator.stop();
          sourceNodesRef.current.delete(sourceId);
        } else {
          // Start new source
          const nodes = createSpatialAudio({ ...source, active: true });
          nodes.oscillator.start();
          sourceNodesRef.current.set(sourceId, nodes);
        }
      }
    }
  };

  const exportSession = () => {
    const sessionData = {
      timestamp: Date.now(),
      lab: 'place',
      soundSources,
      sessionTime,
      preset: selectedPreset,
      userInteractions,
      aiAnalysis
    };
    
    const dataStr = JSON.stringify(sessionData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `place-lab-session-${Date.now()}.nsd`;
    
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
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4 lg:mb-0">
            Place Lab - 3D Spatial Audio Neural Mapping
          </h1>
          <div className="flex gap-2 justify-center lg:justify-end">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
              title="Spatial Audio Guide"
            >
              <HelpCircle className="w-5 h-5" />
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
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="xl:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 space-y-6"
        >
          <h3 className="text-2xl font-bold">Spatial Controls</h3>
          
          {/* Preset Selection */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Audio Presets</h4>
            <div className="space-y-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedPreset === preset.name
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{preset.name}</div>
                  <div className="text-xs opacity-80">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sound Source Controls */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Sound Sources</h4>
            <div className="grid grid-cols-2 gap-2">
              {soundSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={`p-3 rounded-lg flex flex-col items-center transition-all ${
                    source.active ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  {source.active ? <Volume2 className="w-5 h-5 mb-1" /> : <VolumeX className="w-5 h-5 mb-1" />}
                  <span className="text-xs">{source.label}</span>
                  <span className="text-xs opacity-80">{source.frequency}Hz</span>
                </button>
              ))}
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

        {/* 3D Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="xl:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-2xl font-bold mb-6">3D Brain Model & Spatial Audio</h3>
          <div className="h-96 bg-gray-900/50 rounded-lg">
            <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
              <BrainModel 
                sources={soundSources} 
                onSourceMove={(id, position) => {
                  setSoundSources(prev => prev.map(s => 
                    s.id === id ? { ...s, position } : s
                  ));
                }}
              />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </Canvas>
          </div>
          
          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Headphones className="w-5 h-5" />
              Instructions
            </h4>
            <ul className="text-sm space-y-1">
              <li>• Use headphones for optimal 3D audio experience</li>
              <li>• Click sound source buttons to activate/deactivate</li>
              <li>• Rotate the 3D model to understand spatial relationships</li>
              <li>• Try different presets to experience various spatial scenarios</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* AI Analysis Panel */}
      {aiAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            AI Spatial Audio Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metrics */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold mb-2">Spatial Accuracy</h4>
                <div className="text-2xl font-mono text-green-400">{aiAnalysis.spatialAccuracy.toFixed(1)}%</div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${aiAnalysis.spatialAccuracy}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold mb-2">Localization Score</h4>
                <div className="text-2xl font-mono text-blue-400">{aiAnalysis.localizationScore.toFixed(1)}%</div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${aiAnalysis.localizationScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Brain Activation */}
            <div className="space-y-4">
              <h4 className="font-semibold">Brain Region Activation</h4>
              {Object.entries(aiAnalysis.brainRegionActivation).map(([region, activation]) => (
                <div key={region} className="p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm capitalize">{region.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-sm font-mono">{activation.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1">
                    <div 
                      className="bg-purple-400 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${activation}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* HRTF Effectiveness */}
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <h4 className="font-semibold mb-2">HRTF Effectiveness</h4>
              <div className="text-2xl font-mono text-yellow-400">{aiAnalysis.hrtfEffectiveness.toFixed(1)}%</div>
              <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${aiAnalysis.hrtfEffectiveness}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Head-Related Transfer Function processing quality</p>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h4 className="font-semibold">AI Recommendations</h4>
              {aiAnalysis.recommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PlaceLab;