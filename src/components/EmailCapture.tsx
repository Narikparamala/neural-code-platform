import React, { useState } from 'react';
import { Mail, Send, Check, Loader2, AlertCircle } from 'lucide-react';
import { submitToInbox } from '../lib/forms';

const TELEGRAM_URL = 'https://t.me/cs0telegram';

export default function EmailCapture() {
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
    const result = await submitToInbox({
      _subject: 'CosmicSpirit0 newsletter signup',
      email: email.trim(),
      kind: 'newsletter',
    });

    if (result.success) {
      setStatus('done');
      setMessage('You are on the list. Watch your inbox for the next lab drop.');
      setEmail('');
    } else if (/activation/i.test(result.message)) {
      setStatus('error');
      setMessage(
        'One-time setup: check narikparamala@gmail.com and click the "Activate Form" link. After that every signup lands automatically.'
      );
    } else {
      setStatus('error');
      setMessage(result.message);
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
          One short email when a new lab, preset pack or research note ships. No spam, unsubscribe
          anytime.
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
            {busy ? 'Subscribing…' : status === 'done' ? 'Subscribed' : 'Subscribe'}
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
      </div>
    </section>
  );
}
