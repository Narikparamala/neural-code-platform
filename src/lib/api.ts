/**
 * Base URL for the serverless email API.
 *
 * On Vercel the API lives on the same origin (`/api/...`). The optional GitHub
 * Pages mirror is a static build, so it points at the Vercel deployment.
 */
export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')
    ? 'https://neural-code-platform.vercel.app'
    : '');

export type ApiResult<T> = { data: T | null; error: string | null };

export async function apiPost<T>(
  path: string,
  body: unknown,
  token?: string
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload || payload.ok === false) {
      return {
        data: null,
        error:
          (payload && payload.error) ||
          (res.status === 404
            ? 'Email service is not deployed on this copy of the site yet.'
            : 'Request failed. Please try again.'),
      };
    }
    return { data: payload as T, error: null };
  } catch {
    return { data: null, error: 'Network error. Check your connection and try again.' };
  }
}
