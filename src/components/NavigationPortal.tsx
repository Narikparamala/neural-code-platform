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
    <div className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 z-40">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <img 
              src="https://res.cloudinary.com/doourcehz/image/upload/v1762704996/download_1_t0xokx.jpg" 
              alt="CosmicSpirit0 Logo" 
              className="w-10 h-10 rounded-full"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                CosmicSpirit0
              </h1>
              <p className="text-xs text-gray-400">Neural Code Platform</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {labs.map((lab) => {
              const Icon = lab.icon;
              return (
                <motion.button
                  key={lab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onLabSelect(lab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeLab === lab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{lab.name}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-gray-700"
          >
            <div className="px-4 py-2 space-y-2">
              {labs.map((lab) => {
                const Icon = lab.icon;
                return (
                  <button
                    key={lab.id}
                    onClick={() => {
                      onLabSelect(lab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeLab === lab.id
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{lab.name}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}