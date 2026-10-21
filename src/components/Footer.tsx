import React, { useState } from 'react';
import { Instagram, Send, Youtube, Mail, X, Music2 } from 'lucide-react';
import { useSiteSettings } from '../lib/siteSettings';

const CONTACT_EMAIL = 'narikparamala@gmail.com';

type LegalDoc = 'privacy' | 'terms' | null;

export default function Footer({ onNavigate }: { onNavigate?: (lab: string) => void }) {
  const settings = useSiteSettings();
  const [doc, setDoc] = useState<LegalDoc>(null);
  const year = new Date().getFullYear();

  return (
    <>
      <footer className="relative z-10 border-t border-gray-800 bg-gray-950/80 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CosmicSpirit0
            </p>
            <p className="text-xs text-gray-400 mt-1">Neural Code Platform</p>
            <p className="text-sm text-gray-400 mt-3 max-w-xs">
              Free browser-based tools for brainwave entrainment, spatial audio and attention training.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-200 mb-3">Explore</h2>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>
                <button type="button" onClick={() => onNavigate?.('home')} className="hover:text-white inline-flex min-h-[32px] items-center">
                  Labs
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate?.('feedback')} className="hover:text-white inline-flex min-h-[32px] items-center">
                  Reviews &amp; suggestions
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate?.('transparency')} className="hover:text-white inline-flex min-h-[32px] items-center">
                  Transparency
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate?.('connect')} className="hover:text-white inline-flex min-h-[32px] items-center">
                  Community stories
                </button>
              </li>
              <li>
                <a className="hover:text-white inline-flex min-h-[32px] items-center" href={settings.support_url} target="_blank" rel="noopener noreferrer">
                  Sponsor the project
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-200 mb-3">Connect</h2>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>
                <a className="hover:text-white inline-flex items-center gap-2 min-h-[32px]" href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
              </li>
              <li>
                <a className="hover:text-white inline-flex items-center gap-2 min-h-[32px]" href={settings.telegram_url} target="_blank" rel="noopener noreferrer">
                  <Send className="w-4 h-4" /> Telegram
                </a>
              </li>
              <li>
                <a className="hover:text-white inline-flex items-center gap-2 min-h-[32px]" href={settings.youtube_url} target="_blank" rel="noopener noreferrer">
                  <Youtube className="w-4 h-4" /> YouTube
                </a>
              </li>
              <li>
                <a className="hover:text-white inline-flex items-center gap-2 min-h-[32px]" href={settings.tiktok_url} target="_blank" rel="noopener noreferrer">
                  <Music2 className="w-4 h-4" /> TikTok
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-200 mb-3">Legal</h2>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>
                <button type="button" onClick={() => setDoc('privacy')} className="hover:text-white inline-flex items-center min-h-[32px]">
                  Privacy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setDoc('terms')} className="hover:text-white inline-flex items-center min-h-[32px]">
                  Terms
                </button>
              </li>
              <li>
                <a className="hover:text-white inline-flex items-center gap-2 min-h-[32px]" href={`mailto:${CONTACT_EMAIL}?subject=CosmicSpirit0%20contact`}>
                  <Mail className="w-4 h-4" /> Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 px-4 py-5 text-center text-xs text-gray-500">
          &copy; {year} CosmicSpirit0 &mdash; Neural Code Platform. Free and open. Not medical advice.
        </div>
      </footer>

      {doc && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-title"
          onClick={() => setDoc(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 id="legal-title" className="text-xl font-bold">
                {doc === 'privacy' ? 'Privacy' : 'Terms'}
              </h2>
              <button
                type="button"
                onClick={() => setDoc(null)}
                aria-label="Close"
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {doc === 'privacy' ? (
              <div className="space-y-3 text-sm text-gray-300">
                <p>This site has no accounts, no tracking cookies and no advertising.</p>
                <p>Audio is generated in your browser. Session data stays in your browser and is never uploaded.</p>
                <p>The newsletter stores only the email address you submit, used only to send lab updates. Ask us to delete it any time.</p>
                <p>Stories, reviews and suggestions you submit are stored in our database. Stories and reviews appear publicly after moderation; suggestions appear on the public idea board.</p>
                <p>Third-party links (Instagram, Telegram, YouTube, PayPal, Cloudinary) follow their own privacy policies.</p>
                <p>
                  Questions: <a className="text-purple-300 underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-gray-300">
                <p>CosmicSpirit0 is provided free, as-is, for exploration and education.</p>
                <p>It is not a medical device and does not diagnose, treat or cure any condition.</p>
                <p>Use headphones at a comfortable volume. Do not use while driving. If you have epilepsy, a pacemaker, or are pregnant, consult a doctor first.</p>
                <p>Stop immediately if you feel discomfort, dizziness or anxiety.</p>
                <p>Content and branding &copy; CosmicSpirit0. Donations are voluntary and non-refundable.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
