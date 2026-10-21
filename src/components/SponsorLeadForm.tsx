import React, { useState } from 'react';
import { Send, Loader2, Check, AlertCircle } from 'lucide-react';
import { submitSponsorLead } from '../lib/supabase';

const PACKAGES = [
  { value: 'community', label: 'Community Sponsor — from $100/mo' },
  { value: 'lab', label: 'Lab Sponsor — from $250/mo' },
  { value: 'research', label: 'Research / Education Partner — project based' },
  { value: 'other', label: 'Something else' },
];

export default function SponsorLeadForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    organisation: '',
    package: 'community',
    budget: '',
    message: '',
  });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setState('sending');
    const result = await submitSponsorLead(form);
    if (result.data) {
      setState('sent');
      setForm({ name: '', email: '', organisation: '', package: 'community', budget: '', message: '' });
    } else {
      setState('error');
      setError(result.error || 'Could not send your request.');
    }
  };

  if (state === 'sent') {
    return (
      <div className="rounded-xl border border-green-500/40 bg-green-950/20 p-6 text-center">
        <Check className="w-6 h-6 text-green-400 mx-auto mb-2" aria-hidden="true" />
        <h3 className="font-bold mb-1">Thanks — your request is in.</h3>
        <p className="text-sm text-gray-300">
          It lands in the private sponsor inbox. Expect a reply within three business days.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-4 text-sm text-purple-300 underline underline-offset-2"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-purple-500/30 bg-purple-900/10 p-6">
      <h3 className="text-xl font-bold mb-1">Start a conversation</h3>
      <p className="text-sm text-gray-400 mb-4">
        Tell us the package you are considering. This is stored privately and read by the maintainer —
        no auto-added mailing list.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="sp-name" className="block text-xs text-gray-400 mb-1">Your name</label>
          <input
            id="sp-name"
            required
            value={form.name}
            onChange={set('name')}
            maxLength={80}
            className="w-full min-h-[44px] px-3 rounded-lg bg-gray-900/70 border border-gray-600 text-white"
          />
        </div>
        <div>
          <label htmlFor="sp-email" className="block text-xs text-gray-400 mb-1">Work email</label>
          <input
            id="sp-email"
            required
            type="email"
            value={form.email}
            onChange={set('email')}
            maxLength={160}
            className="w-full min-h-[44px] px-3 rounded-lg bg-gray-900/70 border border-gray-600 text-white"
          />
        </div>
        <div>
          <label htmlFor="sp-org" className="block text-xs text-gray-400 mb-1">Brand / organisation</label>
          <input
            id="sp-org"
            value={form.organisation}
            onChange={set('organisation')}
            maxLength={120}
            className="w-full min-h-[44px] px-3 rounded-lg bg-gray-900/70 border border-gray-600 text-white"
          />
        </div>
        <div>
          <label htmlFor="sp-budget" className="block text-xs text-gray-400 mb-1">Budget (optional)</label>
          <input
            id="sp-budget"
            value={form.budget}
            onChange={set('budget')}
            maxLength={60}
            placeholder="e.g. $250 / month"
            className="w-full min-h-[44px] px-3 rounded-lg bg-gray-900/70 border border-gray-600 text-white placeholder-gray-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="sp-package" className="block text-xs text-gray-400 mb-1">Package</label>
          <select
            id="sp-package"
            value={form.package}
            onChange={set('package')}
            className="w-full min-h-[44px] px-3 rounded-lg bg-gray-900/70 border border-gray-600 text-white"
          >
            {PACKAGES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="sp-message" className="block text-xs text-gray-400 mb-1">What do you have in mind?</label>
          <textarea
            id="sp-message"
            required
            rows={4}
            value={form.message}
            onChange={set('message')}
            maxLength={2000}
            className="w-full px-3 py-2 rounded-lg bg-gray-900/70 border border-gray-600 text-white"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button
          type="submit"
          disabled={state === 'sending'}
          className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold disabled:opacity-60"
        >
          {state === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {state === 'sending' ? 'Sending…' : 'Send request'}
        </button>
        {error && (
          <span className="text-sm text-red-400 inline-flex items-center gap-1" role="status">
            <AlertCircle className="w-4 h-4" /> {error}
          </span>
        )}
      </div>
    </form>
  );
}
