import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type Profile = {
  id: string;
  handle: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  streak_days: number;
  longest_streak: number;
  last_session_date: string | null;
  total_sessions: number;
  total_minutes: number;
  created_at: string;
};

export type ProfileUpdate = Partial<Pick<Profile, 'handle' | 'display_name' | 'bio' | 'avatar_url'>>;

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isOwner: boolean;
  authOpen: boolean;
  openAuth: (mode?: 'signin' | 'signup') => void;
  closeAuth: () => void;
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, displayName: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: ProfileUpdate) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const OWNER_EMAIL = 'narikparamala@gmail.com';

function cleanHandle(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '')
    .slice(0, 20);
}

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) return null;
  return (data as Profile) || null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const userIdRef = useRef<string | null>(null);

  const refreshProfile = useCallback(async () => {
    const id = userIdRef.current;
    if (!id) {
      setProfile(null);
      return;
    }
    let next = await loadProfile(id);
    // The signup trigger normally runs before this; retry once if it lost the race.
    if (!next) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      next = await loadProfile(id);
    }
    setProfile(next);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      userIdRef.current = data.session?.user.id ?? null;
      setLoading(false);
      if (data.session?.user.id) refreshProfile();
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      userIdRef.current = nextSession?.user.id ?? null;
      if (nextSession?.user.id) refreshProfile();
      else setProfile(null);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return error.message;
    return null;
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const name = displayName.trim().slice(0, 40);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: name } },
      });
      if (error) return error.message;
      if (data.user && name) {
        await supabase.from('profiles').update({ display_name: name }).eq('id', data.user.id);
      }
      return null;
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: ProfileUpdate) => {
      const id = userIdRef.current;
      if (!id) return 'Sign in first.';
      const clean: ProfileUpdate = {};
      if (patch.display_name !== undefined) {
        const value = patch.display_name.trim().slice(0, 40);
        if (value.length < 2) return 'Use at least 2 characters for your name.';
        clean.display_name = value;
      }
      if (patch.handle !== undefined) {
        const value = cleanHandle(patch.handle);
        if (value.length < 3) return 'Handles need at least 3 letters or numbers.';
        clean.handle = value;
      }
      if (patch.bio !== undefined) clean.bio = (patch.bio || '').trim().slice(0, 280) || null;
      if (patch.avatar_url !== undefined) clean.avatar_url = (patch.avatar_url || '').trim().slice(0, 500) || null;

      const { error } = await supabase.from('profiles').update(clean).eq('id', id);
      if (error) {
        if (error.code === '23505') return 'That handle is taken. Try another.';
        return error.message;
      }
      await refreshProfile();
      return null;
    },
    [refreshProfile]
  );

  const openAuth = useCallback((mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      isOwner: (session?.user.email || '').toLowerCase() === OWNER_EMAIL,
      authOpen,
      openAuth,
      closeAuth,
      authMode,
      setAuthMode,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [
      session,
      profile,
      loading,
      authOpen,
      openAuth,
      closeAuth,
      authMode,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function initials(name: string | null | undefined) {
  const value = (name || '?').trim();
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
