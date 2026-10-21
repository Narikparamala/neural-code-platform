import { createClient } from '@supabase/supabase-js';

/**
 * Public Supabase config.
 *
 * The URL and anon (publishable) key are safe to ship in a browser bundle:
 * every table is protected by Row Level Security, so anonymous visitors can
 * only insert newsletter signups / stories / reviews / suggestions and read
 * content an admin has approved. Override with env vars if the project moves.
 */
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://jdwiggwqsyeopcgrovjm.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkd2lnZ3dxc3llb3BjZ3JvdmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MDI0MzUsImV4cCI6MjEwODA3ODQzNX0.uxjWHFzD79enmWoJHsWaAAP_HWYhd2MHyReZyoNlLog';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Story = {
  id: string;
  name: string;
  body: string;
  created_at: string;
};

export type Review = {
  id: string;
  name: string;
  rating: number;
  message: string;
  created_at: string;
};

export type Suggestion = {
  id: string;
  name: string;
  title: string;
  details: string | null;
  status: 'new' | 'planned' | 'in_progress' | 'shipped' | 'declined';
  created_at: string;
};

export type Result<T> = { data: T | null; error: string | null };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function friendly(error: { code?: string; message?: string } | null): string {
  if (!error) return 'Something went wrong. Please try again.';
  if (error.code === '23505') return 'duplicate';
  if (error.code === '23514') return 'Please check the length of what you wrote.';
  if (error.message?.includes('Failed to fetch')) {
    return 'Network error. Check your connection and try again.';
  }
  return error.message || 'Something went wrong. Please try again.';
}

/** Add an email to the newsletter list. A repeat signup counts as success. */
export async function subscribeEmail(email: string, source = 'site'): Promise<Result<true>> {
  const clean = email.trim().toLowerCase();
  if (!emailPattern.test(clean)) {
    return { data: null, error: 'Please enter a valid email address.' };
  }

  const { error } = await supabase.from('subscribers').insert({ email: clean, source });
  if (error && error.code !== '23505') {
    return { data: null, error: friendly(error) };
  }
  return { data: true, error: null };
}

export async function fetchStories(limit = 30): Promise<Result<Story[]>> {
  const { data, error } = await supabase
    .from('stories')
    .select('id, name, body, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { data: null, error: friendly(error) };
  return { data: (data as Story[]) ?? [], error: null };
}

export async function submitStory(name: string, body: string): Promise<Result<true>> {
  const text = body.trim();
  if (text.length < 10) {
    return { data: null, error: 'Tell us at least a sentence or two.' };
  }

  const { error } = await supabase.from('stories').insert({
    name: name.trim().slice(0, 60) || 'Anonymous',
    body: text.slice(0, 2000),
  });

  if (error) return { data: null, error: friendly(error) };
  return { data: true, error: null };
}

export async function fetchReviews(limit = 40): Promise<Result<Review[]>> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, name, rating, message, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { data: null, error: friendly(error) };
  return { data: (data as Review[]) ?? [], error: null };
}

export async function submitReview(
  name: string,
  rating: number,
  message: string
): Promise<Result<true>> {
  const text = message.trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { data: null, error: 'Pick a rating from 1 to 5 stars.' };
  }
  if (text.length < 5) {
    return { data: null, error: 'Add a few words about your experience.' };
  }

  const { error } = await supabase.from('reviews').insert({
    name: name.trim().slice(0, 60) || 'Anonymous',
    rating,
    message: text.slice(0, 1500),
  });

  if (error) return { data: null, error: friendly(error) };
  return { data: true, error: null };
}

export async function fetchSuggestions(limit = 40): Promise<Result<Suggestion[]>> {
  const { data, error } = await supabase
    .from('suggestions')
    .select('id, name, title, details, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { data: null, error: friendly(error) };
  return { data: (data as Suggestion[]) ?? [], error: null };
}

export async function submitSuggestion(
  name: string,
  title: string,
  details: string
): Promise<Result<true>> {
  const cleanTitle = title.trim();
  if (cleanTitle.length < 3) {
    return { data: null, error: 'Give your idea a short title.' };
  }

  const { error } = await supabase.from('suggestions').insert({
    name: name.trim().slice(0, 60) || 'Anonymous',
    title: cleanTitle.slice(0, 140),
    details: details.trim().slice(0, 1500) || null,
  });

  if (error) return { data: null, error: friendly(error) };
  return { data: true, error: null };
}

export type SponsorLead = {
  name: string;
  email: string;
  organisation?: string;
  package: string;
  budget?: string;
  message: string;
};

export async function submitSponsorLead(lead: SponsorLead): Promise<Result<true>> {
  const name = lead.name.trim();
  const email = lead.email.trim().toLowerCase();
  const message = lead.message.trim();

  if (name.length < 2) return { data: null, error: 'Add your name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { data: null, error: 'Add a valid email address.' };
  if (message.length < 10) return { data: null, error: 'Tell us a little about what you have in mind.' };

  const { error } = await supabase.from('sponsor_leads').insert({
    name: name.slice(0, 80),
    email: email.slice(0, 160),
    organisation: (lead.organisation || '').trim().slice(0, 120) || null,
    package: lead.package || 'community',
    budget: (lead.budget || '').trim().slice(0, 60) || null,
    message: message.slice(0, 2000),
    status: 'new',
  });

  if (error) return { data: null, error: friendly(error) };
  return { data: true, error: null };
}
