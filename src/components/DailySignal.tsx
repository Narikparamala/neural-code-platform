import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, Headphones, Star, Check, Loader2, AlertCircle } from 'lucide-react';
import { submitReview } from '../lib/supabase';
import { SessionShareButton, SessionSavedNote, useSessionRecorder } from './SessionShare';

type Goal = 'calm' | 'focus' | 'sleep' | 'curiosity';

const GOALS: Record<
  Goal,
  { label: string; beat: number; carrier: number; note: string; color: string }
> = {
  calm: {
    label: 'Calm',
    beat: 10,
    carrier: 200,
    note: '10 Hz alpha-range beat — often used for relaxed wakefulness.',
    color: 'from-emerald-500 to-teal-600',
  },
  focus: {
    label: 'Focus',
    beat: 15,
    carrier: 220,
    note: '15 Hz beta-range beat — often used for active attention.',
    color: 'from-blue-500 to-cyan-600',
  },
  sleep: {
    label: 'Wind down',
    beat: 4,
    carrier: 180,
    note: '4 Hz delta-range beat — a slow, quiet wind-down signal.',
    color: 'from-indigo-500 to-purple-700',
  },
  curiosity: {
    label: 'Curiosity',
    beat: 7.83,
    carrier: 210,
    note: '7.83 Hz — the number popularised by the “Schumann resonance” story.',
    color: 'from-purple-500 to-pink-600',
  },
};

