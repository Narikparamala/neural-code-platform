import { supabase } from './supabase';
import type { Profile } from './auth';

export type LabId = 'rate' | 'place' | 'frequency' | 'game' | 'daily';

export const LAB_LABEL: Record<string, string> = {
  rate: 'Rate Lab',
  place: 'Place Lab',
  frequency: 'Frequency Lab',
  game: 'Game Lab',
  daily: 'Daily Signal',
};

export type Preset = {
  id: string;
  owner_id: string;
  lab: LabId;
  title: string;
  description: string | null;
  config: any;
  is_public: boolean;
  plays: number;
  rating_sum: number;
  rating_count: number;
  created_at: string;
  profiles?: Pick<Profile, 'handle' | 'display_name' | 'avatar_url'> | null;
};

export type PresetReview = {
  id: string;
  preset_id: string;
  user_id: string;
  rating: number;
  body: string | null;
  created_at: string;
  profiles?: Pick<Profile, 'handle' | 'display_name' | 'avatar_url'> | null;
};

export type SessionRow = {
  id: string;
  user_id: string;
  lab: string;
  preset_id: string | null;
  duration_seconds: number;
  details: any;
  created_at: string;
};

export type Circle = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: 'public' | 'private';
  invite_code: string;
  created_at: string;
  circle_members?: { count: number }[];
};

export type CircleMember = {
  circle_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  last_read_at: string;
  profiles?: Pick<Profile, 'handle' | 'display_name' | 'avatar_url'> | null;
};

export type CircleMessage = {
  id: string;
  circle_id: string;
  user_id: string;
  body: string | null;
  preset_id: string | null;
  created_at: string;
  profiles?: Pick<Profile, 'handle' | 'display_name' | 'avatar_url'> | null;
  presets?: { id: string; title: string; lab: string } | null;
};

type Result<T> = { data: T | null; error: string | null };

function fail(error: any): string {
  if (!error) return 'Something went wrong. Please try again.';
  if (error.code === '23505') return 'That is already taken. Try another value.';
  if (error.message?.includes('JWT')) return 'Your session expired. Sign in again.';
  if (error.message?.includes('Failed to fetch')) return 'Network error. Check your connection.';
  return error.message || 'Something went wrong. Please try again.';
}

const PRESET_SELECT =
  'id, owner_id, lab, title, description, config, is_public, plays, rating_sum, rating_count, created_at, profiles:owner_id(handle, display_name, avatar_url)';

// ---------------------------------------------------------------------------
// presets
// ---------------------------------------------------------------------------
export async function fetchPresets(lab?: LabId | 'all'): Promise<Result<Preset[]>> {
  let query = supabase
    .from('presets')
    .select(PRESET_SELECT)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(100);
  if (lab && lab !== 'all') query = query.eq('lab', lab);
  const { data, error } = await query;
  if (error) return { data: null, error: fail(error) };
  return { data: (data as unknown as Preset[]) ?? [], error: null };
}

export async function fetchPreset(id: string): Promise<Result<Preset>> {
  const { data, error } = await supabase.from('presets').select(PRESET_SELECT).eq('id', id).maybeSingle();
  if (error) return { data: null, error: fail(error) };
  return { data: (data as unknown as Preset) || null, error: null };
}

export async function fetchMyPresets(userId: string): Promise<Result<Preset[]>> {
  const { data, error } = await supabase
    .from('presets')
    .select(PRESET_SELECT)
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  if (error) return { data: null, error: fail(error) };
  return { data: (data as unknown as Preset[]) ?? [], error: null };
}

export type NewPreset = {
  ownerId: string;
  lab: LabId;
  title: string;
  description?: string;
  config: any;
  isPublic: boolean;
};

export async function createPreset(input: NewPreset): Promise<Result<Preset>> {
  const title = input.title.trim();
  if (title.length < 3) return { data: null, error: 'Give the preset a title (3+ characters).' };
  if (!input.config || typeof input.config !== 'object') {
    return { data: null, error: 'This lab did not provide a configuration to save.' };
  }
  const { data, error } = await supabase
    .from('presets')
    .insert({
      owner_id: input.ownerId,
      lab: input.lab,
      title: title.slice(0, 90),
      description: input.description?.trim().slice(0, 400) || null,
      config: input.config,
      is_public: input.isPublic,
    })
    .select(PRESET_SELECT)
    .single();
  if (error) return { data: null, error: fail(error) };
  return { data: data as unknown as Preset, error: null };
}

