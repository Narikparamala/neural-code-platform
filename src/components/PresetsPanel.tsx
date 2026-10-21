import React, { useEffect, useMemo, useState } from 'react';
import {
  Star,
  Play,
  Heart,
  MessageSquare,
  Loader2,
  X,
  Headphones,
  Users,
  Check,
} from 'lucide-react';
import { useAuth, initials } from '../lib/auth';
import {
  LAB_LABEL,
  countPresetPlay,
  fetchLikeCounts,
  fetchMyLikes,
  fetchPreset,
  fetchPresetReviews,
  fetchPresets,
  savePresetReview,
  setPresetLike,
  type LabId,
  type Preset,
  type PresetReview,
} from '../lib/social';

type Sort = 'new' | 'top' | 'played';

export function Stars({ value, count }: { value: number; count?: number }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${value.toFixed(1)} out of 5`}>
      <span className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`w-3.5 h-3.5 ${n <= rounded ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`}
          />
        ))}
      </span>
      <span className="text-xs text-gray-400">
        {value > 0 ? value.toFixed(1) : 'New'}
        {typeof count === 'number' ? ` (${count})` : ''}
      </span>
    </span>
  );
}

export default function PresetsPanel({
  onUsePreset,
  onOpenProfile,
}: {
  onUsePreset: (preset: Preset) => void;
  onOpenProfile: () => void;
}) {
  const { user, openAuth } = useAuth();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lab, setLab] = useState<LabId | 'all'>('all');
  const [sort, setSort] = useState<Sort>('new');
  const [likes, setLikes] = useState<string[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [reviewTarget, setReviewTarget] = useState<Preset | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    const result = await fetchPresets(lab);
    if (result.error) setError(result.error);
    else setPresets(result.data || []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lab]);

  useEffect(() => {
    if (!user) {
      setLikes([]);
      return;
    }
    fetchMyLikes(user.id).then((result) => setLikes(result.data || []));
  }, [user]);

  useEffect(() => {
    const ids = presets.map((preset) => preset.id);
    if (!ids.length) return;
    fetchLikeCounts(ids).then(setLikeCounts);
  }, [presets]);

  const sorted = useMemo(() => {
    const list = [...presets];
    if (sort === 'new') return list;
    if (sort === 'played') return list.sort((a, b) => b.plays - a.plays);
    return list.sort((a, b) => {
      const avgA = a.rating_count ? a.rating_sum / a.rating_count : 0;
      const avgB = b.rating_count ? b.rating_sum / b.rating_count : 0;
      return avgB * Math.log2(b.rating_count + 2) - avgA * Math.log2(a.rating_count + 2);
    });
  }, [presets, sort]);

  const use = (preset: Preset) => {
    void countPresetPlay(preset.id);
    setPresets((current) =>
      current.map((item) => (item.id === preset.id ? { ...item, plays: item.plays + 1 } : item))
    );
    onUsePreset(preset);
  };

  const toggleLike = async (preset: Preset) => {
    if (!user) {
      openAuth('signup');
      return;
    }
    const liked = likes.includes(preset.id);
    setLikes((current) => (liked ? current.filter((id) => id !== preset.id) : [...current, preset.id]));
    setLikeCounts((current) => ({
      ...current,
      [preset.id]: Math.max(0, (current[preset.id] || 0) + (liked ? -1 : 1)),
    }));
    await setPresetLike(preset.id, user.id, !liked);
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter presets by lab">
          {(['all', 'rate', 'place', 'frequency', 'game', 'daily'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setLab(id)}
              aria-pressed={lab === id}
              className={`px-3 min-h-[38px] rounded-full text-sm font-semibold ${
                lab === id ? 'bg-purple-600' : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}
            >
              {id === 'all' ? 'All labs' : LAB_LABEL[id]}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-400">
          Sort
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
            className="min-h-[38px] px-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
          >
            <option value="new">Newest</option>
            <option value="top">Top rated</option>
            <option value="played">Most played</option>
          </select>
        </label>
      </div>

      {!user && (
        <div className="mb-5 rounded-xl border border-purple-500/25 bg-purple-900/15 p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-300">
            Browse freely. Sign in to publish presets, review them, or join a circle.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openAuth('signup')}
              className="px-4 min-h-[40px] rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-semibold"
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => openAuth('signin')}
              className="px-4 min-h-[40px] rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold"
            >
              Sign in
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-400 inline-flex items-center justify-center gap-2 w-full">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading presets…
        </div>
      ) : error ? (
        <p className="rounded-lg bg-red-900/25 p-4 text-sm text-red-300">{error}</p>
      ) : sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-700 p-10 text-center">
          <Headphones className="w-10 h-10 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold">No public presets yet</h3>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Open a lab, tune it, then press “Save as preset”. Your setup appears here for everyone.
          </p>
          {user && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="px-4 min-h-[42px] rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold"
            >
              See your presets
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((preset) => {
            const avg = preset.rating_count ? preset.rating_sum / preset.rating_count : 0;
            const liked = likes.includes(preset.id);
            const author = preset.profiles?.display_name || 'Listener';
            return (
              <article
                key={preset.id}
                className="rounded-xl border border-gray-700 bg-gray-800/45 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[11px] font-bold tracking-wide uppercase px-2 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                    {LAB_LABEL[preset.lab] || preset.lab}
                  </span>
                  <button
                    type="button"
                    onClick={() => void toggleLike(preset)}
                    aria-pressed={liked}
                    aria-label={liked ? 'Remove like' : 'Like preset'}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      liked ? 'text-pink-300 bg-pink-500/15' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-pink-400' : ''}`} />
                    {likeCounts[preset.id] || 0}
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-lg leading-tight">{preset.title}</h3>
                  {preset.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{preset.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-gray-950">
                    {initials(author)}
                  </span>
                  <span className="truncate">@{preset.profiles?.handle || 'listener'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(preset.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Stars value={avg} count={preset.rating_count} />
                  <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                    <Users className="w-3 h-3" /> {preset.plays} plays
                  </span>
                </div>

                <div className="flex gap-2 mt-auto pt-1">
                  <button
                    type="button"
                    onClick={() => use(preset)}
                    className="flex-1 inline-flex items-center justify-center gap-2 min-h-[42px] rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-semibold"
                  >
                    <Play className="w-4 h-4" /> Use in lab
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewTarget(preset)}
                    className="inline-flex items-center justify-center gap-1 px-3 min-h-[42px] rounded-lg bg-white/10 hover:bg-white/15 text-sm"
                    aria-label={`Reviews for ${preset.title}`}
                  >
                    <MessageSquare className="w-4 h-4" /> {preset.rating_count}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {reviewTarget && (
        <ReviewModal
          preset={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onChanged={async () => {
            const fresh = await fetchPreset(reviewTarget.id);
            if (fresh.data) {
              setPresets((current) =>
                current.map((item) => (item.id === fresh.data!.id ? { ...item, ...fresh.data! } : item))
              );
              setReviewTarget((current) => (current ? { ...current, ...fresh.data! } : current));
            }
          }}
        />
      )}
    </div>
  );
}

function ReviewModal({
  preset,
  onClose,
  onChanged,
}: {
  preset: Preset;
  onClose: () => void;
  onChanged: () => void | Promise<void>;
}) {
  const { user, profile, openAuth } = useAuth();
  const [reviews, setReviews] = useState<PresetReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    const result = await fetchPresetReviews(preset.id);
    setReviews(result.data || []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset.id]);

  useEffect(() => {
    if (!user) return;
    const mine = reviews.find((review) => review.user_id === user.id);
    if (mine) {
      setRating(mine.rating);
      setBody(mine.body || '');
    }
  }, [reviews, user]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      openAuth('signup');
      return;
    }
    setBusy(true);
    setError('');
    const result = await savePresetReview(preset.id, user.id, rating, body);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
    await load();
    await onChanged();
    window.setTimeout(() => setSaved(false), 1500);
  };

  const avg = preset.rating_count ? preset.rating_sum / preset.rating_count : 0;

  return (
    <div
      className="fixed inset-0 z-[71] flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Reviews for ${preset.title}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900 p-5 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className="text-[11px] uppercase tracking-wide text-purple-300">
              {LAB_LABEL[preset.lab] || preset.lab}
            </span>
            <h2 className="text-xl font-bold mt-1">{preset.title}</h2>
            <div className="mt-1">
              <Stars value={avg} count={preset.rating_count} />
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/10" aria-label="Close reviews">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="rounded-xl bg-gray-800/60 p-4 mb-5">
          <p className="text-sm font-semibold mb-2">
            {user ? 'Rate this preset' : 'Sign in to rate this preset'}
          </p>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                aria-pressed={rating === n}
                className="p-1.5 rounded-lg hover:bg-white/10"
              >
                <Star
                  className={`w-6 h-6 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={2}
            maxLength={800}
            placeholder="How did it sound? Any headphone or volume notes?"
            className="w-full px-3 py-2 rounded-lg bg-gray-950/70 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 min-h-[40px] rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-semibold disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Star className="w-4 h-4" />}
              {saved ? 'Saved' : user ? 'Submit review' : 'Sign in'}
            </button>
            {profile && <span className="text-xs text-gray-500">Posting as @{profile.handle}</span>}
          </div>
        </form>

        {loading ? (
          <div className="py-8 text-center text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin inline" /> Loading reviews…
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No reviews yet. Be the first to describe it.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((review) => {
              const author = review.profiles?.display_name || 'Listener';
              return (
                <li key={review.id} className="rounded-lg bg-gray-800/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-gray-950">
                      {initials(author)}
                    </span>
                    <span className="text-sm font-semibold">{author}</span>
                    <span className="text-xs text-gray-500">@{review.profiles?.handle || 'listener'}</span>
                    <span className="ml-auto">
                      <Stars value={review.rating} />
                    </span>
                  </div>
                  {review.body && <p className="text-sm text-gray-300">{review.body}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
