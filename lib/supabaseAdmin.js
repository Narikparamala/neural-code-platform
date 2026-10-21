/**
 * Server-side Supabase helpers. Uses the service_role key, so it must never be
 * imported into browser code. Every route that calls these checks ownership
 * first (see api/newsletter.js).
 */

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://jdwiggwqsyeopcgrovjm.supabase.co').replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkd2lnZ3dxc3llb3BjZ3JvdmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MDI0MzUsImV4cCI6MjEwODA3ODQzNX0.uxjWHFzD79enmWoJHsWaAAP_HWYhd2MHyReZyoNlLog';

export const config = { url: SUPABASE_URL, adminEmail: process.env.ADMIN_EMAIL || 'narikparamala@gmail.com' };

export function hasServiceKey() {
  return Boolean(SERVICE_KEY);
}

/** Low-level request against the REST API with the service_role key. */
export async function rest(path, { method = 'GET', body, headers = {}, prefer } = {}) {
  if (!SERVICE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing.');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'content-type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const raw = await res.text();
  let data = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }
  if (!res.ok) {
    const message = data && data.message ? data.message : raw.slice(0, 300);
    throw new Error(`Supabase ${res.status}: ${message}`);
  }
  return data;
}

/** Look up the caller from their Supabase access token. */
export async function getUserFromToken(token) {
  if (!token) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const user = await res.json().catch(() => null);
  return user && user.email ? user : null;
}

export function isAdmin(user) {
  return Boolean(user && (user.email || '').toLowerCase() === config.adminEmail.toLowerCase());
}

/** Parse a JSON body whether Vercel already parsed it or not. */
export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(payload));
}

export function redirect(res, location, status = 303) {
  res.statusCode = status;
  res.setHeader('location', location);
  res.end();
}
