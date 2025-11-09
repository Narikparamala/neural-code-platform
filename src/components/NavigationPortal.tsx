import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Waves, Globe, Users, Brain, Menu, X, Zap, LogOut, User } from 'lucide-react';

type ActiveLab = 'home' | 'rate' | 'place' | 'population' | 'monroe' | 'frequency' | 'social';

interface NavigationPortalProps {
  activeLab: ActiveLab;
  onLabSelect: (lab: ActiveLab) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  currentUser: any;
  onLogout: () => void;
}

const NavigationPortal: React.FC<NavigationPortalProps> = ({ 
  activeLab, 
  onLabSelect, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  currentUser,
  onLogout
}) => {
  const navItems = [
    { id: 'home' as ActiveLab, icon: Home, label: 'Home', color: 'from-purple-500 to-pink-500' },
    { id: 'rate' as ActiveLab, icon: Waves, label: 'Rate Lab', color: 'from-blue-500 to-cyan-500' },
    { id: 'place' as ActiveLab, icon: Globe, label: 'Place Lab', color: 'from-green-500 to-emerald-500' },
    { id: 'population' as ActiveLab, icon: Users, label: 'Population Lab', color: 'from-purple-500 to-pink-500' },
    { id: 'monroe' as ActiveLab, icon: Brain, label: 'Monroe Hub', color: 'from-orange-500 to-red-500' },
    { id: 'frequency' as ActiveLab, icon: Zap, label: 'Frequency Lab', color: 'from-cyan-500 to-blue-500' },
    { id: 'social' as ActiveLab, icon: Users, label: 'Social Network', color: 'from-pink-500 to-rose-500' }
  ];

  const handleNavClick = (lab: ActiveLab) => {
    onLabSelect(lab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Fixed Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-gray-900/98 backdrop-blur-lg border-b border-gray-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-600/50 lg:hidden hover:bg-gray-700/80 transition-all duration-300 shadow-md"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden lg:flex items-center gap-2"
            >
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-3 rounded-lg transition-all duration-300 group shadow-md ${
                    activeLab === item.id 
                      ? `bg-gradient-to-r ${item.color} shadow-lg` 
                      : 'bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/30'
                  }`}
                  title={item.label}
                >
                  <item.icon className={`w-5 h-5 transition-all duration-300 ${
                    activeLab === item.id ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`} />
                  
                  {/* Active indicator */}
                  {activeLab === item.id && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3">
              {currentUser && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-md">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm">
                    {currentUser.avatar || currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-200">@{currentUser.userID}</span>
                </div>
              )}
              
              <button
                onClick={onLogout}
                className="p-2 bg-red-600/80 hover:bg-red-700/80 rounded-lg transition-colors shadow-md"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile User Info */}
            {currentUser && (
              <div className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-md">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm">
                  {currentUser.avatar || currentUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-gray-200">@{currentUser.user_id}</span>
              </div>
            )}
              <div className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-md">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm">
                  {currentUser.avatar || currentUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-gray-200">@{currentUser.user_id}</span>
              </div>
            )}
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, x: -300, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -300, scale: 0.9 }}
              transition={{ duration: 0.4, type: "spring", damping: 25 }}
              className="fixed top-16 left-0 w-80 h-[calc(100vh-4rem)] bg-gray-900/98 backdrop-blur-lg border-r border-gray-600/50 z-[95] lg:hidden shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Neural Labs
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">Consciousness Exploration Platform</p>
                  {currentUser && (
                    <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                          {currentUser.avatar || currentUser.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">{currentUser.username}</div>
                          <div className="text-xs text-gray-400">@{currentUser.user_id}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group shadow-md ${
                        activeLab === item.id 
                          ? `bg-gradient-to-r ${item.color} shadow-lg` 
                          : 'bg-gray-800/50 hover:bg-gray-700/70 border border-gray-600/30'
                      }`}
                    >
                      <div className={`p-2 rounded-md ${
                        activeLab === item.id 
                          ? 'bg-white/20' 
                          : 'bg-gray-700/50 group-hover:bg-gray-600/50'
                      }`}>
                        <item.icon className={`w-5 h-5 ${
                          activeLab === item.id ? 'text-white' : 'text-gray-300 group-hover:text-white'
                        }`} />
                      </div>
                      <div className="text-left flex-1">
                        <span className={`font-medium text-sm ${
                          activeLab === item.id ? 'text-white' : 'text-gray-200'
                        }`}>
                          {item.label}
                        </span>
                        {activeLab === item.id && (
                          <div className="text-xs text-white/80 mt-0.5">Currently Active</div>
                        )}
                      </div>
                      
                      {/* Active indicator for mobile */}
                      {activeLab === item.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </motion.button>
                  ))}
                </div>
                
                {/* Footer info */}
                <div className="mt-6 p-3 bg-gray-800/30 rounded-lg border border-gray-600/30">
                  <p className="text-xs text-gray-400 text-center">
                    Neural Code Platform v2.0
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-0.5">
                    Social Consciousness Network
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavigationPortal;