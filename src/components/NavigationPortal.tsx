import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Home, Brain, Users, Zap, Globe, Heart, ExternalLink } from 'lucide-react';

interface NavigationPortalProps {
  activeLab: string;
  onLabSelect: (lab: any) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function NavigationPortal({
  activeLab,
  onLabSelect,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: NavigationPortalProps) {
  const labs = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'rate', name: 'Rate Lab', icon: Brain },
    { id: 'place', name: 'Place Lab', icon: Globe },
    { id: 'population', name: 'Game Lab', icon: Users },
    { id: 'frequency', name: 'Frequency Lab', icon: Zap },
    { id: 'connect', name: 'Connect', icon: ExternalLink },
    { id: 'sponsor', name: 'Sponsor', icon: Heart },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo and Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0"
          >
            <img
              src="https://res.cloudinary.com/doourcehz/image/upload/w_128,h_128,c_fill,f_webp,q_auto/v1762704996/download_1_t0xokx.jpg"
              alt="CosmicSpirit0 logo"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="hidden sm:block min-w-0">
              <span className="block text-lg xl:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
                CosmicSpirit0
              </span>
              <span className="block text-[11px] text-gray-400 whitespace-nowrap">Neural Code Platform</span>
            </div>
          </motion.div>

          {/* Desktop Navigation — only above 1024px so the header never crowds */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main navigation">
            {labs.map((lab) => {
              const Icon = lab.icon;
              return (
                <motion.button
                  key={lab.id}
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onLabSelect(lab.id)}
                  aria-current={activeLab === lab.id ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3 xl:px-4 min-h-[44px] rounded-lg text-sm xl:text-base whitespace-nowrap transition-all ${
                    activeLab === lab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{lab.name}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Menu button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 flex-shrink-0"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile / tablet menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden border-t border-gray-700 max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <nav className="px-3 py-2 space-y-1" aria-label="Mobile navigation">
              {labs.map((lab) => {
                const Icon = lab.icon;
                return (
                  <button
                    key={lab.id}
                    type="button"
                    onClick={() => {
                      onLabSelect(lab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    aria-current={activeLab === lab.id ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-4 min-h-[48px] rounded-lg text-left transition-all ${
                      activeLab === lab.id
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{lab.name}</span>
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
}
