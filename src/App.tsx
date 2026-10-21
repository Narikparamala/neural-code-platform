import React, { Suspense, lazy, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Waves, Globe, Users, Archive, Settings, Shield, Menu, X, Zap, Heart, ExternalLink } from 'lucide-react';
import RateLab from './components/RateLab';
const PlaceLab = lazy(() => import('./components/PlaceLab'));
import PopulationLab from './components/PopulationLab';
import FrequencyLab from './components/FrequencyLab';
import NeuralArchive from './components/NeuralArchive';
import NavigationPortal from './components/NavigationPortal';
import SafetyDashboard from './components/SafetyDashboard';
import ConnectPage from './components/ConnectPage';
import SponsorshipPage from './components/SponsorshipPage';
import FeedbackPage from './components/FeedbackPage';
import TransparencyPage from './components/TransparencyPage';
import DailySignal from './components/DailySignal';
import AboutPage from './components/AboutPage';
import ResearchPage from './components/ResearchPage';
import SponsorDeck from './components/SponsorDeck';
import CommunityPage from './components/CommunityPage';
import AuthModal from './components/AuthModal';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import EmailCapture from './components/EmailCapture';
import NewsletterNotice from './components/NewsletterNotice';
import NotFound from './components/NotFound';
import { stashPresetForLab, type Preset } from './lib/social';

type ActiveLab =
  | 'home'
  | 'rate'
  | 'place'
  | 'population'
  | 'frequency'
  | 'community'
  | 'feedback'
  | 'transparency'
  | 'about'
  | 'research'
  | 'deck'
  | 'connect'
  | 'sponsor';

