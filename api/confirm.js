import { readBody, rest, sendJson } from '../lib/supabaseAdmin.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** POST /api/confirm { token } — called by the site when the visitor clicks Confirm. */
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
  const token = String(body.token || '').trim();
  if (!UUID_RE.test(token)) {
    return sendJson(res, 400, { ok: false, error: 'That confirmation link is not valid.' });
  }

  try {
    const rows = await rest(
      `subscribers?token=eq.${encodeURIComponent(token)}&select=id,status,email&limit=1`
    );
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) {
      return sendJson(res, 404, {
        ok: false,
        error: 'This link has expired or was already used. Request a new one from the newsletter form.',
      });
    }
    if (row.status === 'confirmed') {
      return sendJson(res, 200, { ok: true, already: true, message: 'Subscription already confirmed.' });
    }

    await rest(`subscribers?id=eq.${encodeURIComponent(row.id)}`, {
      method: 'PATCH',
      body: { status: 'confirmed', confirmed_at: new Date().toISOString() },
      prefer: 'return=minimal',
    });

    return sendJson(res, 200, {
      ok: true,
      message: 'Subscription confirmed. You will get the next lab drop by email.',
    });
  } catch (error) {
    console.error('confirm failed', error);
    return sendJson(res, 500, { ok: false, error: 'Could not confirm right now. Please try again.' });
  }
}
