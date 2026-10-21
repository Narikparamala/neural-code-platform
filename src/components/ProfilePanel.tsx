import React, { useEffect, useState } from 'react';
import {
  Loader2,
  Save,
  LogOut,
  Flame,
  Clock,
  Headphones,
  Trash2,
  Pencil,
  Check,
  Lock,
  Globe2,
} from 'lucide-react';
import { useAuth, initials } from '../lib/auth';
import {
  LAB_LABEL,
  deletePreset,
  fetchMyPresets,
  fetchSessions,
  type Preset,
  type SessionRow,
} from '../lib/social';
import { SessionShareButton, fmtDuration } from './SessionShare';

export default function ProfilePanel({ onUsePreset }: { onUsePreset: (preset: Preset) => void }) {
  const { user, profile, loading, signOut, updateProfile, openAuth, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    setName(profile.display_name);
    setHandle(profile.handle);
    setBio(profile.bio || '');
  }, [profile]);

  const loadData = async () => {
    if (!user) {
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    const [sessionResult, presetResult] = await Promise.all([
      fetchSessions(user.id, 30),
      fetchMyPresets(user.id),
    ]);
    setSessions(sessionResult.data || []);
    setPresets(presetResult.data || []);
    setDataLoading(false);
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const problem = await updateProfile({ display_name: name, handle, bio });
    setBusy(false);
    if (problem) {
      setError(problem);
      return;
    }
    setEditing(false);
    setSaved(true);
    await refreshProfile();
    window.setTimeout(() => setSaved(false), 1800);
  };

  const removePreset = async (preset: Preset) => {
    if (!window.confirm(`Delete “${preset.title}”? People who saved it will lose access.`)) return;
    const result = await deletePreset(preset.id);
    if (result.error) {
      setError(result.error);
      return;
    }
    setPresets((current) => current.filter((item) => item.id !== preset.id));
  };

  if (loading) {
    return (
      <p className="py-16 text-center text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin inline" /> Loading your profile…
      </p>
    );
  }

  if (!user || !profile) {
    return (
      <div className="rounded-2xl border border-purple-500/25 bg-purple-900/15 p-8 text-center">
        <Headphones className="w-10 h-10 text-purple-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold">Your listener profile</h2>
        <p className="text-sm text-gray-400 mt-1 mb-5 max-w-md mx-auto">
          Sign in to keep session history, build a streak, publish presets, review other people’s
          setups, and join circles.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => openAuth('signup')}
            className="px-5 min-h-[44px] rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold"
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => openAuth('signin')}
            className="px-5 min-h-[44px] rounded-lg bg-white/10 hover:bg-white/15 font-semibold"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <section className="lg:col-span-1 space-y-4">
        <div className="rounded-2xl border border-gray-700 bg-gray-800/45 p-5">
          <div className="flex items-center gap-3">
            <span className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg font-black text-gray-950">
              {initials(profile.display_name)}
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-bold truncate">{profile.display_name}</h2>
              <p className="text-sm text-gray-400 truncate">@{profile.handle}</p>
            </div>
          </div>

          {profile.bio && !editing && <p className="text-sm text-gray-300 mt-3">{profile.bio}</p>}

          {editing ? (
            <form onSubmit={save} className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="text-gray-300">Display name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={40}
                  className="mt-1 w-full min-h-[42px] px-3 rounded-lg bg-gray-950/70 border border-gray-700"
                />
              </label>
              <label className="block text-sm">
                <span className="text-gray-300">Handle</span>
                <input
                  value={handle}
                  onChange={(event) => setHandle(event.target.value)}
                  maxLength={20}
                  className="mt-1 w-full min-h-[42px] px-3 rounded-lg bg-gray-950/70 border border-gray-700"
                />
              </label>
              <label className="block text-sm">
                <span className="text-gray-300">Bio (optional)</span>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={2}
                  maxLength={280}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-950/70 border border-gray-700"
                />
              </label>
              {error && <p className="text-sm text-red-300">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-4 min-h-[42px] rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-semibold disabled:opacity-60"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 min-h-[42px] rounded-lg bg-white/10 hover:bg-white/15 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 px-3 min-h-[40px] rounded-lg bg-white/10 hover:bg-white/15 text-sm"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit profile
              </button>
              {saved && (
                <span className="inline-flex items-center gap-1 text-xs text-green-400">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-700 bg-gray-800/45 p-5">
          <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-3">Your practice</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-xs text-gray-400 inline-flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" /> Streak
              </p>
              <p className="text-2xl font-black">{profile.streak_days}d</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-xs text-gray-400">Longest</p>
              <p className="text-2xl font-black">{profile.longest_streak}d</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-xs text-gray-400">Sessions</p>
              <p className="text-2xl font-black">{profile.total_sessions}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-xs text-gray-400 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> Minutes
              </p>
              <p className="text-2xl font-black">{profile.total_minutes}</p>
            </div>
          </div>

          <div className="mt-4">
            <SessionShareButton
              label="Share my card"
              className="w-full inline-flex items-center justify-center gap-2 px-4 min-h-[42px] rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-sm font-semibold"
              payload={{
                kind: 'profile',
                badge: 'Listener profile',
                title: profile.display_name,
                subtitle: profile.bio || 'Exploring sound, attention and place — one session at a time.',
                handle: profile.handle,
                stats: [
                  { label: 'Current streak', value: `${profile.streak_days} days` },
                  { label: 'Longest streak', value: `${profile.longest_streak} days` },
                  { label: 'Sessions', value: String(profile.total_sessions) },
                  { label: 'Minutes listened', value: String(profile.total_minutes) },
                ],
                caption: `${profile.display_name} on CosmicSpirit0 — ${profile.streak_days}-day listening streak.`,
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-3 inline-flex items-center gap-2 text-sm text-red-300 hover:text-red-200 min-h-[40px]"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </section>

      <section className="lg:col-span-2 space-y-5">
        <div className="rounded-2xl border border-gray-700 bg-gray-800/45 p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="font-bold">Your presets</h3>
            <span className="text-xs text-gray-500">{presets.length} saved</span>
          </div>
          {dataLoading ? (
            <p className="text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin inline" /> Loading…
            </p>
          ) : presets.length === 0 ? (
            <p className="text-sm text-gray-400">
              Nothing published yet. Tune a lab and press “Save as preset”.
            </p>
          ) : (
            <ul className="divide-y divide-gray-700">
              {presets.map((preset) => (
                <li key={preset.id} className="py-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{preset.title}</p>
                    <p className="text-xs text-gray-500">
                      {LAB_LABEL[preset.lab] || preset.lab} ·{' '}
                      {preset.is_public ? (
                        <span className="inline-flex items-center gap-1">
                          <Globe2 className="w-3 h-3" /> public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" /> private
                        </span>
                      )}{' '}
                      · {preset.plays} plays · {preset.rating_count} reviews
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUsePreset(preset)}
                    className="px-3 min-h-[36px] rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold"
                  >
                    Use
                  </button>
                  <button
                    type="button"
                    onClick={() => void removePreset(preset)}
                    className="p-2 rounded-lg text-red-300 hover:bg-red-900/30"
                    aria-label={`Delete ${preset.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-gray-700 bg-gray-800/45 p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="font-bold">Session history</h3>
            <span className="text-xs text-gray-500">Last 30</span>
          </div>
          {dataLoading ? (
            <p className="text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin inline" /> Loading…
            </p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-gray-400">
              Play any lab for 10+ seconds while signed in and it lands here.
            </p>
          ) : (
            <ul className="divide-y divide-gray-700">
              {sessions.map((session) => (
                <li key={session.id} className="py-3 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-purple-500/15 text-purple-300 flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {LAB_LABEL[session.lab] || session.lab}{' '}
                      <span className="text-gray-400 font-normal">
                        · {fmtDuration(session.duration_seconds)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.created_at).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {session.details && Object.keys(session.details).length > 0
                        ? ` · ${Object.entries(session.details)
                            .slice(0, 2)
                            .map(([key, value]) => `${key}: ${String(value)}`)
                            .join(' · ')}`
                        : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
