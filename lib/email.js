/**
 * Email delivery for CosmicSpirit0.
 *
 * Two interchangeable providers, chosen by environment variables:
 *
 * 1. Brevo HTTP API        -> set BREVO_API_KEY (and optionally BREVO_SENDER_EMAIL)
 * 2. Google Apps Script    -> set EMAIL_WEBHOOK_URL + EMAIL_WEBHOOK_SECRET
 *                             (free, sends from the project Gmail account, ~100/day)
 *
 * Nothing here is imported by the browser bundle. Keys stay in Vercel env vars.
 */

const SITE_URL = (process.env.SITE_URL || 'https://neural-code-platform.vercel.app').replace(/\/$/, '');
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'narikparamala@gmail.com';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'CosmicSpirit0';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'narikparamala@gmail.com';
const POSTAL_ADDRESS =
  process.env.POSTAL_ADDRESS || 'Remote, Bengaluru, Karnataka 560001, India';

export const config = { siteUrl: SITE_URL, adminEmail: ADMIN_EMAIL, senderEmail: SENDER_EMAIL };

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Turn plain text into safe paragraphs. Blank line = new paragraph. */
export function textToHtml(text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block
        .split('\n')
        .map((line) => escapeHtml(line))
        .join('<br />');
      return `<p style="margin:0 0 16px;line-height:1.65;color:#1f2937;font-size:15px">${lines}</p>`;
    })
    .join('');
}

/**
 * Branded HTML wrapper. `bodyHtml` must already be escaped/safe.
 */
export function layout({
  title,
  bodyHtml,
  unsubscribeUrl,
  preheader,
  reason = 'You are receiving this because you confirmed a subscription on the platform.',
  showUnsubscribe = true,
}) {
  const safeTitle = escapeHtml(title);
  const unsub = unsubscribeUrl || `${SITE_URL}/`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f0ff;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f0ff;padding:24px 12px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e0f5;border-radius:16px;overflow:hidden">
            <tr>
              <td style="padding:22px 26px 0">
                <div style="font:700 12px/1.4 -apple-system,Segoe UI,Roboto,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#7c3aed">CosmicSpirit0</div>
                <div style="font:400 12px/1.4 -apple-system,Segoe UI,Roboto,sans-serif;color:#6b7280;margin-top:4px">Neural Code Platform</div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 26px 8px">
                <h1 style="margin:0 0 16px;font:800 24px/1.25 -apple-system,Segoe UI,Roboto,sans-serif;color:#111827">${safeTitle}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 26px 26px">
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:18px 0" />
                <p style="margin:0 0 6px;font:400 12px/1.55 -apple-system,Segoe UI,Roboto,sans-serif;color:#6b7280">
                  ${escapeHtml(reason)}
                </p>
                <p style="margin:0 0 6px;font:400 12px/1.55 -apple-system,Segoe UI,Roboto,sans-serif;color:#6b7280">
                  ${escapeHtml(POSTAL_ADDRESS)}
                </p>
                <p style="margin:0;font:400 12px/1.55 -apple-system,Segoe UI,Roboto,sans-serif;color:#6b7280">
                  ${showUnsubscribe ? `<a href="${unsub}" style="color:#7c3aed">Unsubscribe</a> &middot;` : ''}
                  <a href="${SITE_URL}/" style="color:#7c3aed">Open the platform</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function providers() {
  const list = [];
  if (process.env.BREVO_API_KEY) list.push('brevo');
  if (process.env.EMAIL_WEBHOOK_URL) list.push('apps-script');
  return list;
}

export function emailConfigured() {
  return providers().length > 0;
}

/**
 * `brevo+apps-script` means Brevo is tried first and the Gmail relay catches failures.
 */
export function providerName() {
  const list = providers();
  if (!list.length) return null;
  return list.join('+');
}

export function providerLabel() {
  const name = providerName();
  if (name === 'brevo+apps-script') return 'Brevo (primary) + Gmail relay (fallback)';
  if (name === 'brevo') return 'Brevo';
  if (name === 'apps-script') return 'Google Apps Script (Gmail)';
  return 'Not configured';
}

async function sendViaBrevo({ to, subject, html, text, unsubscribeUrl }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      replyTo: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text || undefined,
      headers: unsubscribeUrl
        ? {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          }
        : undefined,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Brevo ${res.status}: ${detail.slice(0, 300)}`);
  }
}

async function sendViaWebhook({ to, subject, html, text }) {
  const res = await fetch(process.env.EMAIL_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.EMAIL_WEBHOOK_SECRET || '',
      to,
      subject,
      html,
      text: text || '',
      name: SENDER_NAME,
      replyTo: SENDER_EMAIL,
    }),
  });
  const raw = await res.text();
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    /* Apps Script returns HTML on auth errors */
  }
  if (!res.ok || !parsed || parsed.ok !== true) {
    throw new Error(`Mail webhook ${res.status}: ${(parsed && parsed.error) || raw.slice(0, 200)}`);
  }
}

/**
 * Send one email with automatic failover. Returns { ok, provider, attempts?, error? }.
 */
export async function sendEmail(payload) {
  const list = providers();
  if (!list.length) {
    return { ok: false, provider: null, error: 'Email is not configured yet.' };
  }

  const attempts = [];
  for (const kind of list) {
    try {
      if (kind === 'brevo') await sendViaBrevo(payload);
      else await sendViaWebhook(payload);
      return { ok: true, provider: kind, attempts };
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      attempts.push({ provider: kind, error: message });
      // Try the next provider before giving up.
    }
  }

  return {
    ok: false,
    provider: list[0],
    attempts,
    error: attempts.map((a) => `${a.provider}: ${a.error}`).join(' | '),
  };
}
