import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Download, Upload, Settings, 
  Volume2, VolumeX, HelpCircle, TrendingUp, Eye
} from 'lucide-react';
import PresetSaveButton from './PresetSaveButton';
import { SessionShareButton, SessionSavedNote, useSessionRecorder, fmtDuration } from './SessionShare';
import { consumePresetForLab } from '../lib/social';

interface AudioConfig {
  id: string;
  type: 'binaural' | 'isochronic' | 'monaural';
  frequency: number;
  carrierFreq: number;
  volume: number;
  enabled: boolean;
  phase: number;
}

interface BackgroundSound {
  id: string;
  name: string;
  type: 'white' | 'pink' | 'brown' | 'nature';
  volume: number;
  enabled: boolean;
}

interface SessionConfig {
  name: string;
  duration: number;
  audioConfigs: AudioConfig[];
  backgroundSounds: BackgroundSound[];
  rampingEnabled: boolean;
  rampDuration: number;
  startFreq: number;
  endFreq: number;
}

interface FrequencyLabProps {
  onSessionUpdate?: (data: any) => void;
}

// Advanced Audio Engine
class AdvancedAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: Map<string, OscillatorNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private noiseBuffers: Map<string, AudioBuffer> = new Map();
  private noiseNodes: Map<string, AudioBufferSourceNode> = new Map();
  private analyser: AnalyserNode | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.masterGain.connect(this.analyser);

    // Generate noise buffers
    await this.generateNoiseBuffers();
    
    this.isInitialized = true;
  }

  private async generateNoiseBuffers(): Promise<void> {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const bufferSize = sampleRate * 2; // 2 seconds of audio

    // White noise
    const whiteBuffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
    const whiteData = whiteBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      whiteData[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffers.set('white', whiteBuffer);

    // Pink noise (1/f noise)
    const pinkBuffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
    const pinkData = pinkBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      pinkData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    this.noiseBuffers.set('pink', pinkBuffer);

    // Brown noise
    const brownBuffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
    const brownData = brownBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      brownData[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = brownData[i];
      brownData[i] *= 3.5;
    }
    this.noiseBuffers.set('brown', brownBuffer);
  }

  startAudioConfig(config: AudioConfig): void {
    if (!this.audioContext || !this.masterGain) return;

    this.stopAudioConfig(config.id);

    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(config.volume * 0.1, this.audioContext.currentTime);
    gainNode.connect(this.masterGain);
    this.gainNodes.set(config.id, gainNode);

    if (config.type === 'binaural') {
      this.createBinauralBeat(config, gainNode);
    } else if (config.type === 'isochronic') {
      this.createIsochronicTone(config, gainNode);
    } else if (config.type === 'monaural') {
      this.createMonauralBeat(config, gainNode);
    }
  }

  private createBinauralBeat(config: AudioConfig, gainNode: GainNode): void {
    if (!this.audioContext) return;

    // Left ear
    const leftOsc = this.audioContext.createOscillator();
    const leftGain = this.audioContext.createGain();
    const leftPanner = this.audioContext.createStereoPanner();
    
    leftOsc.frequency.setValueAtTime(config.carrierFreq, this.audioContext.currentTime);
    leftOsc.type = 'sine';
    leftGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    leftPanner.pan.setValueAtTime(-1, this.audioContext.currentTime);
    
    leftOsc.connect(leftGain);
    leftGain.connect(leftPanner);
    leftPanner.connect(gainNode);
    leftOsc.start();

    // Right ear
    const rightOsc = this.audioContext.createOscillator();
    const rightGain = this.audioContext.createGain();
    const rightPanner = this.audioContext.createStereoPanner();
    
    rightOsc.frequency.setValueAtTime(config.carrierFreq + config.frequency, this.audioContext.currentTime);
    rightOsc.type = 'sine';
    rightGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    rightPanner.pan.setValueAtTime(1, this.audioContext.currentTime);
    
    rightOsc.connect(rightGain);
    rightGain.connect(rightPanner);
    rightPanner.connect(gainNode);
    rightOsc.start();

    this.oscillators.set(config.id + '_left', leftOsc);
    this.oscillators.set(config.id + '_right', rightOsc);
  }

  private createIsochronicTone(config: AudioConfig, gainNode: GainNode): void {
    if (!this.audioContext) return;

    const carrierOsc = this.audioContext.createOscillator();
    const modulatorOsc = this.audioContext.createOscillator();
    const modulatorGain = this.audioContext.createGain();
    const pulseGain = this.audioContext.createGain();

    carrierOsc.frequency.setValueAtTime(config.carrierFreq, this.audioContext.currentTime);
    carrierOsc.type = 'sine';

    modulatorOsc.frequency.setValueAtTime(Math.max(0.1, config.frequency), this.audioContext.currentTime);
    modulatorOsc.type = 'square';

    // Square LFO output is +/-1. Depth 0.5 around a base of 0.5 gives a
    // clean 0..1 pulse, so the volume parameter is never pushed negative.
    pulseGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    modulatorGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);

    modulatorOsc.connect(modulatorGain);
    modulatorGain.connect(pulseGain.gain);

    carrierOsc.connect(pulseGain);
    pulseGain.connect(gainNode);

    carrierOsc.start();
    modulatorOsc.start();

    this.oscillators.set(config.id + '_carrier', carrierOsc);
    this.oscillators.set(config.id + '_modulator', modulatorOsc);
    this.gainNodes.set(config.id + '_pulse', pulseGain);
    this.gainNodes.set(config.id + '_mod', modulatorGain);
  }

  private createMonauralBeat(config: AudioConfig, gainNode: GainNode): void {
    if (!this.audioContext) return;

    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const merger = this.audioContext.createChannelMerger(2);
    
    osc1.frequency.setValueAtTime(config.carrierFreq, this.audioContext.currentTime);
    osc2.frequency.setValueAtTime(config.carrierFreq + config.frequency, this.audioContext.currentTime);
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    
    osc1.connect(merger, 0, 0);
    osc1.connect(merger, 0, 1);
    osc2.connect(merger, 0, 0);
    osc2.connect(merger, 0, 1);
    
    merger.connect(gainNode);
    
    osc1.start();
    osc2.start();
    
    this.oscillators.set(config.id + '_osc1', osc1);
    this.oscillators.set(config.id + '_osc2', osc2);
  }

  startBackgroundSound(sound: BackgroundSound): void {
    if (!this.audioContext || !this.masterGain) return;

    this.stopBackgroundSound(sound.id);

    const buffer = this.noiseBuffers.get(sound.type);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    source.loop = true;
    gainNode.gain.setValueAtTime(sound.volume * 0.05, this.audioContext.currentTime);
    
    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    source.start();
    
    this.noiseNodes.set(sound.id, source);
    this.gainNodes.set(sound.id + '_bg', gainNode);
  }

  stopAudioConfig(id: string): void {
    // Stop oscillators
    this.oscillators.forEach((osc, key) => {
      if (key.startsWith(id)) {
        try {
          osc.stop();
        } catch (e) {
          // Oscillator already stopped
        }
        this.oscillators.delete(key);
      }
    });

    // Clean up gain nodes
    this.gainNodes.forEach((gain, key) => {
      if (key === id || key.startsWith(id + '_')) {
        gain.disconnect();
        this.gainNodes.delete(key);
      }
    });
  }

  stopBackgroundSound(id: string): void {
    const source = this.noiseNodes.get(id);
    if (source) {
      try {
        source.stop();
      } catch (e) {
        // Source already stopped
      }
      this.noiseNodes.delete(id);
    }

    const gainNode = this.gainNodes.get(id + '_bg');
    if (gainNode) {
      gainNode.disconnect();
      this.gainNodes.delete(id + '_bg');
    }
  }

  updateVolume(id: string, volume: number, isBackground = false): void {
    const gainNode = this.gainNodes.get(isBackground ? id + '_bg' : id);
    if (gainNode && this.audioContext) {
      const targetVolume = isBackground ? volume * 0.05 : volume * 0.1;
      gainNode.gain.setTargetAtTime(targetVolume, this.audioContext.currentTime, 0.1);
    }
  }

  updateFrequency(id: string, frequency: number, carrierFreq?: number): void {
    if (!this.audioContext) return;

    // Update oscillator frequencies based on type
    this.oscillators.forEach((osc, key) => {
      if (key.startsWith(id)) {
        if (key.includes('_left')) {
          osc.frequency.setTargetAtTime(carrierFreq || 200, this.audioContext!.currentTime, 0.1);
        } else if (key.includes('_right')) {
          osc.frequency.setTargetAtTime((carrierFreq || 200) + frequency, this.audioContext!.currentTime, 0.1);
        } else if (key.includes('_carrier')) {
          osc.frequency.setTargetAtTime(carrierFreq || 200, this.audioContext!.currentTime, 0.1);
        } else if (key.includes('_modulator')) {
          osc.frequency.setTargetAtTime(frequency, this.audioContext!.currentTime, 0.1);
        } else if (key.includes('_osc1')) {
          osc.frequency.setTargetAtTime(carrierFreq || 200, this.audioContext!.currentTime, 0.1);
        } else if (key.includes('_osc2')) {
          osc.frequency.setTargetAtTime((carrierFreq || 200) + frequency, this.audioContext!.currentTime, 0.1);
        }
      }
    });
  }

  getFrequencyData(): Uint8Array | null {
    if (!this.analyser) return null;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  stopAll(): void {
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.oscillators.clear();

    this.noiseNodes.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.noiseNodes.clear();

    this.gainNodes.forEach(gain => gain.disconnect());
    this.gainNodes.clear();
  }

  destroy(): void {
    this.stopAll();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.masterGain = null;
    this.analyser = null;
    this.noiseBuffers.clear();
    this.isInitialized = false;
  }
}