function App() {
  const [activeLab, setActiveLab] = useState<ActiveLab>(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('circle')) {
      return 'community';
    }
    return 'home';
  });
  const [showArchive, setShowArchive] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const base = import.meta.env.BASE_URL || '/';
  const rawPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const cleanPath = (rawPath.startsWith(base) ? rawPath.slice(base.length) : rawPath.replace(/^\//, '')).replace(/\/+$/, '');
  const isUnknownPath = cleanPath !== '' && cleanPath !== 'index.html';

  useEffect(() => {
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeLab]);

  const handleUsePreset = (preset: Preset) => {
    stashPresetForLab(preset.lab, preset);
    const map: Record<string, ActiveLab> = {
      rate: 'rate',
      place: 'place',
      frequency: 'frequency',
      game: 'population',
      daily: 'home',
    };
    setActiveLab(map[preset.lab] || 'community');
  };

  const renderActiveLab = () => {
    if (isUnknownPath) {
      return (
        <NotFound
          onHome={() => {
            window.history.replaceState({}, '', base);
            window.location.reload();
          }}
        />
      );
    }
    switch (activeLab) {
      case 'rate':
        return <RateLab onSessionUpdate={setSessionData} />;
      case 'place':
        return <PlaceLab onSessionUpdate={setSessionData} />;
      case 'population':
        return <PopulationLab onSessionUpdate={setSessionData} />;
      case 'frequency':
        return <FrequencyLab onSessionUpdate={setSessionData} />;
      case 'community':
        return <CommunityPage onUsePreset={handleUsePreset} />;
      case 'feedback':
        return <FeedbackPage />;
      case 'transparency':
        return <TransparencyPage onNavigate={(lab) => setActiveLab(lab as ActiveLab)} />;
      case 'about':
        return <AboutPage onNavigate={(lab) => setActiveLab(lab as ActiveLab)} />;
      case 'research':
        return <ResearchPage onNavigate={(lab) => setActiveLab(lab as ActiveLab)} />;
      case 'deck':
        return <SponsorDeck onBack={() => setActiveLab('sponsor')} />;
      case 'connect':
        return <ConnectPage />;
      case 'sponsor':
        return <SponsorshipPage onNavigate={(lab) => setActiveLab(lab as ActiveLab)} />;
      default:
        return <HomePortal onLabSelect={setActiveLab} onNavigate={setActiveLab} />;
    }
  };

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
      <main className="relative z-10 pt-24 px-4 pb-8 lg:px-6 lg:pt-28 lg:pb-10">
        <NewsletterNotice />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Suspense fallback={<div className="py-24 text-center text-gray-400">Loading lab&hellip;</div>}>
              <ErrorBoundary key={activeLab} onHome={() => setActiveLab('home')}>
                {renderActiveLab()}
              </ErrorBoundary>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {['home', 'connect', 'sponsor'].includes(activeLab) && !isUnknownPath && <EmailCapture />}

      <Footer onNavigate={(lab) => setActiveLab(lab as ActiveLab)} />
      <AuthModal />

      {/* Enhanced Control Buttons - Only show for non-social pages */}
      {!['connect', 'sponsor'].includes(activeLab) && (
        <div className="no-print fixed bottom-4 right-4 flex flex-col gap-2 z-40">
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

function HomePortal({
  onLabSelect,
  onNavigate,
}: {
  onLabSelect: (lab: ActiveLab) => void;
  onNavigate: (lab: ActiveLab) => void;
}) {
  const labs = [
    {
      id: 'rate' as ActiveLab,
      title: 'Rate Lab',
      description: 'Binaural beats, isochronic and monaural tones with a live oscilloscope',
      icon: Waves,
      color: 'from-blue-500 to-cyan-500',
      features: ['Binaural Beats', 'Isochronic Tones', 'Live Oscilloscope', 'Monaural Tones']
    },
    {
      id: 'place' as ActiveLab,
      title: 'Place Lab',
      description: 'Pan generated sounds around a 3D space with HRTF processing and a movable source map',
      icon: Globe,
      color: 'from-green-500 to-emerald-500',
      features: ['3D Audio', 'HRTF Panning', 'Source Map', 'Headphone Demo']
    },
    {
      id: 'population' as ActiveLab,
      title: 'Game Lab',
      description: 'A 60-second attention game: hit the active target, build a streak, beat your best',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      features: ['60-second Round', 'Streak Tracking', 'Best Score', 'Keyboard + Touch']
    },
    {
      id: 'frequency' as ActiveLab,
      title: 'Frequency Lab',
      description: 'Layer multiple tone methods, save presets and set a session timer',
      icon: Zap,
      color: 'from-cyan-500 to-blue-500',
      features: ['Multiple Methods', 'Session Timer', 'Custom Presets', 'Background Noise']
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
          CosmicSpirit0 &mdash; Neural Code Platform
        </h1>
        <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4">
          Explore sound, attention and consciousness in your browser. Guided audio experiments,
          reaction-time games, and plain-language explanations of the ideas behind binaural beats and
          Hemi-Sync. Free, open, and not medical treatment.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#daily-signal"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('daily-signal')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="inline-flex items-center gap-2 px-6 min-h-[48px] rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold"
          >
            Start a 3-minute experiment
          </a>
          <button
            type="button"
            onClick={() => onNavigate('research')}
            className="inline-flex items-center gap-2 px-6 min-h-[48px] rounded-lg border border-gray-600 hover:border-gray-500 font-semibold"
          >
            Read the evidence
          </button>
          <button
            type="button"
            onClick={() => onNavigate('about')}
            className="inline-flex items-center gap-2 px-4 min-h-[48px] text-sm text-gray-300 hover:text-white font-semibold"
          >
            About the project
          </button>
          <button
            type="button"
            onClick={() => onNavigate('community')}
            className="inline-flex items-center gap-2 px-6 min-h-[48px] rounded-lg border border-purple-400/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 font-semibold"
          >
            <Users className="w-4 h-4" /> Community
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true"></div>
            <span>Free &amp; accounts optional</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full" aria-hidden="true"></div>
            <span>Audio generated in your browser</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full" aria-hidden="true"></div>
            <span>Moderated community</span>
          </div>
        </div>
      </motion.div>

      <div id="labs" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 max-w-7xl w-full px-4">
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

      <DailySignal />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-8 lg:mt-12 text-center px-4"
      >
        <p className="text-gray-400 text-sm lg:text-base mb-4">
          "Personal exploration, honestly labelled: what each signal is, what the evidence does and
          does not show, and how it felt to you."
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
          <span>• Real-time audio synthesis</span>
          <span>• 3D spatial audio processing</span>
          <span>• Plain-language research notes</span>
          <span>• Safety notes and a moderation policy</span>
        </div>
      </motion.div>
    </div>
  );
}

export default App;