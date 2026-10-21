import React, { useEffect, useState } from 'react';
import { Printer, ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Stats = {
  subscribers: number;
  published_stories: number;
  approved_reviews: number;
  suggestions: number;
  avg_rating: number;
};

const EMPTY: Stats = {
  subscribers: 0,
  published_stories: 0,
  approved_reviews: 0,
  suggestions: 0,
  avg_rating: 0,
};

const packages = [
  {
    name: 'Community Sponsor',
    price: 'From $100 / month',
    points: [
      'Logo on the sponsor page',
      'One newsletter mention',
      'Support for one monthly community experiment',
      'Monthly performance report with real numbers',
    ],
  },
  {
    name: 'Lab Sponsor',
    price: 'From $250 / month',
    points: [
      '“Supported by” attribution inside one lab',
      'Co-created preset collection, clearly labelled',
      'Branded educational content, separated from findings',
      'Launch announcement and analytics report',
    ],
  },
  {
    name: 'Research / Education Partner',
    price: 'Project based',
    points: [
      'Support for evidence summaries or open datasets',
      'No control over results or conclusions',
      'Public methodology and limitations',
      'Sponsor kept separate from scientific claims',
    ],
  },
];

export default function SponsorDeck({ onBack }: { onBack?: () => void }) {
  const [stats, setStats] = useState<Stats>(EMPTY);

  useEffect(() => {
    supabase
      .rpc('site_stats')
      .then(({ data }) => {
        if (data) setStats({ ...EMPTY, ...(data as Stats) });
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to sponsor page
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold text-sm"
        >
          <Printer className="w-4 h-4" aria-hidden="true" /> Print / Save as PDF
        </button>
      </div>

      <article className="deck-page bg-white text-gray-900 rounded-2xl p-6 sm:p-10 shadow-2xl">
        <header className="border-b border-gray-200 pb-5 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-purple-600 font-bold">
                Sponsorship one-pager
              </p>
              <h1 className="text-3xl font-black mt-1">CosmicSpirit0</h1>
              <p className="text-sm text-gray-600 mt-1">
                Open audio experiments for attention, relaxation and curiosity.
              </p>
            </div>
            <div className="text-right text-xs text-gray-600">
              <p className="font-semibold text-gray-800">neural-code-platform.vercel.app</p>
              <p>narikparamala@gmail.com</p>
              <p>October 2026</p>
            </div>
          </div>
        </header>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">What it is</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            A free, browser-based platform where people listen to guided sound experiments, play
            attention games, and read plain-language notes on binaural beats, Hemi-Sync and the
            evidence behind them. No account, no install, no medical claims. Audio is generated
            locally in the browser.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">The audience</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Curious beginners, students, meditators and wellness-tech sceptics who want to try
            something without exaggerated “brain-hacking” promises. The product is designed for repeat
            visits through a short daily session, not for one-off novelty.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3">Real numbers (pulled live from the database)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            {[
              { n: stats.subscribers, l: 'Subscribers' },
              { n: stats.published_stories, l: 'Stories' },
              { n: stats.approved_reviews, l: 'Reviews' },
              { n: stats.avg_rating || '—', l: 'Avg rating' },
              { n: stats.suggestions, l: 'Ideas' },
            ].map((s) => (
              <div key={s.l} className="border border-gray-200 rounded-lg p-3">
                <div className="text-xl font-bold text-purple-700">{s.n}</div>
                <div className="text-[11px] text-gray-600">{s.l}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Early-stage and honest. We do not publish invented reach, impressions or “users”.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3">Packages</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {packages.map((p) => (
              <div key={p.name} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-sm">{p.name}</h3>
                <p className="text-xs text-purple-700 font-semibold mb-2">{p.price}</p>
                <ul className="space-y-1">
                  {p.points.map((pt) => (
                    <li key={pt} className="text-xs text-gray-700 flex gap-1.5">
                      <span className="text-purple-600">•</span> {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" aria-hidden="true" /> Brand safety
          </h2>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• No ads or sponsor messages inside an active listening session.</li>
            <li>• Sponsor content is labelled and kept separate from evidence notes.</li>
            <li>• Sponsors never control results, moderation or safety information.</li>
            <li>• No health or medical claims are made for any signal.</li>
          </ul>
        </section>

        <footer className="border-t border-gray-200 pt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-semibold">Want the full deck and a pilot proposal?</span>
          <a
            href="mailto:narikparamala@gmail.com?subject=CosmicSpirit0%20sponsorship"
            className="inline-flex items-center gap-2 text-purple-700 font-semibold"
          >
            <Mail className="w-4 h-4" aria-hidden="true" /> narikparamala@gmail.com
          </a>
        </footer>
      </article>

      <p className="no-print text-xs text-gray-500 mt-4">
        Tip: choose “Save as PDF” in the print dialog. The page is sized for A4.
      </p>
    </div>
  );
}