export async function deletePreset(id: string): Promise<Result<true>> {
  const { error } = await supabase.from('presets').delete().eq('id', id);
  if (error) return { data: null, error: fail(error) };
  return { data: true, error: null };
}

export async function updatePreset(id: string, patch: Partial<Pick<Preset, 'title' | 'description' | 'is_public'>>) {
  const { error } = await supabase.from('presets').update(patch).eq('id', id);
  if (error) return { data: null, error: fail(error) };
  return { data: true, error: null };
}

export async function countPresetPlay(id: string) {
  await supabase.rpc('increment_preset_plays', { p_preset_id: id });
}

// ---------------------------------------------------------------------------
// reviews + likes
// ---------------------------------------------------------------------------
export async function fetchPresetReviews(presetId: string): Promise<Result<PresetReview[]>> {
  const { data, error } = await supabase
    .from('preset_reviews')
    .select(
      'id, preset_id, user_id, rating, body, created_at, profiles:user_id(handle, display_name, avatar_url)'
    )
    .eq('preset_id', presetId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return { data: null, error: fail(error) };
  return { data: (data as unknown as PresetReview[]) ?? [], error: null };
}

export async function savePresetReview(
  presetId: string,
  userId: string,
  rating: number,
  body: string
): Promise<Result<true>> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { data: null, error: 'Pick a rating from 1 to 5 stars.' };
  }
  const { error } = await supabase.from('preset_reviews').upsert(
    {
      preset_id: presetId,
      user_id: userId,
      rating,
      body: body.trim().slice(0, 800) || null,
    },
    { onConflict: 'preset_id,user_id' }
  );
  if (error) return { data: null, error: fail(error) };
  return { data: true, error: null };
}

export async function fetchMyLikes(userId: string): Promise<Result<string[]>> {
  const { data, error } = await supabase.from('preset_likes').select('preset_id').eq('user_id', userId);
  if (error) return { data: null, error: fail(error) };
  return { data: (data || []).map((row: any) => row.preset_id), error: null };
}

export async function setPresetLike(presetId: string, userId: string, liked: boolean): Promise<Result<true>> {
  if (liked) {
    const { error } = await supabase.from('preset_likes').insert({ preset_id: presetId, user_id: userId });
    if (error && error.code !== '23505') return { data: null, error: fail(error) };
  } else {
    const { error } = await supabase
      .from('preset_likes')
      .delete()
      .eq('preset_id', presetId)
      .eq('user_id', userId);
    if (error) return { data: null, error: fail(error) };
  }
  return { data: true, error: null };
}

export async function fetchLikeCounts(presetIds: string[]): Promise<Record<string, number>> {
  if (!presetIds.length) return {};
  const { data } = await supabase.from('preset_likes').select('preset_id').in('preset_id', presetIds);
  const counts: Record<string, number> = {};
  (data || []).forEach((row: any) => {
    counts[row.preset_id] = (counts[row.preset_id] || 0) + 1;
  });
  return counts;
}

// ---------------------------------------------------------------------------
// sessions + streaks
// ---------------------------------------------------------------------------
export async function recordSession(input: {
  lab: string;
  seconds: number;
  details?: any;
  presetId?: string | null;
}) {
  return supabase.rpc('record_session', {
    p_lab: input.lab,
    p_duration_seconds: Math.max(0, Math.round(input.seconds)),
    p_details: input.details || {},
    p_preset_id: input.presetId || null,
  });
}

export async function fetchSessions(userId: string, limit = 30): Promise<Result<SessionRow[]>> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return { data: null, error: fail(error) };
  return { data: (data as SessionRow[]) ?? [], error: null };
}

