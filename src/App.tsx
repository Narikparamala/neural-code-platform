import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Waves, Globe, Users, Archive, Settings, Shield, Menu, X, Zap, BarChart3, User, LogOut } from 'lucide-react';
import RateLab from './components/RateLab';
import PlaceLab from './components/PlaceLab';
import PopulationLab from './components/PopulationLab';
import NeuralArchive from './components/NeuralArchive';
import NavigationPortal from './components/NavigationPortal';
import SafetyDashboard from './components/SafetyDashboard';
import MonroeResearchHub from './components/MonroeResearchHub';
import FrequencyLab from './components/FrequencyLab';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import SocialPlatform from './components/SocialPlatform';
import AuthSystem from './components/AuthSystem';

type ActiveLab = 'home' | 'rate' | 'place' | 'population' | 'monroe' | 'frequency' | 'social';

interface User {
  id: string;
  username: string;
  email: string;
  userID: string;
  avatar: string;
  bio: string;
  deviceID: string;
  isVerified: boolean;
  joinDate: string;
  followers: string[];
  following: string[];
  posts: any[];
  presets: any[];
}

function App() {
  const [activeLab, setActiveLab] = useState<ActiveLab>('home');
  const [showArchive, setShowArchive] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing authentication
    const savedUser = localStorage.getItem('neural-user');
    const savedAuth = localStorage.getItem('neural-auth');
    
    if (savedUser && savedAuth) {
      try {
        const user = JSON.parse(savedUser);
        const authData = JSON.parse(savedAuth);
        
        // Verify device ID matches
        const currentDeviceID = generateDeviceID();
        if (authData.deviceID === currentDeviceID && authData.expiresAt > Date.now()) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        } else {
          // Clear invalid auth
          localStorage.removeItem('neural-user');
          localStorage.removeItem('neural-auth');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('neural-user');
        localStorage.removeItem('neural-auth');
      }
    }

    // Initialize audio context on user interaction
    const initAudioContext = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    };

    document.addEventListener('click', initAudioContext, { once: true });
    return () => document.removeEventListener('click', initAudioContext);
  }, []);

  const generateDeviceID = (): string => {
    // Generate unique device fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.deviceMemory || 'unknown'
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  };

  const handleLogin = (user: User) => {
    const deviceID = generateDeviceID();
    const authData = {
      deviceID,
      loginTime: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };
    
    localStorage.setItem('neural-user', JSON.stringify(user));
    localStorage.setItem('neural-auth', JSON.stringify(authData));
    
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('neural-user');
    localStorage.removeItem('neural-auth');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveLab('home');
  };

  const renderActiveLab = () => {
    if (!isAuthenticated) {
      return <AuthSystem onLogin={handleLogin} />;
    }

    switch (activeLab) {
      case 'rate':
        return <RateLab onSessionUpdate={setSessionData} />;
      case 'place':
        return <PlaceLab onSessionUpdate={setSessionData} />;
      case 'population':
        return <PopulationLab onSessionUpdate={setSessionData} />;
      case 'monroe':
        return <MonroeResearchHub />;
      case 'frequency':
        return <FrequencyLab onSessionUpdate={setSessionData} />;
      case 'social':
        return <SocialPlatform currentUser={currentUser} onSessionUpdate={setSessionData} />;
      default:
        return <HomePortal onLabSelect={setActiveLab} currentUser={currentUser} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        <div className="fixed inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 animate-pulse"></div>
        </div>
        <AuthSystem onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 animate-pulse"></div>
      </div>

      {/* Enhanced Navigation Portal */}
      <NavigationPortal 
        activeLab={activeLab} 
        onLabSelect={setActiveLab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Neural Archive Panel */}
      <NeuralArchive 
        isOpen={showArchive} 
        onToggle={() => setShowArchive(!showArchive)}
        sessionData={sessionData}
      />

      {/* Safety Dashboard */}
      <SafetyDashboard 
        isOpen={showSafety} 
        onToggle={() => setShowSafety(!showSafety)}
      />

      {/* Main Content */}
      <main className="relative z-10 pt-20 p-4 lg:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {renderActiveLab()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Enhanced Control Buttons - Only show for non-social pages */}
      {activeLab !== 'social' && (
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-40">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowArchive(!showArchive)}
            className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg transition-colors"
            title="Neural Archive"
          >
            <Archive className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSafety(!showSafety)}
            className="p-3 bg-red-600 hover:bg-red-700 rounded-full shadow-lg transition-colors"
            title="Safety Dashboard"
          >
            <Shield className="w-6 h-6" />
          </motion.button>
        </div>
      )}
    </div>
  );
}

