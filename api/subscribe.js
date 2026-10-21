import crypto from 'node:crypto';
import { config as emailConfig, emailConfigured, layout, sendEmail } from '../lib/email.js';
import { readBody, rest, sendJson } from '../lib/supabaseAdmin.js';

/**
 * POST /api/subscribe  { email, source? }
 *
 * Double opt-in:
 *  - new address  -> pending + confirmation email
 *  - pending      -> resend at most once a minute
 *  - confirmed    -> success, no duplicate email
 *  - unsubscribed -> pending again + confirmation email
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESEND_WINDOW_MS = 60 * 1000;

// Per-instance soft rate limit. Serverless instances are short-lived, so this
// only stops naive loops; double opt-in is the real abuse control.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  return list.length > 12;
}

export default async function handler(req, res) {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-headers', 'content-type, authorization');
  res.setHeader('access-control-allow-methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const body = await readBody(req);
  const email = String(body.email || '').trim().toLowerCase();

  if (!EMAIL_RE.test(email) || email.length > 160) {
    return sendJson(res, 400, { ok: false, error: 'Please enter a valid email address.' });
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  if (rateLimited(ip)) {
    return sendJson(res, 429, {
      ok: false,
      error: 'Too many attempts. Please wait a few minutes and try again.',
    });
  }

  if (!emailConfigured()) {
    return sendJson(res, 503, {
      ok: false,
      error: 'Newsletter confirmation is not switched on yet. Please try again shortly.',
    });
  }

  try {
    const existing = await rest(
      `subscribers?email=eq.${encodeURIComponent(email)}&select=id,email,status,token,last_sent_at&limit=1`
    );
    const row = Array.isArray(existing) ? existing[0] : null;

    if (row && row.status === 'confirmed') {
      return sendJson(res, 200, {
        ok: true,
        already: true,
        message: 'This address is already confirmed. You are on the list.',
      });
    }

    if (row && row.status === 'pending' && row.last_sent_at) {
      const age = Date.now() - new Date(row.last_sent_at).getTime();
      if (age >= 0 && age < RESEND_WINDOW_MS) {
        return sendJson(res, 200, {
          ok: true,
          pending: true,
          message: 'A confirmation email was just sent. Check your inbox (and spam folder).',
        });
      }
    }

    const token = row && row.token ? row.token : crypto.randomUUID();
    const source = String(body.source || 'site').slice(0, 40);
    let subscriberId = row ? row.id : null;

    if (row) {
      await rest(`subscribers?id=eq.${encodeURIComponent(row.id)}`, {
        method: 'PATCH',
        body: { status: 'pending', token, source, confirmed_at: null },
        prefer: 'return=minimal',
      });
    } else {
      const created = await rest('subscribers', {
        method: 'POST',
        body: { email, source, status: 'pending', token },
        prefer: 'return=representation',
      });
      subscriberId = Array.isArray(created) && created[0] ? created[0].id : null;
    }

    const link = `${emailConfig.siteUrl}/?confirm=${encodeURIComponent(token)}`;
    const text =
      `One more step: confirm your email to join the CosmicSpirit0 newsletter.\n\n` +
      `Open this link: ${link}\n\n` +
      `You will get one short email when a new lab, preset pack or research note ships. ` +
      `If you did not ask for this, ignore this message and nothing else will be sent.`;
    const html = layout({
      title: 'Confirm your subscription',
      preheader: 'One click and you are on the list.',
      reason: 'You are receiving this one-time message because this address was entered on the newsletter form. It is not a newsletter yet.',
      showUnsubscribe: false,
      bodyHtml:
        `<p style="margin:0 0 16px;line-height:1.65;color:#1f2937;font-size:15px">` +
        `One more step: confirm this address to join the CosmicSpirit0 newsletter.</p>` +
        `<p style="margin:0 0 22px"><a href="${link}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:10px;font-size:15px">Confirm subscription</a></p>` +
        `<p style="margin:0 0 8px;line-height:1.6;color:#4b5563;font-size:13px">If the button does not work, paste this link into your browser:</p>` +
        `<p style="margin:0 0 18px;word-break:break-all;font-size:12px;color:#7c3aed">${link}</p>` +
        `<p style="margin:0;line-height:1.6;color:#4b5563;font-size:13px">One short email when a new lab, preset pack or research note ships. No spam. If you did not ask for this, ignore this message and nothing else will be sent.</p>`,
    });

    const result = await sendEmail({
      to: email,
      subject: 'Confirm your CosmicSpirit0 newsletter subscription',
      html,
      text,
    });

    if (!result.ok) {
      return sendJson(res, 502, {
        ok: false,
        error: 'Could not send the confirmation email right now. Please try again in a minute.',
      });
    }

    if (subscriberId) {
      await rest(`subscribers?id=eq.${encodeURIComponent(subscriberId)}`, {
        method: 'PATCH',
        body: { last_sent_at: new Date().toISOString() },
        prefer: 'return=minimal',
      });
    } else {
      await rest(`subscribers?email=eq.${encodeURIComponent(email)}`, {
        method: 'PATCH',
        body: { last_sent_at: new Date().toISOString() },
        prefer: 'return=minimal',
      });
    }

    return sendJson(res, 200, {
      ok: true,
      pending: true,
      message: 'Check your inbox and click the confirmation link.',
    });
  } catch (error) {
    console.error('subscribe failed', error);
    return sendJson(res, 500, {
      ok: false,
      error: 'Something went wrong on our side. Please try again.',
    });
  }
}
