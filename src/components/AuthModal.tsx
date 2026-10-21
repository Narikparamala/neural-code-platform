import React, { useEffect, useState } from 'react';
import { X, LogIn, UserPlus, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function AuthModal() {
  const { authOpen, closeAuth, authMode, setAuthMode, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!authOpen) return;
    setError('');
    setNotice('');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAuth();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [authOpen, closeAuth]);

  if (!authOpen) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Use at least 6 characters for your password.');
      return;
    }
    setBusy(true);
    try {
      if (authMode === 'signup') {
        if (name.trim().length < 2) {
          setError('Add the name other listeners should see.');
          return;
        }
        const problem = await signUp(email, password, name);
        if (problem) setError(problem);
        else {
          setNotice('Account created. You are signed in.');
          window.setTimeout(closeAuth, 700);
        }
      } else {
        const problem = await signIn(email, password);
        if (problem) setError(problem);
        else closeAuth();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={authMode === 'signin' ? 'Sign in' : 'Create an account'}
      onClick={closeAuth}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-purple-500/30 bg-gradient-to-br from-gray-900 to-purple-950/60 p-5 sm:p-7 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-bold">
              {authMode === 'signin' ? 'Welcome back' : 'Join the lab'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              People, not bots. Presets, reviews, circles and streaks are tied to a real account.
            </p>
          </div>
          <button
            type="button"
            onClick={closeAuth}
            className="p-2 rounded-lg hover:bg-white/10"
            aria-label="Close sign in"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5" role="tablist" aria-label="Account action">
          <button
            type="button"
            role="tab"
            aria-selected={authMode === 'signin'}
            onClick={() => setAuthMode('signin')}
            className={`flex items-center justify-center gap-2 min-h-[44px] rounded-lg text-sm font-semibold ${
              authMode === 'signin' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <LogIn className="w-4 h-4" /> Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={authMode === 'signup'}
            onClick={() => setAuthMode('signup')}
            className={`flex items-center justify-center gap-2 min-h-[44px] rounded-lg text-sm font-semibold ${
              authMode === 'signup' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Create account
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {authMode === 'signup' && (
            <label className="block text-sm">
              <span className="text-gray-300">Display name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={40}
                autoComplete="nickname"
                placeholder="How other listeners see you"
                className="mt-1 w-full min-h-[44px] px-3 rounded-lg bg-gray-950/70 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </label>
          )}

          <label className="block text-sm">
            <span className="text-gray-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="mt-1 w-full min-h-[44px] px-3 rounded-lg bg-gray-950/70 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </label>

          <label className="block text-sm">
            <span className="text-gray-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={6}
              placeholder="6+ characters"
              className="mt-1 w-full min-h-[44px] px-3 rounded-lg bg-gray-950/70 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-red-900/30 border border-red-500/30 p-3 text-sm text-red-300" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-lg bg-green-900/25 border border-green-500/30 p-3 text-sm text-green-300" role="status">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full min-h-[48px] rounded-lg bg-purple-600 hover:bg-purple-700 font-bold disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {busy ? 'Working…' : authMode === 'signin' ? 'Sign in' : 'Create my account'}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500">
          No newsletter signup is created automatically. Your email is only used for this account.
        </p>
      </div>
    </div>
  );
}
