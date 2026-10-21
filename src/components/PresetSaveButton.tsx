import React, { useState } from 'react';
import { Save, X, Loader2, Check, Globe2, Lock } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { createPreset, type LabId } from '../lib/social';

export default function PresetSaveButton({
  lab,
  config,
  defaultTitle,
  className = '',
  label = 'Save as preset',
}: {
  lab: LabId;
  config: any;
  defaultTitle: string;
  className?: string;
  label?: string;
}) {
  const { user, openAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const start = () => {
    if (!user) {
      openAuth('signup');
      return;
    }
    setTitle(defaultTitle);
    setError('');
    setSaved(false);
    setOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setError('');
    const result = await createPreset({
      ownerId: user.id,
      lab,
      title,
      description,
      config,
      isPublic,
    });
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
    window.setTimeout(() => setOpen(false), 1100);
  };

  return (
    <>
      <button
        type="button"
        onClick={start}
        className={
          className ||
          'inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 font-semibold'
        }
      >
        <Save className="w-4 h-4" /> {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[72] flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Save preset"
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={save}
            className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold">Publish this setup</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Anyone can load it in {lab === 'rate' ? 'Rate Lab' : lab === 'place' ? 'Place Lab' : 'this lab'}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="block text-sm mb-3">
              <span className="text-gray-300">Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={90}
                required
                className="mt-1 w-full min-h-[44px] px-3 rounded-lg bg-gray-950/70 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </label>

            <label className="block text-sm mb-3">
              <span className="text-gray-300">Notes for other listeners (optional)</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={400}
                rows={3}
                placeholder="What it sounds like, what to try, headphone notes…"
                className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-950/70 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </label>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex items-center justify-center gap-2 min-h-[44px] rounded-lg text-sm font-semibold ${
                  isPublic ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
                }`}
                aria-pressed={isPublic}
              >
                <Globe2 className="w-4 h-4" /> Public
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex items-center justify-center gap-2 min-h-[44px] rounded-lg text-sm font-semibold ${
                  !isPublic ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
                }`}
                aria-pressed={!isPublic}
              >
                <Lock className="w-4 h-4" /> Private
              </button>
            </div>

            {error && (
              <p className="mb-3 rounded-lg bg-red-900/30 p-3 text-sm text-red-300" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || saved}
              className="w-full min-h-[48px] rounded-lg bg-purple-600 hover:bg-purple-700 font-bold inline-flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {busy ? 'Saving…' : saved ? 'Saved — find it in Community' : 'Save preset'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
