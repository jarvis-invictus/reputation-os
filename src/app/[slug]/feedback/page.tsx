'use client';

import { useState, useEffect, useCallback } from 'react';
import { likedItemsByType, type Business, type BusinessType } from '@/lib/supabase/types';

interface Props {
  params: Promise<{ slug: string }>;
}

type FeedbackState = {
  step: 'rating' | 'liked' | 'result' | 'negative';
  rating: number | null;
  likedItems: string[];
  contactName: string;
  comment: string;
  loading: boolean;
  generatedReview: string | null;
  feedbackId: string | null;
  business: Business | null;
  error: string | null;
};

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

const LIKED_ITEM_LABELS: Record<string, string> = {
  staff: 'Staff',
  treatment: 'Treatment',
  cleanliness: 'Cleanliness',
  price: 'Price',
  ambiance: 'Ambiance',
  speed: 'Speed',
  food: 'Food',
  service: 'Service',
  product_quality: 'Product Quality',
  variety: 'Variety',
  result: 'Results',
  quality: 'Quality',
  convenience: 'Convenience',
};

export default function FeedbackPage({ params }: Props) {
  const [slug, setSlug] = useState<string>('');
  const [state, setState] = useState<FeedbackState>({
    step: 'rating',
    rating: null,
    likedItems: [],
    contactName: '',
    comment: '',
    loading: false,
    generatedReview: null,
    feedbackId: null,
    business: null,
    error: null,
  });

  useEffect(() => {
    params.then(({ slug: s }) => setSlug(s));
  }, [params]);

  // Fetch business on mount
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/business/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.business) {
          setState((prev) => ({ ...prev, business: data.business }));
        }
      })
      .catch(console.error);
  }, [slug]);

  const handleRatingSelect = useCallback((rating: number) => {
    setState((prev) => ({ ...prev, rating, step: rating >= 4 ? 'liked' : 'negative' }));
  }, []);

  const handleLikedItemToggle = useCallback((item: string) => {
    setState((prev) => ({
      ...prev,
      likedItems: prev.likedItems.includes(item)
        ? prev.likedItems.filter((i) => i !== item)
        : [...prev.likedItems, item],
    }));
  }, []);

  const handleSubmitHighRating = useCallback(async () => {
    if (!state.rating || !state.business) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: state.business!.id,
          rating: state.rating,
          liked_items: state.likedItems,
          contact_name: state.contactName || 'Guest',
          comment: state.comment,
          channel: 'link',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit feedback');

      setState((prev) => ({
        ...prev,
        loading: false,
        step: 'result',
        generatedReview: data.generated_review || data.fallback_review,
        feedbackId: data.id,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Something went wrong',
      }));
    }
  }, [state.rating, state.business, state.likedItems, state.contactName, state.comment]);

  const handleSubmitNegative = useCallback(async () => {
    if (!state.rating || !state.business) return;
    setState((prev) => ({ ...prev, loading: true }));

    try {
      await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: state.business!.id,
          rating: state.rating,
          liked_items: [],
          contact_name: state.contactName || 'Guest',
          comment: state.comment,
          channel: 'link',
        }),
      });

      setState((prev) => ({ ...prev, loading: false, step: 'negative' }));
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [state.rating, state.business, state.contactName, state.comment]);

  const handleCopyReview = useCallback(async () => {
    if (!state.generatedReview) return;
    try {
      await navigator.clipboard.writeText(state.generatedReview);
      if (state.feedbackId) {
        fetch(`/api/feedback/${state.feedbackId}/copy`, { method: 'POST' });
      }
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = state.generatedReview;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }, [state.generatedReview, state.feedbackId]);

  const handleWhatsAppShare = useCallback(() => {
    if (!state.generatedReview || !state.business) return;
    const mapsUrl = state.business.google_maps_url || 'https://www.google.com/maps';
    const text = encodeURIComponent(`${state.generatedReview}\n\n${mapsUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, [state.generatedReview, state.business]);

  const accentColor = state.business?.accent_color || '#00C48C';
  const businessType = (state.business?.type || 'other') as BusinessType;
  const availableLikedItems = likedItemsByType[businessType] || likedItemsByType.other;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #f8fffe 0%, #f0fdf9 100%)' }}
    >
      {/* Business Header */}
      <div className="w-full max-w-md text-center mb-8 animate-fade-in-up">
        {state.business?.logo_url ? (
          <img
            src={state.business.logo_url}
            alt={state.business.name}
            className="w-16 h-16 rounded-2xl mx-auto mb-3 object-cover shadow-md"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold shadow-md"
            style={{ background: accentColor }}
          >
            {state.business?.name?.charAt(0) || '?'}
          </div>
        )}
        <h1 className="text-xl font-bold text-gray-900">{state.business?.name || 'Loading...'}</h1>
        {state.business?.tagline && (
          <p className="text-sm text-gray-500 mt-1">{state.business.tagline}</p>
        )}
      </div>

      {/* Feedback Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8">
        {/* STEP 1: Rating */}
        {state.step === 'rating' && (
          <div className="animate-fade-in-up">
            <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
              How was your experience?
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">Tap a star to rate</p>

            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingSelect(star)}
                  className="text-5xl transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                  aria-label={`Rate ${star} stars`}
                >
                  <span className="text-gray-300 hover:text-yellow-400 transition-colors">
                    ★
                  </span>
                </button>
              ))}
            </div>
            {state.rating && (
              <p className="text-center text-sm text-gray-600 animate-star-pop">
                {STAR_LABELS[state.rating]} — tap to confirm
              </p>
            )}
          </div>
        )}

        {/* STEP 2: Liked Items */}
        {state.step === 'liked' && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setState((prev) => ({ ...prev, step: 'rating' }))}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ← Back
              </button>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className="text-lg"
                    style={{ color: star <= (state.rating || 0) ? '#F59E0B' : '#e5e7eb' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 text-center mb-1">
              What did you like?
            </h2>
            <p className="text-sm text-gray-500 text-center mb-5">Select all that apply</p>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {availableLikedItems.map((item) => (
                <button
                  key={item}
                  onClick={() => handleLikedItemToggle(item)}
                  className={`py-3 px-3 rounded-xl border-2 text-sm font-medium transition-all text-left flex items-center gap-2 ${
                    state.likedItems.includes(item)
                      ? 'border-current text-white shadow-md'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                  style={
                    state.likedItems.includes(item)
                      ? { background: accentColor, borderColor: accentColor }
                      : {}
                  }
                >
                  <span className="text-base">
                    {state.likedItems.includes(item) ? '✓' : '+'}
                  </span>
                  {LIKED_ITEM_LABELS[item] || item}
                </button>
              ))}
            </div>

            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Your name (optional)
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={state.contactName}
                onChange={(e) => setState((prev) => ({ ...prev, contactName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all text-sm"
              />
            </div>

            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Any comments? (optional)
              </label>
              <textarea
                placeholder="Share more about your experience..."
                value={state.comment}
                onChange={(e) => setState((prev) => ({ ...prev, comment: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all text-sm resize-none"
              />
            </div>

            {state.error && (
              <p className="text-red-500 text-sm text-center mb-3">{state.error}</p>
            )}

            <button
              onClick={handleSubmitHighRating}
              disabled={state.loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-98 disabled:opacity-60"
              style={{ background: accentColor }}
            >
              {state.loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin-slow w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating your review...
                </span>
              ) : (
                'Generate My Review ✨'
              )}
            </button>
          </div>
        )}

        {/* STEP 3a: Result (High Rating) */}
        {state.step === 'result' && state.generatedReview && (
          <div className="animate-fade-in-up text-center">
            <div className="mb-4">
              <div className="flex justify-center gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className="text-2xl"
                    style={{ color: star <= (state.rating || 0) ? '#F59E0B' : '#e5e7eb' }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500">Your review is ready!</p>
            </div>

            {/* Review Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-5 mb-5 text-left">
              <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                {state.generatedReview}
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleCopyReview}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-98 flex items-center justify-center gap-2"
                style={{ background: accentColor }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy to Clipboard
              </button>

              {state.business?.channels?.whatsapp_enabled && (
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full py-3.5 rounded-xl bg-green-500 text-white font-semibold text-base transition-all hover:bg-green-600 active:scale-98 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.548 4.094 1.513 5.823L0 24l6.335-1.66A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.977 0-3.81-.542-5.386-1.508l-.388-.254-3.893 1.02 1.04-3.797-.264-.41A9.83 9.83 0 012.18 12 9.82 9.82 0 0112 2.18a9.82 9.82 0 019.82 9.82 9.82 9.82 9.82 9.82 0 01-9.82 9.82z" />
                  </svg>
                  Share on WhatsApp
                </button>
              )}

              {state.business?.google_maps_url && (
                <a
                  href={state.business.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-base transition-all hover:bg-gray-800 active:scale-98 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Leave on Google Maps
                </a>
              )}
            </div>
          </div>
        )}

        {/* STEP 3b: Negative Feedback */}
        {state.step === 'negative' && (
          <div className="animate-fade-in-up text-center">
            <div className="mb-4">
              <div className="flex justify-center gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className="text-2xl"
                    style={{ color: star <= (state.rating || 0) ? '#F59E0B' : '#e5e7eb' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <div className="text-5xl mb-3">🙏</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                We&apos;re sorry to hear that
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your feedback has been shared with {state.business?.owner_name || 'the team'}. 
                We&apos;re committed to improving and would love to make it right.
              </p>
            </div>

            <button
              onClick={() => setState((prev) => ({ ...prev, step: 'rating', rating: null }))}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm"
            >
              Submit another response
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        Powered by ReputationOS
      </p>
    </main>
  );
}
