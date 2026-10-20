import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Lightbulb,
  Send,
  Check,
  Loader2,
  AlertCircle,
  MessageSquareHeart,
  MessagesSquare,
  Sparkles,
} from 'lucide-react';
import {
  fetchReviews,
  submitReview,
  fetchSuggestions,
  submitSuggestion,
  type Review,
  type Suggestion,
} from '../lib/supabase';

type Tab = 'reviews' | 'suggestions';

const STATUS_LABEL: Record<Suggestion['status'], string> = {
  new: 'New',
  planned: 'Planned',
  in_progress: 'In progress',
  shipped: 'Shipped',
  declined: 'Not planned',
};

const STATUS_STYLE: Record<Suggestion['status'], string> = {
  new: 'bg-gray-700 text-gray-200',
  planned: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  in_progress: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  shipped: 'bg-green-500/20 text-green-300 border border-green-500/30',
  declined: 'bg-gray-700/60 text-gray-400',
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function Stars({ value, size = 'w-4 h-4' }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const [tab, setTab] = useState<Tab>('reviews');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-10">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 mb-4">
          <MessageSquareHeart className="w-7 h-7 text-purple-300" aria-hidden="true" />
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Reviews &amp; Suggestions
        </h1>
        <p className="text-gray-300 mt-3 max-w-2xl mx-auto">
          Tell us what worked, what broke, or what you want next. Reviews appear after moderation.
          Suggestions are public so you can see what is planned and shipped.
        </p>
      </motion.header>

      <div
        className="flex justify-center gap-2 mb-8"
        role="tablist"
        aria-label="Feedback sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'reviews'}
          onClick={() => setTab('reviews')}
          className={`inline-flex items-center gap-2 px-5 min-h-[44px] rounded-lg font-medium transition-colors ${
            tab === 'reviews'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Star className="w-4 h-4" aria-hidden="true" />
          Reviews
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'suggestions'}
          onClick={() => setTab('suggestions')}
          className={`inline-flex items-center gap-2 px-5 min-h-[44px] rounded-lg font-medium transition-colors ${
            tab === 'suggestions'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Lightbulb className="w-4 h-4" aria-hidden="true" />
          Suggestions
        </button>
      </div>

      {tab === 'reviews' ? <ReviewsPanel /> : <SuggestionsPanel />}
    </div>
  );
}

function ReviewsPanel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    const result = await fetchReviews();
    if (result.data) {
      setReviews(result.data);
      setLoadError('');
    } else {
      setLoadError(result.error || 'Could not load reviews.');
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const average =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    const result = await submitReview(name, rating, message);
    if (result.data) {
      setState('sent');
      setStatus('Thanks! Your review is queued for moderation.');
      setName('');
      setMessage('');
      setRating(5);
    } else {
      setState('error');
      setStatus(result.error || 'Could not send your review.');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 items-start">
      <section aria-labelledby="review-list-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h2 id="review-list-heading" className="text-xl font-bold">
            What people say
          </h2>
          {average && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Stars value={Math.round(Number(average))} />
              <span className="font-semibold text-white">{average}</span>
              <span className="text-gray-500">({reviews.length})</span>
            </div>
          )}
        </div>

        {!loaded && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews…
          </div>
        )}

        {loaded && loadError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            {loadError}{' '}
            <button
              type="button"
              onClick={() => {
                setLoaded(false);
                load();
              }}
              className="underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {loaded && !loadError && reviews.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-600 p-8 text-center text-sm text-gray-400">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-purple-400" aria-hidden="true" />
            No approved reviews yet. Be the first to leave one.
          </div>
        )}

        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-xl bg-gray-800/60 border border-gray-700 p-5"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <Stars value={review.rating} />
              <time className="text-xs text-gray-500" dateTime={review.created_at}>
                {formatDate(review.created_at)}
              </time>
            </div>
            <p className="text-gray-200 text-sm whitespace-pre-line">{review.message}</p>
            <p className="mt-3 text-xs text-purple-300">— {review.name}</p>
          </article>
        ))}
      </section>

      <form
        onSubmit={submit}
        className="rounded-xl bg-gray-800/60 border border-gray-700 p-6 space-y-4"
        noValidate
      >
        <div className="flex items-center gap-2">
          <MessagesSquare className="w-5 h-5 text-purple-400" aria-hidden="true" />
          <h2 className="text-xl font-bold">Leave a review</h2>
        </div>

        <fieldset>
          <legend className="block text-sm text-gray-300 mb-2">Your rating</legend>
          <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                aria-pressed={rating === n}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-700/60"
              >
                <Star
                  className={`w-6 h-6 ${
                    n <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-600'
                  }`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="review-name" className="block text-sm text-gray-300 mb-2">
            Name or handle
          </label>
          <input
            id="review-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="Anonymous"
            className="w-full min-h-[44px] px-4 py-3 rounded-lg bg-gray-900/70 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label htmlFor="review-message" className="block text-sm text-gray-300 mb-2">
            Your experience
          </label>
          <textarea
            id="review-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            maxLength={1500}
            placeholder="The 40 Hz gamma session helped me focus for two hours straight…"
            className="w-full px-4 py-3 rounded-lg bg-gray-900/70 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={state === 'sending'}
          className="inline-flex items-center justify-center gap-2 px-6 min-h-[44px] bg-purple-600 hover:bg-purple-700 disabled:opacity-60 rounded-lg font-semibold transition-colors"
        >
          {state === 'sending' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : state === 'sent' ? (
            <Check className="w-5 h-5" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {state === 'sending' ? 'Sending…' : state === 'sent' ? 'Sent' : 'Submit review'}
        </button>

        {status && (
          <p
            role="status"
            className={`text-sm ${state === 'error' ? 'text-red-400' : 'text-green-400'}`}
          >
            {status}
          </p>
        )}
      </form>
    </div>
  );
}

function SuggestionsPanel() {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    const result = await fetchSuggestions();
    if (result.data) {
      setItems(result.data);
      setLoadError('');
    } else {
      setLoadError(result.error || 'Could not load suggestions.');
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    const result = await submitSuggestion(name, title, details);
    if (result.data) {
      setState('sent');
      setStatus('Idea received. It is now on the public board.');
      setName('');
      setTitle('');
      setDetails('');
      await load();
    } else {
      setState('error');
      setStatus(result.error || 'Could not send your idea.');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 items-start">
      <section aria-labelledby="suggestions-board-heading" className="space-y-3">
        <h2 id="suggestions-board-heading" className="text-xl font-bold mb-1">
          Public idea board
        </h2>

        {!loaded && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading suggestions…
          </div>
        )}

        {loaded && loadError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            {loadError}{' '}
            <button
              type="button"
              onClick={() => {
                setLoaded(false);
                load();
              }}
              className="underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {loaded && !loadError && items.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-600 p-8 text-center text-sm text-gray-400">
            <Lightbulb className="w-6 h-6 mx-auto mb-2 text-purple-400" aria-hidden="true" />
            No ideas yet. Yours will show up immediately.
          </div>
        )}

        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl bg-gray-800/60 border border-gray-700 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-white">{item.title}</h3>
              <span
                className={`shrink-0 text-[11px] uppercase tracking-wide px-2 py-1 rounded-full ${
                  STATUS_STYLE[item.status]
                }`}
              >
                {STATUS_LABEL[item.status]}
              </span>
            </div>
            {item.details && (
              <p className="mt-2 text-sm text-gray-300 whitespace-pre-line">{item.details}</p>
            )}
            <p className="mt-3 text-xs text-gray-500">
              {item.name} · {formatDate(item.created_at)}
            </p>
          </article>
        ))}
      </section>

      <form
        onSubmit={submit}
        className="rounded-xl bg-gray-800/60 border border-gray-700 p-6 space-y-4"
        noValidate
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-purple-400" aria-hidden="true" />
          <h2 className="text-xl font-bold">Suggest a feature</h2>
        </div>

        <div>
          <label htmlFor="suggestion-name" className="block text-sm text-gray-300 mb-2">
            Name or handle
          </label>
          <input
            id="suggestion-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="Anonymous"
            className="w-full min-h-[44px] px-4 py-3 rounded-lg bg-gray-900/70 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label htmlFor="suggestion-title" className="block text-sm text-gray-300 mb-2">
            Short title
          </label>
          <input
            id="suggestion-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={140}
            placeholder="Add a sleep timer to the Frequency Lab"
            className="w-full min-h-[44px] px-4 py-3 rounded-lg bg-gray-900/70 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label htmlFor="suggestion-details" className="block text-sm text-gray-300 mb-2">
            Details (optional)
          </label>
          <textarea
            id="suggestion-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            maxLength={1500}
            placeholder="How would it work? Who does it help?"
            className="w-full px-4 py-3 rounded-lg bg-gray-900/70 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={state === 'sending'}
          className="inline-flex items-center justify-center gap-2 px-6 min-h-[44px] bg-purple-600 hover:bg-purple-700 disabled:opacity-60 rounded-lg font-semibold transition-colors"
        >
          {state === 'sending' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : state === 'sent' ? (
            <Check className="w-5 h-5" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {state === 'sending' ? 'Sending…' : state === 'sent' ? 'Sent' : 'Post idea'}
        </button>

        {status && (
          <p
            role="status"
            className={`text-sm ${state === 'error' ? 'text-red-400' : 'text-green-400'}`}
          >
            {status}
          </p>
        )}
      </form>
    </div>
  );
}