// ---------------------------------------------------------------------------
// circles
// ---------------------------------------------------------------------------
export async function fetchCircles(): Promise<Result<Circle[]>> {
  const { data, error } = await supabase
    .from('circles')
    .select('*, circle_members(count)')
    .order('created_at', { ascending: false })
    .limit(60);
  if (error) return { data: null, error: fail(error) };
  return { data: (data as unknown as Circle[]) ?? [], error: null };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export async function createCircle(input: {
  ownerId: string;
  name: string;
  description: string;
  visibility: 'public' | 'private';
}): Promise<Result<Circle>> {
  const name = input.name.trim();
  if (name.length < 3) return { data: null, error: 'Circle names need at least 3 characters.' };
  const base = slugify(name) || 'circle';
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await supabase
    .from('circles')
    .insert({
      owner_id: input.ownerId,
      name: name.slice(0, 60),
      slug,
      description: input.description.trim().slice(0, 400) || null,
      visibility: input.visibility,
    })
    .select('*')
    .single();
  if (error) return { data: null, error: fail(error) };
  return { data: data as Circle, error: null };
}

export async function joinCircle(code: string): Promise<Result<{ id: string; name: string; slug: string }>> {
  const clean = code.trim();
  if (clean.length < 4) return { data: null, error: 'Paste the invite code or link.' };
  const { data, error } = await supabase.rpc('join_circle', { p_code: clean });
  if (error) return { data: null, error: fail(error) };
  return { data: data as any, error: null };
}

export async function leaveCircle(circleId: string, userId: string): Promise<Result<true>> {
  const { error } = await supabase
    .from('circle_members')
    .delete()
    .eq('circle_id', circleId)
    .eq('user_id', userId);
  if (error) return { data: null, error: fail(error) };
  return { data: true, error: null };
}

export async function deleteCircle(circleId: string): Promise<Result<true>> {
  const { error } = await supabase.from('circles').delete().eq('id', circleId);
  if (error) return { data: null, error: fail(error) };
  return { data: true, error: null };
}

export async function fetchCircleMembers(circleId: string): Promise<Result<CircleMember[]>> {
  const { data, error } = await supabase
    .from('circle_members')
    .select('circle_id, user_id, role, joined_at, last_read_at, profiles:user_id(handle, display_name, avatar_url)')
    .eq('circle_id', circleId)
    .order('joined_at', { ascending: true });
  if (error) return { data: null, error: fail(error) };
  return { data: (data as unknown as CircleMember[]) ?? [], error: null };
}

export async function fetchCircleMessages(circleId: string, limit = 80): Promise<Result<CircleMessage[]>> {
  const { data, error } = await supabase
    .from('circle_messages')
    .select(
      'id, circle_id, user_id, body, preset_id, created_at, profiles:user_id(handle, display_name, avatar_url), presets:preset_id(id, title, lab)'
    )
    .eq('circle_id', circleId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) return { data: null, error: fail(error) };
  return { data: (data as unknown as CircleMessage[]) ?? [], error: null };
}

export async function sendCircleMessage(input: {
  circleId: string;
  userId: string;
  body: string;
  presetId?: string | null;
}): Promise<Result<true>> {
  const body = input.body.trim().slice(0, 2000);
  if (!body && !input.presetId) return { data: null, error: 'Write a message or attach a preset.' };
  const { error } = await supabase.from('circle_messages').insert({
    circle_id: input.circleId,
    user_id: input.userId,
    body: body || null,
    preset_id: input.presetId || null,
  });
  if (error) return { data: null, error: fail(error) };
  return { data: true, error: null };
}

export async function markCircleRead(circleId: string) {
  await supabase.rpc('mark_circle_read', { p_circle_id: circleId });
}

// ---------------------------------------------------------------------------
// handing a preset from the library to a lab
// ---------------------------------------------------------------------------
const PENDING_KEY = 'cs0:pending-preset';

export function stashPresetForLab(lab: string, preset: Pick<Preset, 'id' | 'title' | 'config'>) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ lab, id: preset.id, title: preset.title, config: preset.config }));
  } catch {
    /* storage can be blocked */
  }
}

export function consumePresetForLab(lab: string): { id: string; title: string; config: any } | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.lab !== lab) return null;
    sessionStorage.removeItem(PENDING_KEY);
    return parsed;
  } catch {
    return null;
  }
}
