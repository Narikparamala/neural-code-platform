import { readBody, rest, sendJson } from '../lib/supabaseAdmin.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function tokenFrom(req, body) {
  let token = body && body.token ? String(body.token) : '';
  if (!token) {
    try {
      const url = new URL(req.url, 'https://neural-code-platform.vercel.app');
      token = url.searchParams.get('token') || '';
    } catch {
      token = '';
    }
  }
  return token.trim();
}

/**
 * POST /api/unsubscribe { token }  (site)
 * POST /api/unsubscribe?token=…     (mail client one-click List-Unsubscribe-Post)
 */
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
  const token = tokenFrom(req, body);
  if (!UUID_RE.test(token)) {
    return sendJson(res, 400, { ok: false, error: 'That unsubscribe link is not valid.' });
  }

  try {
    const rows = await rest(
      `subscribers?token=eq.${encodeURIComponent(token)}&select=id,status&limit=1`
    );
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) {
      return sendJson(res, 200, {
        ok: true,
        already: true,
        message: 'This address is not on the list. Nothing else will be sent.',
      });
    }

    await rest(`subscribers?id=eq.${encodeURIComponent(row.id)}`, {
      method: 'PATCH',
      body: { status: 'unsubscribed' },
      prefer: 'return=minimal',
    });

    return sendJson(res, 200, {
      ok: true,
      message: 'You are unsubscribed. No further newsletter emails will be sent.',
    });
  } catch (error) {
    console.error('unsubscribe failed', error);
    return sendJson(res, 500, { ok: false, error: 'Could not unsubscribe right now. Please try again.' });
  }
}
