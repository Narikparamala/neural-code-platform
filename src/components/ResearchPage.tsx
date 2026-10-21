import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ExternalLink,
  Youtube,
  FlaskConical,
  History,
  AlertTriangle,
  ArrowLeft,
  FileText,
} from 'lucide-react';

type Props = { onNavigate?: (lab: string) => void };

const timeline = [
  {
    year: '1971',
    title: 'Robert Monroe publishes Journeys Out of the Body',
    body: 'A Virginia radio executive describes spontaneous out-of-body experiences and starts keeping structured records of altered states. The book brings the topic into mainstream discussion.',
  },
  {
    year: '1974',
    title: 'The Monroe Institute is founded',
    body: 'Monroe expands his research group into an institute teaching “Hemi-Sync” — hemispheric synchronisation — using different tones in each ear to encourage specific states.',
  },
  {
    year: '1970s',
    title: 'Hemi-Sync patents and Focus levels',
    body: 'Monroe receives patents for sound-based state change and develops the Focus-level vocabulary (Focus 10, 12, 15, 21 and beyond) still used in Gateway programmes today.',
  },
  {
    year: '1983',
    title: 'US Army “Gateway Process” assessment',
    body: 'Lt Col Wayne McDonnell writes a 29-page analysis for Army Intelligence. It discusses Hemi-Sync, hypnosis, biofeedback and a holographic model of consciousness. It is an internal assessment, not a controlled experiment.',
  },
  {
    year: '2003',
    title: 'The Gateway document is declassified',
    body: 'Released through the CIA FOIA reading room as CIA-RDP96-00788R001700210016-5. It is widely shared online — often without the context that it is a theoretical memo.',
  },
];

const silva = [
  'José Silva (1914–1999), a radio repairman in Laredo, Texas, began experimenting with relaxation and visualisation in the 1940s and launched “Silva Mind Control” in 1966.',
  'The core technique drops into a relaxed alpha-range state (roughly 7–14 Hz) while staying awake, then uses a “mental screen” for visualisation and problem-solving.',
  'Silva’s own claims went well beyond relaxation: improved memory, intuition, healing and psychic abilities. Independent evidence for the extraordinary claims is thin.',
  'The defensible part is familiar: slow breathing, guided relaxation and mental rehearsal are associated with reduced stress and better focus in meditation research.',
];

const ratings = [
  {
    topic: 'Binaural beats',
    verdict: 'Mixed, small effects',
    detail:
      'A 2019 meta-analysis of 22 studies reported a medium overall effect (g ≈ 0.45) on cognition, anxiety and pain, but the studies are small and heterogeneous. Treat it as a personal experiment, not a treatment.',
    tone: 'amber',
  },
  {
    topic: 'Hemi-Sync',
    verdict: 'Proprietary, limited independent evidence',
    detail:
      'Monroe Institute reports and internal research exist, but independent peer-reviewed trials are scarce and often small. The audio is real; the extraordinary claims are not established.',
    tone: 'amber',
  },
  {
    topic: 'Silva Method',
    verdict: 'Relaxation plausible, psi claims unproven',
    detail:
      'EEG studies suggest trained practitioners can increase alpha activity. Claims about intuition, healing or clairvoyance have not survived controlled testing.',
    tone: 'amber',
  },
  {
    topic: 'CIA Gateway Process',
    verdict: 'Historical document, not evidence',
    detail:
      'A 1983 theoretical assessment written for Army Intelligence. It cites Bentov’s holographic model and Monroe’s work. Declassification means it was written down — not that its physics was verified.',
    tone: 'blue',
  },
];