const LENGTHS = [3, 5, 10];

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function DailySignal() {
  const [goal, setGoal] = useState<Goal>('calm');
  const [minutes, setMinutes] = useState(3);
  const [volume, setVolume] = useState(0.08);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [remaining, setRemaining] = useState(180);

  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [sendMsg, setSendMsg] = useState('');

  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);

  const lastSession = useSessionRecorder({
    lab: 'daily',
    playing: phase === 'running',
    details: {
      goal,
      minutes,
      beat: GOALS[goal].beat,
      carrier: GOALS[goal].carrier,
    },
  });

  const stopAudio = (fade = 0.4) => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (ctx && gain) {
      try {
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + fade);
      } catch {
        /* ignore */
      }
    }
    window.setTimeout(() => {
      try {
        ctx?.close();
      } catch {
        /* ignore */
      }
      if (ctxRef.current === ctx) {
        ctxRef.current = null;
        gainRef.current = null;
      }
    }, fade * 1000 + 150);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopAudio(0.05);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = () => {
    // Guarantee a clean audio graph if a previous session is still fading out.
    try {
      ctxRef.current?.close();
    } catch {
      /* ignore */
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    gain.connect(ctx.destination);
    gainRef.current = gain;

    const { beat, carrier } = GOALS[goal];
    const left = ctx.createOscillator();
    const right = ctx.createOscillator();
    left.type = 'sine';
    right.type = 'sine';
    left.frequency.value = carrier - beat / 2;
    right.frequency.value = carrier + beat / 2;

    const panL = ctx.createStereoPanner();
    const panR = ctx.createStereoPanner();
    panL.pan.value = -1;
    panR.pan.value = 1;

    left.connect(panL).connect(gain);
    right.connect(panR).connect(gain);

    left.start();
    right.start();

    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.2);

    setRemaining(minutes * 60);
    setPhase('running');
    setSendState('idle');
    setSendMsg('');

    let leftOver = minutes * 60;
    timerRef.current = window.setInterval(() => {
      leftOver -= 1;
      setRemaining(Math.max(0, leftOver));
      if (leftOver <= 0) {
        stopAudio(1.2);
        setPhase('done');
      }
    }, 1000);
  };

  const stop = () => {
    stopAudio();
    setPhase('done');
  };

  const total = minutes * 60;
  const progress = phase === 'running' ? Math.min(100, ((total - remaining) / total) * 100) : 0;

  const sendRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setSendState('error');
      setSendMsg('Pick a rating first.');
      return;
    }
    setSendState('sending');
    const result = await submitReview(
      'Daily Signal',
      rating,
      `Daily Signal · ${GOALS[goal].label} · ${minutes} min${note.trim() ? ` — ${note.trim()}` : ''}`
    );
    if (result.data) {
      setSendState('sent');
      setSendMsg('Thanks — your rating is in the moderation queue.');
      setNote('');
      setRating(0);
    } else {
      setSendState('error');
      setSendMsg(result.error || 'Could not send your rating.');
    }
  };

  return (
    <section
      id="daily-signal"
      aria-labelledby="daily-signal-heading"
      className="w-full max-w-4xl mx-auto mt-10 lg:mt-14 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/25 to-blue-900/15 p-5 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h2 id="daily-signal-heading" className="text-2xl lg:text-3xl font-bold">
          Daily Signal
        </h2>
        <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">
          Listen · 3–10 min
        </span>
      </div>
      <p className="text-sm text-gray-300 mb-5 max-w-2xl">
        One short, guided listening session. Pick a goal, keep the volume low, and rate your own
        experience afterwards. Personal experience, not medical evidence.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        {(Object.keys(GOALS) as Goal[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setGoal(key)}
            disabled={phase === 'running'}
            className={`text-left rounded-xl p-4 min-h-[74px] bg-gradient-to-br ${GOALS[key].color} ${
              goal === key ? 'ring-2 ring-white/70' : 'opacity-75 hover:opacity-100'
            } disabled:opacity-50 transition`}
            aria-pressed={goal === key}
          >
            <span className="font-bold">{GOALS[key].label}</span>
            <span className="block text-xs mt-1 text-white/85">{GOALS[key].note}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-1" role="group" aria-label="Session length">
          {LENGTHS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMinutes(m)}
              disabled={phase === 'running'}
              className={`px-4 min-h-[40px] rounded-lg text-sm font-semibold ${
                minutes === m ? 'bg-purple-600' : 'bg-gray-800/80 hover:bg-gray-700'
              } disabled:opacity-50`}
              aria-pressed={minutes === m}
            >
              {m} min
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-300 flex-1 min-w-[180px]">
          <Headphones className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only">Volume</span>
          <input
            type="range"
            min={0.01}
            max={0.2}
            step={0.01}
            value={volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              const ctx = ctxRef.current;
              if (ctx && gainRef.current) {
                gainRef.current.gain.setTargetAtTime(v, ctx.currentTime, 0.1);
              }
            }}
            className="w-full accent-purple-500"
            aria-label="Volume"
          />
        </label>
      </div>

      {phase === 'running' ? (
        <div>
          <div className="flex items-center justify-between text-sm text-gray-300 mb-1">
            <span>
              {GOALS[goal].label} · {GOALS[goal].beat} Hz beat
            </span>
            <span className="tabular-nums">{fmt(remaining)}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-800 overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-[width] duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-lg bg-red-600 hover:bg-red-700 font-semibold"
          >
            <Square className="w-4 h-4" aria-hidden="true" /> Stop session
          </button>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={start}
            className="inline-flex items-center gap-2 px-6 min-h-[48px] rounded-lg bg-purple-600 hover:bg-purple-700 font-bold"
          >
            <Play className="w-5 h-5" aria-hidden="true" />
            {phase === 'done' ? 'Run another session' : `Start ${minutes}-minute session`}
          </button>
          <p className="text-xs text-gray-400 mt-3">
            Headphones are required for the binaural effect. Keep the volume comfortable. Do not use
            while driving. Stop if you feel uncomfortable.
          </p>
        </div>
      )}

      {phase === 'done' && (
        <form onSubmit={sendRating} className="mt-6 border-t border-white/10 pt-5">
          <p className="text-sm text-gray-300 mb-2">How did that feel?</p>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                aria-pressed={rating === n}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10"
              >
                <Star
                  className={`w-5 h-5 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-500'}`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
          <label htmlFor="daily-note" className="sr-only">
            Optional note
          </label>
          <input
            id="daily-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder="Optional: one line about what you noticed"
            className="w-full min-h-[44px] px-4 rounded-lg bg-gray-900/70 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <button
              type="submit"
              disabled={sendState === 'sending'}
              className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-lg bg-white/10 hover:bg-white/15 font-semibold disabled:opacity-60"
            >
              {sendState === 'sending' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : sendState === 'sent' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Star className="w-4 h-4" />
              )}
              {sendState === 'sent' ? 'Sent' : 'Submit rating'}
            </button>
            <SessionShareButton
              payload={{
                kind: 'session',
                badge: 'Daily Signal',
                title: `${GOALS[goal].label} · ${minutes} min`,
                subtitle: `${GOALS[goal].beat} Hz beat · ${GOALS[goal].carrier} Hz carrier`,
                stats: [
                  { label: 'Length', value: `${minutes} min` },
                  { label: 'Beat', value: `${GOALS[goal].beat} Hz` },
                  { label: 'Carrier', value: `${GOALS[goal].carrier} Hz` },
                  { label: 'Goal', value: GOALS[goal].label },
                ],
                caption: `${GOALS[goal].label} — a ${minutes}-minute Daily Signal session.`,
              }}
            />
            {sendMsg && (
              <span
                className={`text-sm inline-flex items-center gap-1 ${
                  sendState === 'error' ? 'text-red-400' : 'text-green-400'
                }`}
                role="status"
              >
                {sendState === 'error' && <AlertCircle className="w-4 h-4" />}
                {sendMsg}
              </span>
            )}
          </div>
          <div className="mt-3">
            <SessionSavedNote last={lastSession} />
          </div>
        </form>
      )}
    </section>
  );
}
