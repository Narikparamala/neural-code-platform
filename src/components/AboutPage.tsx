import React from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Target,
  ShieldCheck,
  HeartHandshake,
  BookOpen,
  Users,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

type Props = { onNavigate?: (lab: string) => void };

const goals = [
  'Give anyone a complete 3-minute listening session with no account, no download and no paywall.',
  'Label every lab with what the signal is and what the evidence does — and does not — show.',
  'Publish real numbers instead of invented community stats.',
  'Keep experiences personal and moderated: stories and reviews are read before they go public.',
  'Stay free to use, with funding that is transparent and clearly separated from findings.',
  'Make the whole thing understandable to a curious beginner in under five minutes.',
];

const principles = [
  {
    icon: ShieldCheck,
    title: 'Honest by default',
    body: 'No “unlock your brain” claims. No fake urgency. If something is unproven, the page says so.',
  },
  {
    icon: HeartHandshake,
    title: 'Personal, not medical',
    body: 'We offer experiments in relaxation and attention, not treatment. Safety notes sit next to every session.',
  },
  {
    icon: Users,
    title: 'Community over metrics',
    body: 'Submissions are moderated by a human. We would rather show 11 real subscribers than 10,000 fake ones.',
  },
  {
    icon: Sparkles,
    title: 'Free and open',
    body: 'The code is public, the running cost is near zero, and the core experience will stay free.',
  },
];

const AboutPage: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-10">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 mb-4">
          <Compass className="w-6 h-6 text-purple-300" aria-hidden="true" />
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          About CosmicSpirit0
        </h1>
        <p className="text-lg text-gray-300 mt-4 max-w-3xl">
          A small, independent project exploring sound, attention and consciousness in the browser —
          built to be calm, honest and free.
        </p>
      </motion.header>

      <section className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="rounded-xl border border-purple-500/30 bg-purple-900/15 p-6">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-300" aria-hidden="true" /> Vision
          </h2>
          <p className="text-sm text-gray-300">
            A corner of the internet where curiosity about consciousness is welcome, hype is not, and
            anyone can try a sound experiment in their browser without signing up, paying, or being
            told they are broken.
          </p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-300" aria-hidden="true" /> Mission
          </h2>
          <p className="text-sm text-gray-300">
            Build a transparent alternative to exaggerated “brain-hacking” products: listen, play,
            learn what the research actually says, and record your own experience in your own words.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3">Our goals</h2>
        <ul className="space-y-3">
          {goals.map((goal) => (
            <li key={goal} className="flex items-start gap-3 text-sm text-gray-300">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" aria-hidden="true" />
              {goal}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3">How we work</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {principles.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
                <Icon className="w-5 h-5 text-purple-300 mb-2" aria-hidden="true" />
                <h3 className="font-semibold mb-1">{p.title}</h3>
                <p className="text-sm text-gray-400">{p.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 mb-10">
        <h2 className="text-xl font-bold mb-2">Where the ideas come from</h2>
        <p className="text-sm text-gray-300 mb-3">
          The project sits in a long line of sound-and-awareness work: Robert Monroe’s Hemi-Sync
          experiments, José Silva’s alpha-level relaxation method, and the declassified 1983 US Army
          “Gateway Process” assessment that discussed Monroe’s work. We treat all three as history and
          hypotheses, not proof.
        </p>
        <button
          type="button"
          onClick={() => onNavigate?.('research')}
          className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 text-sm font-semibold min-h-[40px]"
        >
          Read the research notes and sources <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </section>

      <section className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 mb-10">
        <h2 className="text-xl font-bold mb-2">Roadmap</h2>
        <ul className="grid sm:grid-cols-2 gap-3 text-sm text-gray-300">
          <li>✅ Guided 3-minute Daily Signal sessions</li>
          <li>✅ Real transparency numbers</li>
          <li>✅ Moderated reviews, stories and ideas</li>
          <li>🔜 Share cards after a session</li>
          <li>🔜 Evidence labels inside every lab</li>
          <li>🔜 Listening-consistency history (no account needed)</li>
          <li>🔜 Sponsor deck and monthly community experiment</li>
          <li>🔜 More research notes with primary sources</li>
        </ul>
      </section>

      <section className="grid sm:grid-cols-3 gap-3">
        {[
          { label: 'Evidence & sources', lab: 'research', icon: BookOpen },
          { label: 'Real numbers & policies', lab: 'transparency', icon: ShieldCheck },
          { label: 'Support the project', lab: 'sponsor', icon: HeartHandshake },
        ].map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.lab}
              type="button"
              onClick={() => onNavigate?.(link.lab)}
              className="flex items-center justify-between gap-2 rounded-xl border border-gray-700 bg-gray-800/40 p-4 min-h-[56px] text-left hover:border-purple-500/50"
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <Icon className="w-4 h-4 text-purple-300" aria-hidden="true" /> {link.label}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-500" aria-hidden="true" />
            </button>
          );
        })}
      </section>

      <p className="text-sm text-gray-500 mt-8">
        Questions, corrections or a source we missed?{' '}
        <a
          className="text-purple-300 underline underline-offset-2"
          href="mailto:narikparamala@gmail.com?subject=CosmicSpirit0%20about"
        >
          Email the maintainer
        </a>
        . Independent and self-funded; see{' '}
        <button
          type="button"
          onClick={() => onNavigate?.('sponsor')}
          className="text-purple-300 underline underline-offset-2 inline-flex items-center gap-1"
        >
          support <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </button>
        .
      </p>
    </div>
  );
};

export default AboutPage;
