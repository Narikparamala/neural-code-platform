import React, { useEffect, useState } from 'react';
import { Headphones, Users, UserRound, Flame, LogIn } from 'lucide-react';
import { useAuth, initials } from '../lib/auth';
import type { Preset } from '../lib/social';
import PresetsPanel from './PresetsPanel';
import CirclesPanel from './CirclesPanel';
import ProfilePanel from './ProfilePanel';

type Tab = 'presets' | 'circles' | 'profile';

export default function CommunityPage({ onUsePreset }: { onUsePreset: (preset: Preset) => void }) {
  const { user, profile, openAuth } = useAuth();
  const [tab, setTab] = useState<Tab>('presets');

  useEffect(() => {
    const apply = (next: string) => {
      if (next === 'presets' || next === 'circles' || next === 'profile') setTab(next);
    };
    try {
      const pending = sessionStorage.getItem('cs0:community-tab');
      if (pending) {
        sessionStorage.removeItem('cs0:community-tab');
        apply(pending);
      }
    } catch {
      /* storage can be blocked */
    }
    const onTab = (event: Event) => apply(String((event as CustomEvent).detail || ''));
    window.addEventListener('cs0:community-tab', onTab);
    return () => window.removeEventListener('cs0:community-tab', onTab);
  }, []);

  const tabs: {
    id: Tab;
    label: string;
    mobileLabel?: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'presets', label: 'Shared presets', mobileLabel: 'Presets', icon: Headphones },
    { id: 'circles', label: 'Circles', icon: Users },
    { id: 'profile', label: 'Profile', icon: UserRound },
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-purple-300 mb-2">People, not machines</p>
            <h1 className="text-3xl sm:text-4xl font-black">Community</h1>
            <p className="text-gray-400 mt-2 max-w-2xl text-sm sm:text-base">
              Share the exact sound setup you built, review other listeners’ presets, keep a streak,
              and run small circles around a practice. Everything here is made by signed-in people.
            </p>
          </div>

          {user && profile ? (
            <button
              type="button"
              onClick={() => setTab('profile')}
              className="inline-flex items-center gap-3 rounded-full border border-gray-700 bg-gray-800/60 pl-2 pr-4 py-1.5 hover:border-purple-500/50"
            >
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-black text-gray-950">
                {initials(profile.display_name)}
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold leading-tight">{profile.display_name}</span>
                <span className="text-[11px] text-orange-300 inline-flex items-center gap-1">
                  <Flame className="w-3 h-3" /> {profile.streak_days}-day streak
                </span>
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuth('signin')}
              className="inline-flex items-center justify-center gap-2 px-4 min-h-[44px] rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 font-semibold"
            >
              <LogIn className="w-4 h-4" /> Sign in
            </button>
          )}
        </div>

        <div className="mt-6 flex gap-0.5 sm:gap-1 border-b border-gray-800 overflow-x-auto" role="tablist" aria-label="Community sections">
          {tabs.map(({ id, label, mobileLabel, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 min-h-[46px] text-[13px] sm:text-sm font-semibold whitespace-nowrap border-b-2 -mb-px ${
                tab === id
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="sm:hidden">{mobileLabel ?? label}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </header>

      <div role="tabpanel">
        {tab === 'presets' && (
          <PresetsPanel onUsePreset={onUsePreset} onOpenProfile={() => setTab('profile')} />
        )}
        {tab === 'circles' && <CirclesPanel onUsePreset={onUsePreset} />}
        {tab === 'profile' && <ProfilePanel onUsePreset={onUsePreset} />}
      </div>
    </div>
  );
}
