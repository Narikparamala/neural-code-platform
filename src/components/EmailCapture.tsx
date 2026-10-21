import React, { useState } from 'react';
import { Mail, Send, Check, Loader2, AlertCircle, Youtube, Music2 } from 'lucide-react';
import { subscribeEmail } from '../lib/supabase';
import { useSiteSettings } from '../lib/siteSettings';

export default function EmailCapture() {
  const settings = useSiteSettings();
  const TELEGRAM_URL = settings.telegram_url;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'invalid' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    if (!valid) {
      setStatus('invalid');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('sending');
    const result = await subscribeEmail(email, 'newsletter');

    if (result.data) {
      setStatus('done');
      setMessage(result.message || 'Check your inbox and click the confirmation link.');
      setEmail('');
    } else {
      setStatus(result.error === 'Please enter a valid email address.' ? 'invalid' : 'error');
      setMessage(result.error || 'Could not subscribe right now. Please try again.');
    }
  };

  const busy = status === 'sending';

  return (
    <section className="max-w-5xl mx-auto px-4 my-10" aria-labelledby="newsletter-heading">
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/30 to-blue-900/20 p-6 sm:p-10 text-center">
        <h2 id="newsletter-heading" className="text-2xl sm:text-3xl font-bold mb-2">
          Get new labs by email
        </h2>
        <p className="text-gray-300 text-sm sm:text-base mb-6 max-w-xl mx-auto">
          One short email when a new lab, preset pack or research note ships. Confirm once, then
          unsubscribe any time.
        </p>

        <form
          onSubmit={submit}
          className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          noValidate
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== 'sending') setStatus('idle');
            }}
            placeholder="you@example.com"
            className="flex-1 min-h-[44px] px-4 py-3 rounded-lg bg-gray-900/70 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 px-6 min-h-[44px] bg-purple-600 hover:bg-purple-700 disabled:opacity-60 rounded-lg font-semibold transition-colors"
          >
            {busy ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : status === 'done' ? (
              <Check className="w-5 h-5" />
            ) : (
              <Mail className="w-5 h-5" />
            )}
            {busy ? 'Sending…' : status === 'done' ? 'Check inbox' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <p
            role="status"
            className={`text-sm mt-3 inline-flex items-center gap-2 ${
              status === 'error' || status === 'invalid' ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {status === 'error' || status === 'invalid' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {message}
          </p>
        )}

        <p className="text-xs text-gray-500 mt-4">
          Prefer chat?{' '}
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-300 underline underline-offset-2"
          >
            Join the Telegram community
          </a>
          .
        </p>

        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 mt-4 px-6 min-h-[44px] bg-sky-600 hover:bg-sky-700 rounded-lg font-medium transition-colors"
        >
          <Send className="w-5 h-5" />
          Join Telegram
        </a>

        <a
          href={settings.youtube_url + '?sub_confirmation=1'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 mt-4 ml-0 sm:ml-3 px-6 min-h-[44px] bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
        >
          <Youtube className="w-5 h-5" />
          Subscribe on YouTube
        </a>

        <a
          href={settings.tiktok_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 mt-4 ml-0 sm:ml-3 px-6 min-h-[44px] bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-lg font-medium transition-colors"
        >
          <Music2 className="w-5 h-5" />
          Follow on TikTok
        </a>
      </div>
    </section>
  );
}