function HomePortal({ onLabSelect, currentUser }: { onLabSelect: (lab: ActiveLab) => void, currentUser: User | null }) {
  const labs = [
    {
      id: 'rate' as ActiveLab,
      title: 'Rate Lab',
      description: 'Neural firing frequency simulator with binaural beats and isochronic tones',
      icon: Waves,
      color: 'from-blue-500 to-cyan-500',
      features: ['Binaural Beats', 'Isochronic Tones', 'Live Oscilloscope', 'Mono Neural Tones']
    },
    {
      id: 'place' as ActiveLab,
      title: 'Place Lab',
      description: '3D spatial audio with HRTF brain model and cochlear simulation',
      icon: Globe,
      color: 'from-green-500 to-emerald-500',
      features: ['3D Audio', 'HRTF Processing', 'Spatial Mapping', 'Brain Visualization']
    },
    {
      id: 'population' as ActiveLab,
      title: 'Population Lab',
      description: 'Attention games with neural cluster dynamics and population coding',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      features: ['Attention Training', 'Neural Clusters', 'Population Coding', 'Cognitive Games']
    },
    {
      id: 'monroe' as ActiveLab,
      title: 'Monroe Research Hub',
      description: 'Hemi-Sync® protocols and consciousness research with AI analysis',
      icon: Brain,
      color: 'from-orange-500 to-red-500',
      features: ['Hemi-Sync®', 'Research Data', 'AI Analysis', 'Consciousness Mapping']
    },
    {
      id: 'frequency' as ActiveLab,
      title: 'Advanced Frequency Laboratory',
      description: 'Advanced multi-method brainwave entrainment with real-time monitoring',
      icon: Zap,
      color: 'from-cyan-500 to-blue-500',
      features: ['Multi-Method', 'Real-time Monitor', 'Custom Configs', 'Background Sounds']
    },
    {
      id: 'social' as ActiveLab,
      title: 'Collaboration Sync - Consciousness Network',
      description: 'Connect, share knowledge, and collaborate with consciousness explorers worldwide',
      icon: Users,
      color: 'from-pink-500 to-rose-500',
      features: ['Social Profiles', 'Real-time Chat', 'Knowledge Sharing', 'Random Connect']
    }
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-4 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 lg:mb-12"
      >
        <h1 className="text-4xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Neural Code Platform
        </h1>
        <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4">
          Welcome back, <span className="text-purple-400 font-semibold">@{currentUser?.userID}</span>! 
          Explore consciousness through audio-visual neural interfaces and connect with fellow researchers.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Production Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Social Network</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span>AI-Powered Analytics</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 max-w-7xl w-full px-4">
        {labs.map((lab, index) => (
          <motion.div
            key={lab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() => onLabSelect(lab.id)}
            className={`p-6 lg:p-8 rounded-xl bg-gradient-to-br ${lab.color} opacity-90 hover:opacity-100 transition-all cursor-pointer shadow-2xl hover:shadow-3xl`}
          >
            <div className="flex items-center mb-4">
              <lab.icon className="w-8 h-8 mr-3" />
              <h3 className="text-xl lg:text-2xl font-bold">{lab.title}</h3>
            </div>
            <p className="text-white/90 mb-4 text-sm lg:text-base">{lab.description}</p>
            <div className="grid grid-cols-2 gap-2">
              {lab.features.map((feature, i) => (
                <div key={i} className="text-xs lg:text-sm bg-white/20 rounded-lg px-2 py-1 text-center backdrop-blur-sm">
                  {feature}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-8 lg:mt-12 text-center px-4"
      >
        <p className="text-gray-400 text-sm lg:text-base mb-4">
          "We're not just building an app - we're creating the social network for consciousness exploration."
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
          <span>• Real-time Brainwave Entrainment</span>
          <span>• 3D Spatial Audio Processing</span>
          <span>• AI-Powered Session Analysis</span>
          <span>• Global Social Network</span>
          <span>• Advanced Safety Protocols</span>
        </div>
      </motion.div>
    </div>
  );
}

export default App;