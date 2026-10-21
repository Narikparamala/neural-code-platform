import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  Brain,
  Users,
  Zap,
  Globe,
  Heart,
  ExternalLink,
  MessageSquareHeart,
  MessageCircle,
  ChevronDown,
  Info,
  BookOpen,
  FileText,
  LogIn,
  Archive,
  Shield,
} from 'lucide-react';
import { useSiteSettings } from '../lib/siteSettings';
import { useAuth, initials } from '../lib/auth';

interface NavigationPortalProps {
  activeLab: string;
  onLabSelect: (lab: any) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onOpenArchive?: () => void;
  onOpenSafety?: () => void;
}

export default function NavigationPortal({
  activeLab,
  onLabSelect,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onOpenArchive,
  onOpenSafety,
}: NavigationPortalProps) {
  const settings = useSiteSettings();
  const { user, profile, openAuth } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const labs = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'rate', name: 'Rate Lab', icon: Brain },
    { id: 'place', name: 'Place Lab', icon: Globe },
    { id: 'population', name: 'Game Lab', icon: Users },
    { id: 'frequency', name: 'Frequency Lab', icon: Zap },
    { id: 'community', name: 'Community', icon: MessageCircle },
    { id: 'connect', name: 'Connect', icon: ExternalLink },
  ];

  const moreLinks = [
    { id: 'about', name: 'About', icon: Info },
    { id: 'research', name: 'Research & evidence', icon: BookOpen },
    { id: 'feedback', name: 'Feedback & reviews', icon: MessageSquareHeart },
    { id: 'transparency', name: 'Transparency', icon: FileText },
    { id: 'sponsor', name: 'Sponsor', icon: Heart },
  ];

  const moreActive = moreLinks.some((l) => l.id === activeLab);

  useEffect(() => {
    if (!moreOpen) return;
    const close = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [moreOpen]);

  const pick = (id: string) => {
    onLabSelect(id);
    setMoreOpen(false);
    setIsMobileMenuOpen(false);
  };

  const openProfile = () => {
    try {
      sessionStorage.setItem('cs0:community-tab', 'profile');
    } catch {
      /* storage can be blocked */
    }
    onLabSelect('community');
    setMoreOpen(false);
    setIsMobileMenuOpen(false);
    window.setTimeout(
      () => window.dispatchEvent(new CustomEvent('cs0:community-tab', { detail: 'profile' })),
      60
    );
  };

  return (
    <header className="no-print fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo and Brand */}
          <motion.button
            type="button"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => pick('home')}
            className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0 text-left"
            aria-label="CosmicSpirit0 home"
          >
            <img
              src={settings.logo_url}
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
          </motion.button>

          {/* Desktop Navigation — only above 1024px so the header never crowds */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5" aria-label="Main navigation">
            {labs.map((lab) => {
              const Icon = lab.icon;
              return (
                <motion.button
                  key={lab.id}
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => pick(lab.id)}
                  aria-current={activeLab === lab.id ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-2.5 xl:px-3.5 min-h-[44px] rounded-lg text-sm whitespace-nowrap transition-all ${
                    activeLab === lab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="hidden xl:block w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span>{lab.name}</span>
                </motion.button>
              );
            })}

            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                className={`flex items-center gap-1 px-2.5 xl:px-3.5 min-h-[44px] rounded-lg text-sm whitespace-nowrap transition-all ${
                  moreActive || moreOpen
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                More
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="menu"
                  className="absolute right-0 mt-2 w-60 rounded-xl border border-gray-700 bg-gray-900 shadow-2xl p-2"
                >
                  {moreLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.id}
                        type="button"
                        role="menuitem"
                        onClick={() => pick(link.id)}
                        aria-current={activeLab === link.id ? 'page' : undefined}
                        className={`w-full flex items-center gap-3 px-3 min-h-[44px] rounded-lg text-sm text-left ${
                          activeLab === link.id
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        {link.name}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </nav>

          {/* Account */}
          {user && profile ? (
            <button
              type="button"
              onClick={openProfile}
              className="hidden lg:inline-flex items-center gap-2 min-h-[44px] pl-1 pr-2 rounded-full border border-gray-700 hover:border-purple-500/60 bg-gray-800/60 flex-shrink-0"
              aria-label="Your listener profile"
              title={`@${profile.handle}`}
            >
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-[11px] font-black text-gray-950">
                {initials(profile.display_name)}
              </span>
              <span className="hidden xl:block text-sm font-semibold max-w-[90px] truncate">
                {profile.display_name}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuth('signin')}
              className="hidden lg:inline-flex items-center gap-2 min-h-[44px] px-3 rounded-lg border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-sm font-semibold flex-shrink-0"
            >
              <LogIn className="w-4 h-4" /> Sign in
            </button>
          )}

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
              {[...labs, ...moreLinks].map((lab) => {
                const Icon = lab.icon;
                return (
                  <button
                    key={lab.id}
                    type="button"
                    onClick={() => pick(lab.id)}
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
              <button
                type="button"
                onClick={() => (user ? openProfile() : openAuth('signin'))}
                className="w-full flex items-center gap-3 px-4 min-h-[48px] rounded-lg text-left text-gray-300 hover:text-white hover:bg-gray-700 border-t border-gray-800 mt-1 pt-1"
              >
                {user && profile ? (
                  <>
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-[10px] font-black text-gray-950 flex-shrink-0">
                      {initials(profile.display_name)}
                    </span>
                    <span className="truncate">My profile · @{profile.handle}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 flex-shrink-0" />
                    <span>Sign in / create account</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2 border-t border-gray-800 mt-1 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenArchive?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 min-h-[44px] rounded-lg bg-gray-800 text-sm text-gray-300 hover:text-white"
                >
                  <Archive className="w-4 h-4" /> Archive
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenSafety?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 min-h-[44px] rounded-lg bg-gray-800 text-sm text-gray-300 hover:text-white"
                >
                  <Shield className="w-4 h-4" /> Safety
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
}
