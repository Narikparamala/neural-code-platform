import React, { useEffect, useRef, useState } from 'react';
import {
  Users,
  Plus,
  Lock,
  Globe2,
  Loader2,
  Send,
  Copy,
  Check,
  ArrowLeft,
  LogOut,
  MessageCircle,
  Headphones,
  X,
} from 'lucide-react';
import { useAuth, initials } from '../lib/auth';
import {
  LAB_LABEL,
  createCircle,
  fetchCircleMembers,
  fetchCircleMessages,
  fetchCircles,
  fetchMyPresets,
  fetchPreset,
  joinCircle,
  leaveCircle,
  markCircleRead,
  sendCircleMessage,
  type Circle,
  type CircleMember,
  type CircleMessage,
  type Preset,
} from '../lib/social';

export default function CirclesPanel({ onUsePreset }: { onUsePreset: (preset: Preset) => void }) {
  const { user, openAuth } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [messages, setMessages] = useState<CircleMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [text, setText] = useState('');
  const [attachId, setAttachId] = useState('');
  const [myPresets, setMyPresets] = useState<Preset[]>([]);
  const [sending, setSending] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinBusy, setJoinBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const selected = circles.find((circle) => circle.id === selectedId) || null;

  const loadCircles = async () => {
    setLoading(true);
    const result = await fetchCircles();
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError('');
    setCircles(result.data || []);
  };

  useEffect(() => {
    void loadCircles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    fetchMyPresets(user.id).then((result) => setMyPresets(result.data || []));
  }, [user]);

  const openCircle = async (id: string) => {
    setSelectedId(id);
    setMessages([]);
    setChatLoading(true);
    setNotice('');
    const [memberResult, messageResult] = await Promise.all([
      fetchCircleMembers(id),
      fetchCircleMessages(id),
    ]);
    setMembers(memberResult.data || []);
    setMessages(messageResult.data || []);
    setChatLoading(false);
    void markCircleRead(id);
  };

  useEffect(() => {
    if (!selectedId) return;
    let alive = true;
    const tick = async () => {
      const result = await fetchCircleMessages(selectedId);
      if (alive && !result.error) setMessages(result.data || []);
    };
    const timer = window.setInterval(tick, 6000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  // Deep link: /?circle=CODE
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('circle');
    if (!code) return;
    joinCircle(code).then(async (result) => {
      if (result.data) {
        await loadCircles();
        await openCircle(result.data.id);
      }
      const url = new URL(window.location.href);
      url.searchParams.delete('circle');
      window.history.replaceState({}, '', url.toString());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      openAuth('signup');
      return;
    }
    const data = new FormData(event.currentTarget);
    const result = await createCircle({
      ownerId: user.id,
      name: String(data.get('name') || ''),
      description: String(data.get('description') || ''),
      visibility: data.get('visibility') === 'private' ? 'private' : 'public',
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    setCreateOpen(false);
    await loadCircles();
    if (result.data) await openCircle(result.data.id);
  };

  const join = async () => {
    if (!user) {
      openAuth('signup');
      return;
    }
    setJoinBusy(true);
    setError('');
    const result = await joinCircle(joinCode);
    setJoinBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setJoinCode('');
    setNotice(`Joined ${result.data?.name || 'circle'}.`);
    await loadCircles();
    if (result.data) await openCircle(result.data.id);
  };

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !selected) return;
    if (!text.trim() && !attachId) return;
    setSending(true);
    const result = await sendCircleMessage({
      circleId: selected.id,
      userId: user.id,
      body: text,
      presetId: attachId || null,
    });
    setSending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setText('');
    setAttachId('');
    const fresh = await fetchCircleMessages(selected.id);
    setMessages(fresh.data || []);
    void markCircleRead(selected.id);
  };

  const leave = async () => {
    if (!user || !selected) return;
    if (selected.owner_id === user.id) {
      setError('You own this circle. Transfer or delete it from the database first.');
      return;
    }
    if (!window.confirm(`Leave ${selected.name}?`)) return;
    const result = await leaveCircle(selected.id, user.id);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSelectedId(null);
    await loadCircles();
  };

  const copyInvite = async () => {
    if (!selected) return;
    const base = `${window.location.origin}${import.meta.env.BASE_URL || '/'}`;
    const link = `${base}?circle=${selected.invite_code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  const loadAttachedPreset = async (presetId: string) => {
    const result = await fetchPreset(presetId);
    if (result.data) onUsePreset(result.data);
  };

  if (selected) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="lg:hidden inline-flex items-center gap-1 text-sm text-gray-300 mb-3 min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4" /> All circles
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <aside className="lg:col-span-1 rounded-xl border border-gray-700 bg-gray-800/40 p-4">
            <div className="flex items-center gap-2 mb-1">
              {selected.visibility === 'private' ? (
                <Lock className="w-4 h-4 text-amber-300" />
              ) : (
                <Globe2 className="w-4 h-4 text-green-300" />
              )}
              <h2 className="font-bold text-lg truncate">{selected.name}</h2>
            </div>
            {selected.description && <p className="text-sm text-gray-400 mb-3">{selected.description}</p>}

            <button
              type="button"
              onClick={copyInvite}
              className="w-full inline-flex items-center justify-center gap-2 min-h-[40px] rounded-lg bg-white/10 hover:bg-white/15 text-sm mb-2"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Invite link copied' : 'Copy invite link'}
            </button>
            <p className="text-[11px] text-gray-500 mb-4">
              Code: <span className="font-mono text-gray-300">{selected.invite_code}</span>
            </p>

            <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Members ({members.length})
            </h3>
            <ul className="space-y-2 max-h-56 overflow-y-auto">
              {members.map((member) => {
                const name = member.profiles?.display_name || 'Listener';
                return (
                  <li key={member.user_id} className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-gray-950">
                      {initials(name)}
                    </span>
                    <span className="truncate">{name}</span>
                    {member.role !== 'member' && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        {member.role}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={leave}
              className="mt-4 inline-flex items-center gap-2 text-xs text-red-300 hover:text-red-200 min-h-[36px]"
            >
              <LogOut className="w-3.5 h-3.5" /> Leave circle
            </button>
          </aside>

          <section className="lg:col-span-3 rounded-xl border border-gray-700 bg-gray-800/40 flex flex-col h-[62vh] min-h-[420px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatLoading ? (
                <p className="text-center text-sm text-gray-400 py-10">
                  <Loader2 className="w-4 h-4 animate-spin inline" /> Loading messages…
                </p>
              ) : messages.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-10">
                  No messages yet. Share a preset or say hello.
                </p>
              ) : (
                messages.map((message) => {
                  const mine = message.user_id === user?.id;
                  const name = message.profiles?.display_name || 'Listener';
                  return (
                    <div key={message.id} className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                      <span className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-[11px] font-bold text-gray-950">
                        {initials(name)}
                      </span>
                      <div className={`max-w-[80%] ${mine ? 'text-right' : ''}`}>
                        <p className="text-[11px] text-gray-500 mb-1">
                          {mine ? 'You' : name} ·{' '}
                          {new Date(message.created_at).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <div
                          className={`inline-block rounded-xl px-3 py-2 text-left ${
                            mine ? 'bg-purple-600/80' : 'bg-gray-700/70'
                          }`}
                        >
                          {message.body && <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>}
                          {message.presets && (
                            <button
                              type="button"
                              onClick={() => void loadAttachedPreset(message.presets!.id)}
                              className="mt-2 w-full flex items-center gap-2 rounded-lg bg-black/25 hover:bg-black/35 px-2 py-1.5 text-left"
                            >
                              <Headphones className="w-3.5 h-3.5 text-cyan-300" />
                              <span className="text-xs">
                                <span className="block font-semibold">{message.presets.title}</span>
                                <span className="text-gray-300">
                                  {LAB_LABEL[message.presets.lab] || message.presets.lab} · load preset
                                </span>
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={send} className="border-t border-gray-700 p-3 space-y-2">
              {error && <p className="text-xs text-red-300">{error}</p>}
              <div className="flex gap-2">
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void send(event as unknown as React.FormEvent);
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder={`Message ${selected.name}…`}
                  className="flex-1 min-h-[44px] max-h-28 px-3 py-2 rounded-lg bg-gray-950/70 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={sending || (!text.trim() && !attachId)}
                  className="px-4 min-h-[44px] rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                  aria-label="Send message"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Headphones className="w-3.5 h-3.5" />
                <select
                  value={attachId}
                  onChange={(event) => setAttachId(event.target.value)}
                  className="flex-1 min-w-0 min-h-[34px] px-2 rounded bg-gray-900 border border-gray-700"
                >
                  <option value="">Attach one of your presets (optional)</option>
                  {myPresets.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.title} · {LAB_LABEL[preset.lab] || preset.lab}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <p className="text-sm text-gray-400 max-w-xl">
          Circles are small groups around a practice: share presets, compare notes, keep each other
          consistent. No follower counts, no algorithm.
        </p>
        <button
          type="button"
          onClick={() => (user ? setCreateOpen(true) : openAuth('signup'))}
          className="inline-flex items-center justify-center gap-2 px-4 min-h-[44px] rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> New circle
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          value={joinCode}
          onChange={(event) => setJoinCode(event.target.value)}
          placeholder="Paste an invite code or link"
          className="flex-1 min-h-[44px] px-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="button"
          onClick={join}
          disabled={joinBusy || !joinCode.trim()}
          className="px-4 min-h-[44px] rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {joinBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />} Join
        </button>
      </div>

      {notice && <p className="mb-4 text-sm text-green-300">{notice}</p>}
      {error && <p className="mb-4 rounded-lg bg-red-900/25 p-3 text-sm text-red-300">{error}</p>}

      {loading ? (
        <p className="py-12 text-center text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin inline" /> Loading circles…
        </p>
      ) : circles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-700 p-10 text-center">
          <MessageCircle className="w-10 h-10 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold">No circles yet</h3>
          <p className="text-sm text-gray-400 mt-1">Start one for a practice, a lab, or a small listening group.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {circles.map((circle) => {
            const count = circle.circle_members?.[0]?.count || 0;
            return (
              <button
                key={circle.id}
                type="button"
                onClick={() => void openCircle(circle.id)}
                className="text-left rounded-xl border border-gray-700 bg-gray-800/45 p-4 hover:border-purple-500/50 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  {circle.visibility === 'private' ? (
                    <Lock className="w-4 h-4 text-amber-300" />
                  ) : (
                    <Globe2 className="w-4 h-4 text-green-300" />
                  )}
                  <h3 className="font-bold truncate">{circle.name}</h3>
                </div>
                {circle.description && <p className="text-sm text-gray-400 line-clamp-2 mb-3">{circle.description}</p>}
                <p className="text-xs text-gray-500 inline-flex items-center gap-1">
                  <Users className="w-3 h-3" /> {count} member{count === 1 ? '' : 's'}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {createOpen && (
        <div
          className="fixed inset-0 z-[72] flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Create a circle"
          onClick={() => setCreateOpen(false)}
        >
          <form
            onSubmit={create}
            className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">New circle</h2>
              <button type="button" onClick={() => setCreateOpen(false)} className="p-2 rounded-lg hover:bg-white/10" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <label className="block text-sm mb-3">
              <span className="text-gray-300">Name</span>
              <input
                name="name"
                required
                maxLength={60}
                placeholder="Night-shift listeners"
                className="mt-1 w-full min-h-[44px] px-3 rounded-lg bg-gray-950/70 border border-gray-700"
              />
            </label>
            <label className="block text-sm mb-3">
              <span className="text-gray-300">What is it for? (optional)</span>
              <textarea
                name="description"
                rows={3}
                maxLength={400}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-950/70 border border-gray-700"
              />
            </label>
            <fieldset className="mb-4">
              <legend className="text-sm text-gray-300 mb-1">Visibility</legend>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 rounded-lg bg-gray-800 p-3 text-sm cursor-pointer">
                  <input type="radio" name="visibility" value="public" defaultChecked />
                  <Globe2 className="w-4 h-4 text-green-300" /> Public
                </label>
                <label className="flex items-center gap-2 rounded-lg bg-gray-800 p-3 text-sm cursor-pointer">
                  <input type="radio" name="visibility" value="private" />
                  <Lock className="w-4 h-4 text-amber-300" /> Private
                </label>
              </div>
            </fieldset>
            <button
              type="submit"
              className="w-full min-h-[48px] rounded-lg bg-purple-600 hover:bg-purple-700 font-bold"
            >
              Create circle
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