const FrequencyLab: React.FC<FrequencyLabProps> = ({ onSessionUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<SessionConfig>({
    name: 'Default Session',
    duration: 1800, // 30 minutes
    audioConfigs: [
      {
        id: 'binaural_1',
        type: 'binaural',
        frequency: 10,
        carrierFreq: 200,
        volume: 0.7,
        enabled: true,
        phase: 0
      }
    ],
    backgroundSounds: [
      {
        id: 'white_noise',
        name: 'White Noise',
        type: 'white',
        volume: 0.3,
        enabled: false
      },
      {
        id: 'pink_noise',
        name: 'Pink Noise',
        type: 'pink',
        volume: 0.3,
        enabled: false
      },
      {
        id: 'brown_noise',
        name: 'Brown Noise',
        type: 'brown',
        volume: 0.3,
        enabled: false
      }
    ],
    rampingEnabled: false,
    rampDuration: 300,
    startFreq: 10,
    endFreq: 40
  });

  const [audioEngine] = useState(() => new AdvancedAudioEngine());
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rampingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [loadedPreset, setLoadedPreset] = useState('');
  const [loadedPresetId, setLoadedPresetId] = useState<string | null>(null);

  useEffect(() => {
    const pending = consumePresetForLab('frequency');
    if (!pending) return;
    const config = pending.config;
    if (config && Array.isArray(config.audioConfigs)) {
      setCurrentConfig((prev) => ({
        ...prev,
        ...config,
        audioConfigs: config.audioConfigs.filter(
          (item: any) => item && typeof item.id === 'string' && typeof item.frequency === 'number'
        ),
        backgroundSounds: Array.isArray(config.backgroundSounds)
          ? config.backgroundSounds
          : prev.backgroundSounds,
      }));
    }
    setLoadedPreset(pending.title);
    setLoadedPresetId(pending.id);
  }, []);

  const lastSession = useSessionRecorder({
    lab: 'frequency',
    playing: isPlaying,
    details: {
      name: currentConfig.name,
      layers: currentConfig.audioConfigs.filter((item) => item.enabled).length,
      carrier: currentConfig.audioConfigs[0]?.carrierFreq ?? null,
      beat: currentConfig.audioConfigs[0]?.frequency ?? null,
    },
    presetId: loadedPresetId,
  });

  // Frequency presets
  const frequencyPresets = [
    { name: 'Delta Sleep', freq: 2, carrier: 180, description: 'Deep sleep induction' },
    { name: 'Theta Meditation', freq: 6, carrier: 200, description: 'Deep meditation state' },
    { name: 'Alpha Relaxation', freq: 10, carrier: 220, description: 'Relaxed awareness' },
    { name: 'Beta Focus', freq: 20, carrier: 240, description: 'Enhanced concentration' },
    { name: 'Gamma Peak', freq: 40, carrier: 260, description: 'Peak cognitive performance' }
  ];

  useEffect(() => {
    // The audio context is created on the first Play (a user gesture). Creating it on
    // mount can leave a suspended context behind and make later plays build a second one.
    return () => {
      audioEngine.destroy();
    };
  }, [audioEngine]);

  useEffect(() => {
    if (isPlaying) {
      sessionTimerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);

      // Start frequency ramping if enabled
      if (currentConfig.rampingEnabled) {
        startFrequencyRamping();
      }

      // Start frequency monitoring
      const monitorFrequency = () => {
        const data = audioEngine.getFrequencyData();
        setFrequencyData(data);
        if (isPlaying) {
          requestAnimationFrame(monitorFrequency);
        }
      };
      monitorFrequency();
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
      if (rampingTimerRef.current) {
        clearInterval(rampingTimerRef.current);
      }
    }

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      if (rampingTimerRef.current) clearInterval(rampingTimerRef.current);
    };
  }, [
    isPlaying,
    currentConfig.rampingEnabled,
    currentConfig.startFreq,
    currentConfig.endFreq,
    currentConfig.rampDuration,
  ]);

  // Stop cleanly when the configured session length is reached.
  useEffect(() => {
    if (!isPlaying || !currentConfig.duration) return;
    if (sessionTime >= currentConfig.duration) {
      audioEngine.stopAll();
      setIsPlaying(false);
    }
  }, [sessionTime, isPlaying, currentConfig.duration]);

  useEffect(() => {
    onSessionUpdate?.({
      lab: 'frequency',
      config: currentConfig,
      sessionTime,
      isPlaying,
      frequencyData: frequencyData ? Array.from(frequencyData) : null
    });
  }, [currentConfig, sessionTime, isPlaying, frequencyData, onSessionUpdate]);

  const startFrequencyRamping = () => {
    if (!currentConfig.rampingEnabled) return;

    const steps = currentConfig.rampDuration;
    const freqDiff = currentConfig.endFreq - currentConfig.startFreq;
    const stepSize = freqDiff / steps;
    let currentStep = 0;

    rampingTimerRef.current = setInterval(() => {
      if (currentStep >= steps) {
        if (rampingTimerRef.current) {
          clearInterval(rampingTimerRef.current);
        }
        return;
      }

      const newFreq = currentConfig.startFreq + (stepSize * currentStep);
      
      // Update all enabled audio configs
      setCurrentConfig(prev => ({
        ...prev,
        audioConfigs: prev.audioConfigs.map(config => ({
          ...config,
          frequency: config.enabled ? newFreq : config.frequency
        }))
      }));

      currentStep++;
    }, 1000);
  };

  const handlePlay = async () => {
    if (isPlaying) {
      audioEngine.stopAll();
      setIsPlaying(false);
    } else {
      await audioEngine.initialize();
      
      // Start enabled audio configs
      currentConfig.audioConfigs.forEach(config => {
        if (config.enabled) {
          audioEngine.startAudioConfig(config);
        }
      });

      // Start enabled background sounds
      currentConfig.backgroundSounds.forEach(sound => {
        if (sound.enabled) {
          audioEngine.startBackgroundSound(sound);
        }
      });

      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    audioEngine.stopAll();
    setIsPlaying(false);
    setSessionTime(0);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    if (rampingTimerRef.current) clearInterval(rampingTimerRef.current);
  };

  const addAudioConfig = (type: 'binaural' | 'isochronic' | 'monaural') => {
    const newConfig: AudioConfig = {
      id: `${type}_${Date.now()}`,
      type,
      frequency: 10,
      carrierFreq: 200,
      volume: 0.7,
      enabled: false,
      phase: 0
    };

    setCurrentConfig(prev => ({
      ...prev,
      audioConfigs: [...prev.audioConfigs, newConfig]
    }));
  };

  const updateAudioConfig = (id: string, updates: Partial<AudioConfig>) => {
    setCurrentConfig(prev => ({
      ...prev,
      audioConfigs: prev.audioConfigs.map(config =>
        config.id === id ? { ...config, ...updates } : config
      )
    }));

    // Update real-time if playing
    if (isPlaying) {
      const config = currentConfig.audioConfigs.find(c => c.id === id);
      if (config) {
        if (updates.enabled !== undefined) {
          if (updates.enabled) {
            audioEngine.startAudioConfig({ ...config, ...updates });
          } else {
            audioEngine.stopAudioConfig(id);
          }
        } else {
          if (updates.volume !== undefined) {
            audioEngine.updateVolume(id, updates.volume);
          }
          if (updates.frequency !== undefined || updates.carrierFreq !== undefined) {
            audioEngine.updateFrequency(
              id, 
              updates.frequency ?? config.frequency,
              updates.carrierFreq ?? config.carrierFreq
            );
          }
        }
      }
    }
  };

  const updateBackgroundSound = (id: string, updates: Partial<BackgroundSound>) => {
    setCurrentConfig(prev => ({
      ...prev,
      backgroundSounds: prev.backgroundSounds.map(sound =>
        sound.id === id ? { ...sound, ...updates } : sound
      )
    }));

    // Update real-time if playing
    if (isPlaying) {
      const sound = currentConfig.backgroundSounds.find(s => s.id === id);
      if (sound) {
        if (updates.enabled !== undefined) {
          if (updates.enabled) {
            audioEngine.startBackgroundSound({ ...sound, ...updates });
          } else {
            audioEngine.stopBackgroundSound(id);
          }
        } else if (updates.volume !== undefined) {
          audioEngine.updateVolume(id, updates.volume, true);
        }
      }
    }
  };

  const removeAudioConfig = (id: string) => {
    audioEngine.stopAudioConfig(id);
    setCurrentConfig(prev => ({
      ...prev,
      audioConfigs: prev.audioConfigs.filter(config => config.id !== id)
    }));
  };

  const saveConfiguration = () => {
    const configData = JSON.stringify(currentConfig, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(configData);
    const exportFileDefaultName = `frequency-lab-${currentConfig.name.replace(/\s+/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const loadConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        setCurrentConfig(config);
      } catch (error) {
        alert('Error loading configuration file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBrainwaveState = (freq: number) => {
    if (freq >= 0.5 && freq <= 4) return { name: 'Delta', color: 'text-purple-400' };
    if (freq >= 4 && freq <= 8) return { name: 'Theta', color: 'text-blue-400' };
    if (freq >= 8 && freq <= 12) return { name: 'Alpha', color: 'text-green-400' };
    if (freq >= 12 && freq <= 30) return { name: 'Beta', color: 'text-yellow-400' };
    if (freq >= 30) return { name: 'Gamma', color: 'text-red-400' };
    return { name: 'Custom', color: 'text-gray-400' };
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
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4 lg:mb-0">
            Advanced Frequency Laboratory
          </h1>
          <div className="flex gap-2 justify-center lg:justify-end">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-full transition-colors"
              title="User Guide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-full transition-colors"
              title="Session Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={saveConfiguration}
              className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
              title="Save Configuration"
            >
              <Download className="w-5 h-5" />
            </button>
            <label className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors cursor-pointer" title="Load Configuration">
              <Upload className="w-5 h-5" />
              <input
                type="file"
                accept=".json"
                onChange={loadConfiguration}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2">
        <PresetSaveButton
          lab="frequency"
          config={currentConfig}
          defaultTitle={`${currentConfig.name} · ${currentConfig.audioConfigs.filter((item) => item.enabled).length} layer${
            currentConfig.audioConfigs.filter((item) => item.enabled).length === 1 ? '' : 's'
          }`}
        />
        {(sessionTime >= 10 || lastSession) && (
          <SessionShareButton
            payload={{
              kind: 'session',
              badge: 'Frequency Lab session',
              title: currentConfig.name,
              subtitle: `${currentConfig.audioConfigs.filter((item) => item.enabled).length} active layer(s) · ${
                currentConfig.audioConfigs[0]?.carrierFreq || 200
              } Hz carrier`,
              stats: [
                { label: 'Session', value: fmtDuration(lastSession?.seconds || sessionTime) },
                { label: 'Layers', value: String(currentConfig.audioConfigs.filter((item) => item.enabled).length) },
                { label: 'Beat', value: `${currentConfig.audioConfigs[0]?.frequency ?? 0} Hz` },
                { label: 'Carrier', value: `${currentConfig.audioConfigs[0]?.carrierFreq ?? 0} Hz` },
              ],
              caption: `${currentConfig.name} — a layered Frequency Lab session.`,
            }}
          />
        )}
        {loadedPreset && <span className="text-xs text-cyan-300">Loaded preset: {loadedPreset}</span>}
        <SessionSavedNote last={lastSession} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Audio Configurations Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="xl:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">Audio Configurations</h3>
            <div className="flex gap-2">
              <button
                onClick={() => addAudioConfig('binaural')}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
              >
                + Binaural
              </button>
              <button
                onClick={() => addAudioConfig('isochronic')}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
              >
                + Isochronic
              </button>
              <button
                onClick={() => addAudioConfig('monaural')}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
              >
                + Monaural
              </button>
            </div>
          </div>

          {/* Frequency Presets */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Quick Presets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {frequencyPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    if (currentConfig.audioConfigs.length > 0) {
                      updateAudioConfig(currentConfig.audioConfigs[0].id, {
                        frequency: preset.freq,
                        carrierFreq: preset.carrier
                      });
                    }
                  }}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-left transition-colors"
                >
                  <div className="font-medium text-sm">{preset.name}</div>
                  <div className="text-xs text-gray-400">{preset.freq}Hz - {preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Audio Config List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {currentConfig.audioConfigs.map((config) => (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-700/50 rounded-lg border border-gray-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateAudioConfig(config.id, { enabled: !config.enabled })}
                      className={`p-2 rounded transition-colors ${
                        config.enabled ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      {config.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="font-medium capitalize">{config.type} Beat</div>
                      <div className={`text-sm ${getBrainwaveState(config.frequency).color}`}>
                        {getBrainwaveState(config.frequency).name} - {config.frequency}Hz
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeAudioConfig(config.id)}
                    className="p-1 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Beat Frequency: {config.frequency}Hz
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="40"
                      step="0.5"
                      value={config.frequency}
                      onChange={(e) => updateAudioConfig(config.id, { frequency: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Carrier: {config.carrierFreq}Hz
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="1000"
                      step="10"
                      value={config.carrierFreq}
                      onChange={(e) => updateAudioConfig(config.id, { carrierFreq: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Volume: {Math.round(config.volume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.volume}
                      onChange={(e) => updateAudioConfig(config.id, { volume: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Background Sounds & Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="xl:col-span-1 space-y-6"
        >
          {/* Background Sounds */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Background Sounds</h3>
            <div className="space-y-3">
              {currentConfig.backgroundSounds.map((sound) => (
                <div key={sound.id} className="p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{sound.name}</span>
                    <button
                      onClick={() => updateBackgroundSound(sound.id, { enabled: !sound.enabled })}
                      className={`p-1 rounded transition-colors ${
                        sound.enabled ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      {sound.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Volume: {Math.round(sound.volume * 100)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={sound.volume}
                      onChange={(e) => updateBackgroundSound(sound.id, { volume: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Controls */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Session Control</h3>
            
            <div className="space-y-4">
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
                  {isPlaying ? 'Stop' : 'Start'}
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

              <div className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Session Time</span>
                  <span className="font-mono text-lg">{formatTime(sessionTime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Target Duration</span>
                  <span className="font-mono text-sm">{formatTime(currentConfig.duration)}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div 
                    className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((sessionTime / currentConfig.duration) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Frequency Ramping */}
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Frequency Ramping</span>
                  <button
                    onClick={() => setCurrentConfig(prev => ({ ...prev, rampingEnabled: !prev.rampingEnabled }))}
                    className={`p-1 rounded transition-colors ${
                      currentConfig.rampingEnabled ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                </div>
                
                {currentConfig.rampingEnabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">Start: {currentConfig.startFreq}Hz</label>
                      <input
                        type="range"
                        min="0.5"
                        max="40"
                        step="0.5"
                        value={currentConfig.startFreq}
                        onChange={(e) => setCurrentConfig(prev => ({ ...prev, startFreq: Number(e.target.value) }))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">End: {currentConfig.endFreq}Hz</label>
                      <input
                        type="range"
                        min="0.5"
                        max="40"
                        step="0.5"
                        value={currentConfig.endFreq}
                        onChange={(e) => setCurrentConfig(prev => ({ ...prev, endFreq: Number(e.target.value) }))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Duration: {Math.floor(currentConfig.rampDuration / 60)}min</label>
                      <input
                        type="range"
                        min="60"
                        max="1800"
                        step="60"
                        value={currentConfig.rampDuration}
                        onChange={(e) => setCurrentConfig(prev => ({ ...prev, rampDuration: Number(e.target.value) }))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Real-time Monitoring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="xl:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Real-time Monitor
          </h3>
          
          {/* Frequency Spectrum */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Frequency Spectrum</h4>
            <div className="h-32 bg-gray-900/50 rounded-lg p-2 flex items-end justify-center gap-1">
              {frequencyData ? (
                Array.from(frequencyData.slice(0, 32)).map((value, index) => (
                  <div
                    key={index}
                    className="bg-cyan-400 rounded-t"
                    style={{
                      height: `${(value / 255) * 100}%`,
                      width: '6px',
                      minHeight: '2px'
                    }}
                  />
                ))
              ) : (
                <div className="text-gray-500 text-sm">No audio data</div>
              )}
            </div>
          </div>

          {/* Active Frequencies */}
          <div className="space-y-3">
            <h4 className="font-semibold">Active Frequencies</h4>
            {currentConfig.audioConfigs.filter(c => c.enabled).map((config) => (
              <div key={config.id} className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium capitalize">{config.type}</span>
                  <span className={`text-sm ${getBrainwaveState(config.frequency).color}`}>
                    {getBrainwaveState(config.frequency).name}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Beat: {config.frequency}Hz | Carrier: {config.carrierFreq}Hz
                </div>
                <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
                  <div 
                    className="bg-cyan-400 h-1 rounded-full"
                    style={{ width: `${config.volume * 100}%` }}
                  />
                </div>
              </div>
            ))}
            
            {currentConfig.audioConfigs.filter(c => c.enabled).length === 0 && (
              <div className="text-gray-500 text-sm text-center py-4">
                No active frequencies
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* User Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Frequency Laboratory User Guide</h2>
                <button
                  onClick={() => setShowGuide(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-bold mb-3">Getting Started</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Choose your entrainment method: Binaural, Isochronic, or Monaural beats</li>
                    <li>Set your target frequency (0.5-40 Hz) based on desired brainwave state</li>
                    <li>Adjust carrier frequency (100-1000 Hz) for comfort</li>
                    <li>Add background sounds if desired</li>
                    <li>Click Start to begin your session</li>
                  </ol>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">Entrainment Methods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold mb-2">Binaural Beats</h4>
                      <p className="text-sm text-gray-300">Different frequencies in each ear create a "beat" in your brain. Requires stereo headphones.</p>
                    </div>
                    <div className="p-4 bg-green-900/20 rounded-lg">
                      <h4 className="font-semibold mb-2">Isochronic Tones</h4>
                      <p className="text-sm text-gray-300">Rhythmic pulses at target frequency. Works with speakers or headphones.</p>
                    </div>
                    <div className="p-4 bg-purple-900/20 rounded-lg">
                      <h4 className="font-semibold mb-2">Monaural Beats</h4>
                      <p className="text-sm text-gray-300">Two tones mixed before reaching your ears. More direct stimulation.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">Frequency Ranges</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-purple-900/20 rounded">
                      <span>Delta (0.5-4 Hz)</span>
                      <span>Deep sleep, healing</span>
                    </div>
                    <div className="flex justify-between p-2 bg-blue-900/20 rounded">
                      <span>Theta (4-8 Hz)</span>
                      <span>Meditation, creativity</span>
                    </div>
                    <div className="flex justify-between p-2 bg-green-900/20 rounded">
                      <span>Alpha (8-12 Hz)</span>
                      <span>Relaxed awareness</span>
                    </div>
                    <div className="flex justify-between p-2 bg-yellow-900/20 rounded">
                      <span>Beta (12-30 Hz)</span>
                      <span>Active thinking, focus</span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-900/20 rounded">
                      <span>Gamma (30+ Hz)</span>
                      <span>Peak performance</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">Safety Guidelines</h3>
                  <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Do not use while driving or operating machinery</li>
                      <li>Avoid if you have epilepsy or seizure disorders</li>
                      <li>Start with short sessions (15-30 minutes)</li>
                      <li>Use comfortable volume levels</li>
                      <li>Stop if you experience discomfort</li>
                      <li>Limit gamma frequencies to 20 minutes</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">Best Practices</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Use quality headphones for binaural beats</li>
                    <li>Find a quiet, comfortable environment</li>
                    <li>Stay hydrated during sessions</li>
                    <li>Combine multiple methods gradually</li>
                    <li>Keep a session journal to track effects</li>
                    <li>Save configurations you find effective</li>
                  </ul>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Session Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Session Name</label>
                  <input
                    type="text"
                    value={currentConfig.name}
                    onChange={(e) => setCurrentConfig(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Target Duration: {Math.floor(currentConfig.duration / 60)} minutes
                  </label>
                  <input
                    type="range"
                    min="300"
                    max="7200"
                    step="300"
                    value={currentConfig.duration}
                    onChange={(e) => setCurrentConfig(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5 min</span>
                    <span>120 min</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FrequencyLab;