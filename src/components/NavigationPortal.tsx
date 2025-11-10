import React from 'react';
import { Menu, X, Home, Brain, Users, Zap, Globe, BarChart3 } from 'lucide-react';

interface NavigationPortalProps {
  activeLab: string;
  onLabSelect: (lab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  currentUser: any;
  onLogout: () => void;
}

export default function NavigationPortal({
  activeLab,
  onLabSelect,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  currentUser,
  onLogout
}: NavigationPortalProps) {
  const labs = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'rate', name: 'Rate Lab', icon: Brain },
    { id: 'place', name: 'Place Lab', icon: Globe },
    { id: 'population', name: 'Population Lab', icon: Users },
    { id: 'frequency', name: 'Frequency Lab', icon: Zap },
    { id: 'monroe', name: 'Monroe Hub', icon: BarChart3 },
    { id: 'social', name: 'Social Platform', icon: Users },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        {labs.map((lab) => {
          const Icon = lab.icon;
          return (
            <button
              key={lab.id}
              onClick={() => onLabSelect(lab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeLab === lab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{lab.name}</span>
            </button>
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
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
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{lab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}