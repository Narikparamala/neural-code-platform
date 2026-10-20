import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquareQuote, Send, Check, Loader2, AlertCircle } from 'lucide-react';
import { fetchStories, submitStory, type Story } from '../lib/supabase';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function StoryWall() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const result = await fetchStories();
    if (result.data) {
      setStories(result.data);
      setLoadError('');
    } else {
      setLoadError(result.error || 'Could not load stories.');
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 10) {
      setState('error');
      setMessage('Tell us at least a sentence or two.');
      return;
    }
    setState('sending');
    const result = await submitStory(name, text);
    if (result.data) {
      setState('sent');
      setMessage('Story received. It will appear here after a quick review.');
      setName('');
      setText('');
    } else {
      setState('error');
      setMessage(result.error || 'Could not send your story.');
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      aria-labelledby="stories-heading"
    >
      <div className="flex items-center gap-2 mb-2">
        <MessageSquareQuote className="w-6 h-6 text-purple-400" />
        <h2 id="stories-heading" className="text-2xl font-bold">
          Community stories
        </h2>
      </div>
      <p className="text-gray-400 text-sm mb-6 max-w-2xl">
        How has a session changed your focus, sleep or mood? Share it. Stories are reviewed before
        they appear on this wall.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* published stories */}
        <div className="space-y-3">
          {!loaded && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading stories…
            </div>
          )}
          {loaded && loadError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              {loadError}{' '}
              <button
                type="button"
                onClick={() => {
                  setLoaded(false);
                  load();
                }}
                className="underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}
          {loaded && !loadError && stories.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-600 p-6 text-center text-sm text-gray-400">
              No stories published yet. Yours could be the first.
            </div>
          )}
          {stories.map((story) => (
            <blockquote
              key={story.id}
              className="rounded-lg bg-gray-900/60 border border-gray-700 p-4"
            >
              <p className="text-gray-200 text-sm whitespace-pre-line">{story.body}</p>
              <footer className="mt-3 text-xs text-purple-300">
                — {story.name}
                {story.created_at ? ` · ${formatDate(story.created_at)}` : ''}
              </footer>
            </blockquote>
          ))}
        </div>

        {/* form */}
        <form onSubmit={submit} className="space-y-3" noValidate>
          <label className="block text-sm text-gray-300" htmlFor="story-name">
            Name or handle
          </label>
          <input
            id="story-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="Anonymous"
            className="w-full min-h-[44px] px-4 py-3 rounded-lg bg-gray-900/70 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <label className="block text-sm text-gray-300" htmlFor="story-text">
            Your story
          </label>
          <textarea
            id="story-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows={5}
            maxLength={1200}
            placeholder="I used the 40 Hz gamma session before deep work and…"
            className="w-full px-4 py-3 rounded-lg bg-gray-900/70 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            type="submit"
            disabled={state === 'sending'}
            className="inline-flex items-center justify-center gap-2 px-6 min-h-[44px] bg-purple-600 hover:bg-purple-700 disabled:opacity-60 rounded-lg font-semibold transition-colors"
          >
            {state === 'sending' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : state === 'sent' ? (
              <Check className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {state === 'sending' ? 'Sending…' : state === 'sent' ? 'Sent' : 'Share my story'}
          </button>

          {message && (
            <p
              role="status"
              className={`text-sm ${state === 'error' ? 'text-red-400' : 'text-green-400'}`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </motion.section>
  );
}
