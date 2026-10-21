import { useMemo, useState } from 'react';
import { AlertCircle, BellOff, Check, Loader2, MailCheck } from 'lucide-react';
import { apiPost } from '../lib/api';

type Mode = 'confirm' | 'unsubscribe' | 'notice';

const NOTICES: Record<string, { text: string; tone: 'ok' | 'bad' }> = {
  confirmed: {
    text: 'Subscription confirmed. Welcome — the next lab drop will land in your inbox.',
    tone: 'ok',
  },
  unsubscribed: {
    text: 'You are unsubscribed. No further newsletter emails will be sent.',
    tone: 'ok',
  },
  invalid: {
    text: 'That link is not valid or has expired. Enter your email in the newsletter form to get a fresh one.',
    tone: 'bad',
  },
  error: {
    text: 'Something went wrong with that link. Please try again from the newsletter form.',
    tone: 'bad',
  },
};

function clearEmailParams() {
  try {
    const url = new URL(window.location.href);
    ['confirm', 'unsubscribe', 'newsletter'].forEach((key) => url.searchParams.delete(key));
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, '', next || '/');
  } catch {
    /* ignore */
  }
}

/**
 * Handles the three email-link states:
 *  - ?confirm=<token>      asks the visitor to confirm (POST, not a bare GET,
 *                          so inbox link scanners cannot auto-confirm)
 *  - ?unsubscribe=<token>  asks before unsubscribing
 *  - ?newsletter=…         shows the result after returning from a link
 */
export default function NewsletterNotice() {
  const initial = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    if (params.get('confirm')) return { mode: 'confirm' as Mode, token: params.get('confirm') as string };
    if (params.get('unsubscribe'))
      return { mode: 'unsubscribe' as Mode, token: params.get('unsubscribe') as string };
    const notice = params.get('newsletter');
    if (notice) return { mode: 'notice' as Mode, notice };
    return null;
  }, []);

  const [mode, setMode] = useState<Mode | null>(initial ? initial.mode : null);
  const [token] = useState(initial && 'token' in initial ? initial.token : '');
  const [noticeKey, setNoticeKey] = useState(
    initial && 'notice' in initial && initial.notice ? initial.notice : ''
  );
  const [result, setResult] = useState<{ text: string; tone: 'ok' | 'bad' } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!mode) return null;

  if (mode === 'notice') {
    const info = NOTICES[noticeKey] || NOTICES.error;
    const shown = result || info;
    return (
      <div className="max-w-3xl mx-auto px-4 mb-4">
        <div
          role="status"
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            shown.tone === 'ok'
              ? 'border-green-500/40 bg-green-900/20 text-green-200'
              : 'border-red-500/40 bg-red-900/20 text-red-200'
          }`}
        >
          {shown.tone === 'ok' ? (
            <MailCheck className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div className="flex-1">{shown.text}</div>
          <button
            type="button"
            onClick={() => {
              clearEmailParams();
              setMode(null);
            }}
            className="text-xs underline underline-offset-2 opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  const confirming = mode === 'confirm';
  const title = confirming ? 'Confirm your newsletter subscription' : 'Unsubscribe from the newsletter';
  const blurb = confirming
    ? 'One click confirms this address. You will get one short email when a new lab, preset pack or research note ships.'
    : 'This will stop all newsletter emails to this address. You can subscribe again later.';

  const act = async () => {
    setBusy(true);
    const res = await apiPost<{ message?: string }>(
      confirming ? '/api/confirm' : '/api/unsubscribe',
      { token }
    );
    setBusy(false);
    if (res.data) {
      setResult({
        text: res.data.message || (confirming ? 'Subscription confirmed.' : 'You are unsubscribed.'),
        tone: 'ok',
      });
      setMode('notice');
      setNoticeKey(confirming ? 'confirmed' : 'unsubscribed');
      clearEmailParams();
    } else {
      setResult({
        text: res.error || 'That link did not work. Request a fresh one from the newsletter form.',
        tone: 'bad',
      });
      setMode('notice');
      setNoticeKey('invalid');
      clearEmailParams();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 mb-4">
      <div className="rounded-xl border border-purple-500/40 bg-purple-900/25 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {confirming ? (
            <MailCheck className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <BellOff className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div className="flex-1">
            <h2 className="font-semibold text-white">{title}</h2>
            <p className="text-sm text-gray-300 mt-1">{blurb}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={act}
                disabled={busy}
                className={`inline-flex items-center gap-2 px-4 min-h-[40px] rounded-lg font-semibold text-sm disabled:opacity-60 ${
                  confirming
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : confirming ? (
                  <Check className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <BellOff className="w-4 h-4" aria-hidden="true" />
                )}
                {busy ? 'Working…' : confirming ? 'Confirm subscription' : 'Unsubscribe'}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearEmailParams();
                  setMode(null);
                }}
                className="px-4 min-h-[40px] rounded-lg border border-gray-600 hover:border-gray-500 text-sm"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
