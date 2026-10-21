import { config as emailConfig, emailConfigured, layout, providerName, sendEmail, textToHtml } from '../lib/email.js';
import { getUserFromToken, isAdmin, readBody, rest, sendJson } from '../lib/supabaseAdmin.js';

const CONCURRENCY = 6;

function capFor(provider) {
  const override = Number(process.env.MAX_EMAILS_PER_SEND || 0);
  if (override > 0) return override;
  return provider === 'brevo' ? 290 : 90;
}

async function caller(req) {
  const header = String(req.headers.authorization || '');
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  const user = await getUserFromToken(token);
  return { user, admin: isAdmin(user) };
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let index = 0;
  async function next() {
    const current = index++;
    if (current >= items.length) return;
    results[current] = await worker(items[current], current);
    await next();
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
  return results;
}

export default async function handler(req, res) {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-headers', 'content-type, authorization');
  res.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const { admin } = await caller(req);
  if (!admin) {
    return sendJson(res, 401, { ok: false, error: 'Sign in as the site owner to send the newsletter.' });
  }

  const provider = providerName();

  if (req.method === 'GET') {
    const rows = await rest(
      'subscribers?select=status&limit=1000'
    ).catch(() => []);
    const counts = { confirmed: 0, pending: 0, unsubscribed: 0 };
    (Array.isArray(rows) ? rows : []).forEach((row) => {
      if (counts[row.status] !== undefined) counts[row.status] += 1;
    });
    return sendJson(res, 200, {
      ok: true,
      configured: emailConfigured(),
      provider,
      cap: capFor(provider),
      counts,
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('allow', 'GET, POST');
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  }

  if (!emailConfigured()) {
    return sendJson(res, 503, {
      ok: false,
      error: 'No email sender is connected yet. Add BREVO_API_KEY or EMAIL_WEBHOOK_URL in Vercel.',
    });
  }

  const body = await readBody(req);
  const subject = String(body.subject || '').trim();
  const message = String(body.message || '').trim();
  const isTest = Boolean(body.test);

  if (subject.length < 3 || subject.length > 140) {
    return sendJson(res, 400, { ok: false, error: 'Subject must be 3–140 characters.' });
  }
  if (message.length < 10 || message.length > 20000) {
    return sendJson(res, 400, { ok: false, error: 'Message must be 10–20,000 characters.' });
  }

  let recipients = [];
  if (isTest) {
    recipients = [{ email: emailConfig.adminEmail, token: null }];
  } else {
    try {
      recipients = await rest(
        'subscribers?status=eq.confirmed&select=email,token&order=created_at.asc&limit=1000'
      );
    } catch (error) {
      console.error('newsletter audience failed', error);
      return sendJson(res, 500, { ok: false, error: 'Could not load the subscriber list.' });
    }
    recipients = Array.isArray(recipients) ? recipients : [];
  }

  if (!recipients.length) {
    return sendJson(res, 400, {
      ok: false,
      error: 'No confirmed subscribers yet. Confirmation links must be clicked before an address is mailed.',
    });
  }

  const cap = capFor(provider);
  if (recipients.length > cap) {
    return sendJson(res, 400, {
      ok: false,
      error: `This list has ${recipients.length} confirmed people. The current free sender allows ${cap} per send. Split the list or wait for the daily limit to reset.`,
    });
  }

  const bodyHtml = textToHtml(message);
  const failures = [];

  const results = await mapLimit(recipients, CONCURRENCY, async (person) => {
    const unsubPage = person.token
      ? `${emailConfig.siteUrl}/?unsubscribe=${encodeURIComponent(person.token)}`
      : `${emailConfig.siteUrl}/`;
    const unsubApi = person.token
      ? `${emailConfig.siteUrl}/api/unsubscribe?token=${encodeURIComponent(person.token)}`
      : `${emailConfig.siteUrl}/`;
    const html = layout({
      title: subject,
      preheader: message.slice(0, 120),
      bodyHtml,
      unsubscribeUrl: unsubPage,
    });
    const result = await sendEmail({
      to: person.email,
      subject: isTest ? `[TEST] ${subject}` : subject,
      html,
      text: message,
      unsubscribeUrl: unsubApi,
    });
    if (!result.ok) {
      failures.push({ email: person.email.replace(/^(.).*(@.*)$/, '$1***$2'), error: result.error });
    }
    return result.ok;
  });

  const sent = results.filter(Boolean).length;
  const failed = results.length - sent;

  await rest('newsletter_sends', {
    method: 'POST',
    body: {
      subject,
      body: message.slice(0, 20000),
      recipients: recipients.length,
      sent,
      failed,
      test: isTest,
    },
    prefer: 'return=minimal',
  }).catch((error) => {
    console.error('newsletter log failed', error);
  });

  return sendJson(res, 200, {
    ok: sent > 0 && failed === 0,
    sent,
    failed,
    total: recipients.length,
    test: isTest,
    provider,
    errors: failures.slice(0, 3),
    message:
      failed === 0
        ? `Sent ${sent} ${sent === 1 ? 'email' : 'emails'}.`
        : `Sent ${sent}, failed ${failed}. Check the Vercel function logs for provider details.`,
  });
}
