import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ShieldCheck, Database, HandCoins, FileText, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../lib/siteSettings';

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

function Tile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5 text-center">
      <div className="text-3xl font-bold text-purple-300">{value}</div>
      <div className="mt-1 text-sm text-gray-400">{label}</div>
    </div>
  );
}

export default function TransparencyPage({ onNavigate }: { onNavigate?: (lab: string) => void }) {
  const settings = useSiteSettings();
  const [stats, setStats] = useState<Stats>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = async () => {
    setFailed(false);
    const { data, error } = await supabase.rpc('site_stats');
    if (error) {
      setFailed(true);
    } else if (data) {
      setStats({ ...EMPTY, ...(data as Stats) });
    }
    setLoaded(true);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-10">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 mb-4">
          <FileText className="w-6 h-6 text-purple-300" aria-hidden="true" />
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Transparency
        </h1>
        <p className="text-gray-300 mt-3">
          What this project is, what the evidence actually shows, what we measure, and how community
          content is moderated. Real numbers only &mdash; no inflated claims.
        </p>
        <p className="text-xs text-gray-500 mt-2">Last updated: 21 October 2026</p>
      </motion.header>

      <section aria-labelledby="numbers-heading" className="mb-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 id="numbers-heading" className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" aria-hidden="true" />
            Live numbers
          </h2>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white min-h-[36px] px-3 rounded-lg border border-gray-700"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" /> Refresh
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Pulled straight from the database. These are the only platform metrics we publish; we do not
          run visitor analytics or advertising trackers.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Tile value={loaded ? stats.subscribers : '—'} label="Newsletter subscribers" />
          <Tile value={loaded ? stats.published_stories : '—'} label="Published stories" />
          <Tile value={loaded ? stats.approved_reviews : '—'} label="Approved reviews" />
          <Tile value={loaded && stats.avg_rating ? stats.avg_rating : '—'} label="Average rating" />
          <Tile value={loaded ? stats.suggestions : '—'} label="Community suggestions" />
        </div>
        {failed && (
          <p className="text-sm text-amber-300 mt-3">
            Live numbers are temporarily unavailable. Nothing is estimated or invented.
          </p>
        )}
      </section>

      <section className="space-y-6">
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-xl font-bold mb-2">What this is</h2>
          <p className="text-gray-300 text-sm">
            CosmicSpirit0 is an open, browser-based platform for audio experiments, attention games
            and plain-language explanations of sound, focus and relaxation. Everything runs locally in
            your browser and is free to use.
          </p>
          <p className="text-gray-300 text-sm mt-3">
            It is <strong>not</strong> a medical device, a treatment, or a way to &ldquo;unlock&rdquo; a
            percentage of your brain. We do not diagnose, cure or prevent any condition.
          </p>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-400" aria-hidden="true" />
            What the evidence says
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
            <li>
              Binaural beats are two slightly different tones, one per ear. Some studies report small,
              short-term effects on relaxation, mood or attention; others find no reliable effect.
              Results are mixed and sample sizes are often small.
            </li>
            <li>
              We do not claim to change brain structure, raise IQ, treat anxiety, or replace sleep or
              medical care. If a session helps you relax or focus, that is your personal experience.
            </li>
            <li>
              Headphones are needed for binaural beats. Volume should stay comfortable. Stop if you feel
              dizzy, anxious or uncomfortable.
            </li>
            <li>
              If you have epilepsy, a pacemaker, or are pregnant, speak to a doctor before using
              entrainment audio. Do not use while driving or operating machinery.
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" aria-hidden="true" />
            Data &amp; privacy
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
            <li>No accounts, no tracking cookies, no advertising pixels, no visitor analytics.</li>
            <li>Session audio is generated in your browser and never uploaded.</li>
            <li>
              If you subscribe, only your email address and signup source are stored, in a Supabase
              database, used to send occasional lab updates. Ask us to delete it at any time.
            </li>
            <li>
              Stories, reviews and suggestions you submit are stored in that database. Stories and
              reviews become public only after moderation; suggestions appear on the public board.
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-xl font-bold mb-2">Moderation policy</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
            <li>Stories and reviews are read by the maintainer before they appear publicly.</li>
            <li>
              We remove spam, abuse, personal data about other people, and medical claims presented as
              fact (for example &ldquo;this cured my condition&rdquo;).
            </li>
            <li>We do not edit the meaning of a submission; we publish, hide or decline it.</li>
            <li>Suggestions are public immediately and can be removed if they break these rules.</li>
            <li>
              Report a problem through the{' '}
              <button
                type="button"
                onClick={() => onNavigate?.('feedback')}
                className="text-purple-300 underline underline-offset-2"
              >
                reviews and suggestions page
              </button>{' '}
              or by email.
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-amber-400" aria-hidden="true" />
            Funding
          </h2>
          <p className="text-sm text-gray-300">
            Hosting currently runs on free tiers, so the running cost is $0. Contributions pay for
            audio assets, video editing time, accessibility work and future listening studies &mdash;
            never for locked safety information or artificial urgency.
          </p>
          <p className="text-sm text-gray-400 mt-3">
            <strong className="text-gray-200">Source access.</strong> The codebase is shared with
            sponsors, reviewers and researchers on request. The public site deliberately does not
            link to the maintainer’s personal GitHub account, so sharing a project link does not
            expose that profile. Email{' '}
            <a className="text-purple-300 underline" href="mailto:narikparamala@gmail.com?subject=CosmicSpirit0%20source%20request">
              narikparamala@gmail.com
            </a>{' '}
            with “source request” and what you want to review.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <a
              href={settings.support_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold text-sm"
            >
              Support the project <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => onNavigate?.('sponsor')}
              className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg border border-gray-600 hover:border-gray-500 font-semibold text-sm"
            >
              Sponsor packages
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
