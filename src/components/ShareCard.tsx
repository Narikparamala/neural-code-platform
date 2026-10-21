import React, { useEffect, useRef, useState } from 'react';
import { Download, Share2, X, Copy, Check } from 'lucide-react';

export type SharePayload = {
  kind: 'session' | 'preset' | 'profile';
  badge: string;
  title: string;
  subtitle?: string;
  stats: { label: string; value: string }[];
  handle?: string | null;
  caption?: string;
};

const W = 1080;
const H = 1350;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = String(text || '').split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const probe = line ? `${line} ${word}` : word;
    if (ctx.measureText(probe).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = probe;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (ctx.measureText(last).width > maxWidth) {
      let trimmed = last;
      while (trimmed.length > 4 && ctx.measureText(`${trimmed}…`).width > maxWidth) trimmed = trimmed.slice(0, -1);
      lines[maxLines - 1] = `${trimmed}…`;
    }
  }
  return lines;
}

export async function renderShareCard(payload: SharePayload): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0f0620');
  bg.addColorStop(0.45, '#2a0f4d');
  bg.addColorStop(1, '#081426');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Glows
  const glow = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };
  glow(120, 120, 520, 'rgba(168,85,247,0.35)');
  glow(980, 1180, 560, 'rgba(45,212,191,0.25)');
  glow(880, 220, 380, 'rgba(236,72,153,0.18)');

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 90) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 90) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Orbital rings
  ctx.strokeStyle = 'rgba(196,181,253,0.22)';
  [210, 300, 390].forEach((r, i) => {
    ctx.beginPath();
    ctx.arc(880, 980, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(196,181,253,${0.18 - i * 0.04})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Header
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = '600 26px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText('COSMICSPIRIT0', 80, 96);
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.font = '400 24px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText('Neural Code Platform', 80, 132);

  // Logo mark
  ctx.beginPath();
  ctx.arc(982, 96, 44, 0, Math.PI * 2);
  const logo = ctx.createLinearGradient(938, 52, 1026, 140);
  logo.addColorStop(0, '#a855f7');
  logo.addColorStop(1, '#22d3ee');
  ctx.fillStyle = logo;
  ctx.fill();
  ctx.fillStyle = '#0b0616';
  ctx.font = '800 30px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CS0', 982, 107);
  ctx.textAlign = 'left';

  // Badge
  const badge = payload.badge.toUpperCase();
  ctx.font = '700 24px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  const badgeWidth = ctx.measureText(badge).width + 46;
  ctx.fillStyle = 'rgba(168,85,247,0.18)';
  ctx.strokeStyle = 'rgba(192,132,252,0.55)';
  ctx.lineWidth = 2;
  const badgeY = 226;
  ctx.beginPath();
  ctx.roundRect(80, badgeY, badgeWidth, 54, 27);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e9d5ff';
  ctx.fillText(badge, 103, badgeY + 36);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 84px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  const titleLines = wrapText(ctx, payload.title, W - 160, 3);
  titleLines.forEach((line, i) => ctx.fillText(line, 80, 380 + i * 96));

  // Subtitle
  if (payload.subtitle) {
    ctx.fillStyle = 'rgba(226,232,240,0.78)';
    ctx.font = '400 34px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    wrapText(ctx, payload.subtitle, W - 160, 2).forEach((line, i) =>
      ctx.fillText(line, 80, 700 + i * 46)
    );
  }

  // Stats grid
  const stats = (payload.stats || []).slice(0, 4);
  const top = 790;
  const cellW = 440;
  const cellH = 158;
  stats.forEach((stat, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 80 + col * (cellW + 40);
    const y = top + row * (cellH + 28);
    ctx.fillStyle = 'rgba(255,255,255,0.055)';
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, cellW, cellH, 26);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '600 22px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.fillText(stat.label.toUpperCase(), x + 30, y + 48);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 50px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.fillText(stat.value, x + 30, y + 112);
  });

  // Footer
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(80, 1190);
  ctx.lineTo(W - 80, 1190);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = '600 26px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  const who = payload.handle ? `@${payload.handle}` : 'neural-code-platform.vercel.app';
  ctx.fillText(who, 80, 1246);

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '400 22px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText('Personal exploration, honestly labelled.', 80, 1288);
  ctx.textAlign = 'right';
  ctx.fillText('not medical treatment', W - 80, 1288);
  ctx.textAlign = 'left';

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
}

export default function ShareCard({
  payload,
  onClose,
}: {
  payload: SharePayload | null;
  onClose: () => void;
}) {
  const [url, setUrl] = useState('');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let alive = true;
    setUrl('');
    setBlob(null);
    setError('');
    if (!payload) return;
    renderShareCard(payload)
      .then((next) => {
        if (!alive || !next) {
          if (alive) setError('Could not draw the share card in this browser.');
          return;
        }
        setBlob(next);
        setUrl(URL.createObjectURL(next));
      })
      .catch(() => alive && setError('Could not draw the share card in this browser.'));
    return () => {
      alive = false;
    };
  }, [payload]);

  useEffect(() => {
    if (!payload) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [payload, onClose]);

  if (!payload) return null;

  const filename = `cosmicspirit0-${payload.kind}-${Date.now()}.png`;

  const download = () => {
    if (!blob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 2000);
  };

  const share = async () => {
    if (!blob) return;
    const file = new File([blob], filename, { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (data: any) => boolean };
    if (navigator.share && nav.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: payload.title,
          text: payload.caption || `${payload.title} — CosmicSpirit0`,
        });
        return;
      } catch {
        /* fall through to download */
      }
    }
    download();
  };

  const copyCaption = async () => {
    const text =
      payload.caption ||
      `${payload.title}${payload.subtitle ? ` — ${payload.subtitle}` : ''}\nhttps://neural-code-platform.vercel.app`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Share card"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900 p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold">Share card</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800"
            aria-label="Close share card"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-900/30 p-3 text-sm text-red-300">{error}</p>}

        <div className="rounded-xl overflow-hidden border border-gray-700 bg-black/40 min-h-[240px] flex items-center justify-center">
          {url ? (
            <img src={url} alt="Generated share card preview" className="w-full max-w-md h-auto" />
          ) : (
            <span className="text-sm text-gray-400 py-16">Drawing your card…</span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={download}
            disabled={!blob}
            className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Download PNG
          </button>
          <button
            type="button"
            onClick={share}
            disabled={!blob}
            className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg bg-gray-800 hover:bg-gray-700 font-semibold disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            type="button"
            onClick={copyCaption}
            className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg bg-gray-800 hover:bg-gray-700 font-semibold"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Caption copied' : 'Copy caption'}
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          1080 × 1350 PNG. Uses only what you see here — no health or performance claims.
        </p>
      </div>
    </div>
  );
}