const ResearchPage: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-10">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button
          type="button"
          onClick={() => onNavigate?.('home')}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white min-h-[36px] mb-3"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
        </button>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 mb-4">
          <BookOpen className="w-6 h-6 text-blue-300" aria-hidden="true" />
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Research &amp; evidence
        </h1>
        <p className="text-gray-300 mt-3">
          Where the ideas behind this project come from, what the primary sources actually say, and how
          strong the evidence is. We link the documents so you can read them yourself.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Educational notes, not medical advice. Last reviewed: 21 October 2026.
        </p>
      </motion.header>

      <section className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5 mb-8">
        <h2 className="font-bold flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" aria-hidden="true" /> The short version
        </h2>
        <p className="text-sm text-gray-300">
          Sound can change how you feel and how well you concentrate. That is ordinary and useful. It
          does not follow that a specific frequency unlocks hidden brain powers, heals disease, or
          proves psychic ability. We keep the first claim and drop the rest.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-purple-400" aria-hidden="true" /> Robert Monroe &amp; Hemi-Sync
        </h2>
        <div className="space-y-4">
          {timeline.map((item) => (
            <div key={item.year} className="flex gap-4">
              <div className="w-16 flex-shrink-0 text-sm font-bold text-purple-300 pt-0.5">{item.year}</div>
              <div className="border-l border-gray-700 pl-4 pb-4">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          <a
            href="https://www.monroeinstitute.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 hover:border-purple-500/50"
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              <ExternalLink className="w-4 h-4 text-purple-300" aria-hidden="true" /> Monroe Institute (official)
            </div>
            <p className="text-xs text-gray-400 mt-1">Programmes, Hemi-Sync history and their own research statements.</p>
          </a>
          <a
            href="https://www.youtube.com/@MonroeInstitute"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 hover:border-red-500/50"
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Youtube className="w-4 h-4 text-red-400" aria-hidden="true" /> Monroe Institute on YouTube
            </div>
            <p className="text-xs text-gray-400 mt-1">Long interviews, Explorer tapes and Bob Monroe archive talks.</p>
          </a>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-emerald-400" aria-hidden="true" /> José Silva &amp; the Silva Method
        </h2>
        <ul className="space-y-2 mb-4">
          {silva.map((line) => (
            <li key={line} className="flex items-start gap-3 text-sm text-gray-300">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" aria-hidden="true" />
              {line}
            </li>
          ))}
        </ul>
        <div className="grid sm:grid-cols-2 gap-3">
          <a
            href="https://silvamethod.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 hover:border-emerald-500/50"
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              <ExternalLink className="w-4 h-4 text-emerald-300" aria-hidden="true" /> Silva Method (official)
            </div>
            <p className="text-xs text-gray-400 mt-1">History, the 3-to-1 technique and their research page.</p>
          </a>
          <a
            href="https://www.youtube.com/@SilvaMethodOfficial"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 hover:border-red-500/50"
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Youtube className="w-4 h-4 text-red-400" aria-hidden="true" /> Silva Method on YouTube
            </div>
            <p className="text-xs text-gray-400 mt-1">Guided alpha sessions and José Silva’s original recordings.</p>
          </a>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" aria-hidden="true" /> The 1983 CIA / Army Gateway document
        </h2>
        <p className="text-sm text-gray-300 mb-3">
          “Analysis and Assessment of Gateway Process” was written on 9 June 1983 by Lt Col Wayne M.
          McDonnell for the US Army Operational Group, and released in 2003 under FOIA. It describes
          Hemi-Sync, compares it with hypnosis, biofeedback and transcendental meditation, and then
          borrows Itzhak Bentov’s holographic model to speculate about consciousness. It is a memo — it
          contains no experiment, control group or measured outcome.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <a
            href="https://www.cia.gov/readingroom/document/cia-rdp96-00788r001700210016-5"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 hover:border-blue-400/60"
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              <ExternalLink className="w-4 h-4 text-blue-300" aria-hidden="true" /> CIA Reading Room record
            </div>
            <p className="text-xs text-gray-400 mt-1">CIA-RDP96-00788R001700210016-5 (full document page).</p>
          </a>
          <a
            href="https://www.cia.gov/readingroom/docs/CIA-RDP96-00788R001700210016-5.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 hover:border-blue-400/50"
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              <FileText className="w-4 h-4 text-blue-300" aria-hidden="true" /> Direct PDF
            </div>
            <p className="text-xs text-gray-400 mt-1">29 scanned pages, declassified 10 September 2003.</p>
          </a>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">How strong is the evidence?</h2>
        <div className="space-y-3">
          {ratings.map((r) => (
            <div key={r.topic} className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <h3 className="font-semibold">{r.topic}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    r.tone === 'amber' ? 'bg-amber-500/15 text-amber-300' : 'bg-blue-500/15 text-blue-300'
                  }`}
                >
                  {r.verdict}
                </span>
              </div>
              <p className="text-sm text-gray-400">{r.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3">Sources</h2>
        <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-300">
          <li>
            Garcia-Argibay, M., Santed, M. A., &amp; Reales, J. M. (2019). Efficacy of binaural auditory
            beats in cognition, anxiety, and pain perception: a meta-analysis.{' '}
            <em>Psychological Research, 83</em>(2), 357–372.{' '}
            <a
              className="text-purple-300 underline underline-offset-2"
              href="https://pubmed.ncbi.nlm.nih.gov/30073406/"
              target="_blank"
              rel="noopener noreferrer"
            >
              PubMed
            </a>
          </li>
          <li>
            McDonnell, W. M. (1983). Analysis and Assessment of Gateway Process. US Army Operational
            Group / CIA FOIA.{' '}
            <a
              className="text-purple-300 underline underline-offset-2"
              href="https://www.cia.gov/readingroom/document/cia-rdp96-00788r001700210016-5"
              target="_blank"
              rel="noopener noreferrer"
            >
              CIA Reading Room
            </a>
          </li>
          <li>
            Monroe, R. A. (1971). <em>Journeys Out of the Body</em>; (1985) <em>Far Journeys</em>; (1994){' '}
            <em>Ultimate Journey</em>. Monroe’s own accounts, useful as primary history rather than
            evidence.
          </li>
          <li>
            Silva, J., &amp; Miele, P. (1977). <em>The Silva Mind Control Method</em>. The original
            popular account of the alpha-level technique.
          </li>
          <li>
            Monroe Institute UK —{' '}
            <a
              className="text-purple-300 underline underline-offset-2"
              href="https://www.monroeinstituteuk.org/robert-a-monroe"
              target="_blank"
              rel="noopener noreferrer"
            >
              Robert A. Monroe biography
            </a>{' '}
            and{' '}
            <a
              className="text-purple-300 underline underline-offset-2"
              href="https://www.monroeinstituteuk.org/hemi-sync/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hemi-Sync explainer
            </a>
            .
          </li>
          <li>
            Silva Method —{' '}
            <a
              className="text-purple-300 underline underline-offset-2"
              href="https://silvamethod.com/about-jose-silva"
              target="_blank"
              rel="noopener noreferrer"
            >
              founder biography
            </a>{' '}
            and{' '}
            <a
              className="text-purple-300 underline underline-offset-2"
              href="https://silvamethod.com/research"
              target="_blank"
              rel="noopener noreferrer"
            >
              their research page
            </a>{' '}
            (vendor-published; read with that in mind).
          </li>
        </ol>
      </section>

      <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-300">
          Found a better primary source or a factual error? Send it over — corrections are welcome.
        </p>
        <a
          href="mailto:narikparamala@gmail.com?subject=CosmicSpirit0%20research%20correction"
          className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold text-sm"
        >
          Email a correction <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
};

export default ResearchPage;
