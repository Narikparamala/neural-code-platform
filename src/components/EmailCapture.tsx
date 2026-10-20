import React, { useState } from 'react';
import { Mail, Send, Check, Loader2 } from 'lucide-react';

const CONTACT_EMAIL = 'narikparamala@gmail.com';
const TELEGRAM_URL = 'https://t.me/cs0telegram';

export default function EmailCapture() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'invalid' | 'opened'>('idle');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    if (!valid) {
      setStatus('invalid');
      return;
    }
    const subject = encodeURIComponent('Add me to CosmicSpirit0 updates');
    const body = encodeURIComponent(
      `Hi CosmicSpirit0,\n\nPlease add ${email.trim()} to the new-lab announcements list.\n\nThanks!`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setStatus('opened');
  };

  return (
    <section className="max-w-3xl mx-auto px-4 my-10" aria-labelledby="newsletter-heading">
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/30 to-blue-900/20 p-6 sm:p-8 text-center">
        <h2 id="newsletter-heading" className="text-2xl sm:text-3xl font-bold mb-2">
          Get new labs by email
        </h2>
        <p className="text-gray-300 text-sm sm:text-base mb-6">
          One short email when a new lab, preset pack or research note ships. No spam, unsubscribe anytime.
        </p>

        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" noValidate>
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
              setStatus('idle');
            }}
            placeholder="you@example.com"
            className="flex-1 min-h-[44px] px-4 py-3 rounded-lg bg-gray-900/70 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 min-h-[44px] bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
          >
            {status === 'opened' ? <Check className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
            {status === 'opened' ? 'Check your mail app' : 'Subscribe'}
          </button>
        </form>

        {status === 'invalid' && (
          <p className="text-red-400 text-sm mt-3" role="alert">
            Please enter a valid email address.
          </p>
        )}

        <p className="text-xs text-gray-500 mt-3">
          Opens your email app &mdash; nothing is stored on this site. Prefer chat?{' '}
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
          Join Telegram &mdash; @cs0telegram
        </a>
      </div>
    </section>
  );
}
