import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Share2, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { recordSession } from '../lib/social';
import ShareCard, { type SharePayload } from './ShareCard';

export function fmtDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export type LastSession = { seconds: number; streak?: number; saved: boolean; at: number };

/**
 * Records a listening/play session when playback stops (or the lab unmounts).
 * Only counts sessions of 10 seconds or more, and only persists them for signed-in listeners.
 */
export function useSessionRecorder({
  lab,
  playing,
  details,
  presetId,
}: {
  lab: string;
  playing: boolean;
  details: any;
  presetId?: string | null;
}) {
  const { user, refreshProfile } = useAuth();
  const startRef = useRef<number | null>(null);
  const detailsRef = useRef(details);
  const userRef = useRef(user);
  const presetRef = useRef(presetId ?? null);
  const [last, setLast] = useState<LastSession | null>(null);

  detailsRef.current = details;
  userRef.current = user;
  presetRef.current = presetId ?? null;

  const finish = useCallback(async () => {
    if (!startRef.current) return;
    const seconds = Math.round((Date.now() - startRef.current) / 1000);
    startRef.current = null;
    if (seconds < 10) return;

    const current = userRef.current;
    if (!current) {
      setLast({ seconds, saved: false, at: Date.now() });
      return;
    }
    const { data } = await recordSession({
      lab,
      seconds,
      details: detailsRef.current,
      presetId: presetRef.current,
    });
    refreshProfile();
    setLast({
      seconds,
      saved: true,
      streak: typeof data?.streak_days === 'number' ? data.streak_days : undefined,
      at: Date.now(),
    });
  }, [lab, refreshProfile]);

  useEffect(() => {
    if (playing) {
      if (!startRef.current) startRef.current = Date.now();
    } else {
      void finish();
    }
  }, [playing, finish]);

  useEffect(
    () => () => {
      void finish();
    },
    [finish]
  );

  return last;
}

export function SessionShareButton({
  payload,
  label = 'Share card',
  className,
}: {
  payload: SharePayload;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          'inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 font-semibold'
        }
      >
        <Share2 className="w-4 h-4" /> {label}
      </button>
      <ShareCard payload={open ? payload : null} onClose={() => setOpen(false)} />
    </>
  );
}

export function SessionSavedNote({ last }: { last: LastSession | null }) {
  if (!last) return null;
  if (!last.saved) {
    return (
      <p className="text-xs text-gray-400 inline-flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        {fmtDuration(last.seconds)} this session — sign in to save streaks and history.
      </p>
    );
  }
  return (
    <p className="text-xs text-green-400 inline-flex items-center gap-1">
      <Sparkles className="w-3 h-3" />
      Saved {fmtDuration(last.seconds)}
      {typeof last.streak === 'number' ? ` · ${last.streak}-day streak` : ''}
    </p>
  );
}
