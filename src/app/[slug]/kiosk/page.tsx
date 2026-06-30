'use client';

import { useState, useEffect, useCallback } from 'react';
import { likedItemsByType, type Business, type BusinessType } from '@/lib/supabase/types';

interface Props {
  params: Promise<{ slug: string }>;
}

type FeedbackState = {
  step: 'welcome' | 'rating' | 'liked' | 'result' | 'negative' | 'done';
  rating: number | null;
  likedItems: string[];
  contactName: string;
  comment: string;
  loading: boolean;
  generatedReview: string | null;
  feedbackId: string | null;
  business: Business | null;
};

const LIKED_ITEM_LABELS: Record<string, string> = {
  staff: 'Staff', treatment: 'Treatment', cleanliness: 'Cleanliness',
  price: 'Price', ambiance: 'Ambiance', speed: 'Speed', food: 'Food',
  service: 'Service', product_quality: 'Product Quality', variety: 'Variety',
  result: 'Results', quality: 'Quality', convenience: 'Convenience',
};

export default function KioskPage({ params }: Props) {
  const [slug, setSlug] = useState<string>('');
  const [state, setState] = useState<FeedbackState>({
    step: 'welcome',
    rating: null,
    likedItems: [],
    contactName: '',
    comment: '',
    loading: false,
    generatedReview: null,
    feedbackId: null,
    business: null,
  });

  useEffect(() => {
    params.then(({ slug: s }) => setSlug(s));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/business/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.business) setState((prev) => ({ ...prev, business: data.business }));
      })
      .catch(console.error);
  }, [slug]);

  const accentColor = state.business?.accent_color || '#00C48C';
  const businessType = (state.business?.type || 'other') as BusinessType;
  const availableLikedItems = likedItemsByType[businessType] || likedItemsByType.other;

  const reset = useCallback(() => {
    setState({
      step: 'welcome', rating: null, likedItems: [], contactName: '',
      comment: '', loading: false, generatedReview: null, feedbackId: null,
      business: state.business,
    });
  }, [state.business]);

  const handleSubmitHighRating = useCallback(async () => {
    if (!state.rating || !state.business) return;
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: state.business!.id, rating: state.rating,
          liked_items: state.likedItems, contact_name: state.contactName || 'Guest',
          comment: state.comment, channel: 'kiosk',
        }),
      });
      const data = await res.json();
      setState((prev) => ({
        ...prev, loading: false, step: 'result',
        generatedReview: data.generated_review || data.fallback_review,
        feedbackId: data.id,
      }));
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [state]);

  const handleSubmitNegative = useCallback(async () => {
    if (!state.rating || !state.business) return;
    setState((prev) => ({ ...prev, loading: true }));
    await fetch('/api/feedback/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_id: state.business!.id, rating: state.rating,
        liked_items: [], contact_name: state.contactName || 'Guest',
        comment: state.comment, channel: 'kiosk',
      }),
    });
    setState((prev) => ({ ...prev, loading: false, step: 'negative' }));
  }, [state]);

  const handleCopyReview = useCallback(async () => {
    if (!state.generatedReview) return;
    await navigator.clipboard.writeText(state.generatedReview).catch(() => {});
    if (state.feedbackId) {
      fetch(`/api/feedback/${state.feedbackId}/copy`, { method: 'POST' });
    }
  }, [state.generatedReview, state.feedbackId]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-8 py-12 bg-white">
      {/* Logo */}
      <div className="absolute top-6 left-8">
        {state.business?.logo_url ? (
          <img src={state.business.logo_url} alt="" className="h-12 w-auto object-contain" />
        ) : (
          <div className="text-2xl font-bold" style={{ color: accentColor }}>
            {state.business?.name || ''}
          </div>
        )}
      </div>

      {/* Auto-reset hint */}
      <div className="absolute top-6 right-8 text-xs text-gray-300">
        Tap anywhere to restart
      </div>

      {/* Welcome */}
      {state.step === 'welcome' && (
        <div className="text-center animate-fade-in-up cursor-pointer" onClick={() => setState((p) => ({ ...p, step: 'rating' }))}>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            How was your visit?
          </h1>
          <p className="text-xl text-gray-500 mb-10">Tap anywhere to start</p>
          <div className="text-8xl animate-bounce">👆</div>
        </div>
      )}

      {/* Rating */}
      {state.step === 'rating' && (
        <div className="text-center animate-fade-in-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Tap to rate</h2>
          <p className="text-xl text-gray-400 mb-10">{state.business?.name}</p>
          <div className="flex justify-center gap-4 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setState((p) => ({
                  ...p,
                  rating: star,
                  step: star >= 4 ? 'liked' : 'negative',
                }))}
                className="text-8xl hover:scale-110 active:scale-95 transition-transform"
                style={{ color: '#e5e7eb' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F59E0B')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#e5e7eb')}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Liked Items */}
      {state.step === 'liked' && (
        <div className="w-full max-w-2xl animate-fade-in-up">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">What did you like?</h2>
          <p className="text-gray-400 text-center mb-8">Select all that apply</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {availableLikedItems.map((item) => (
              <button
                key={item}
                onClick={() => setState((p) => ({
                  ...p,
                  likedItems: p.likedItems.includes(item)
                    ? p.likedItems.filter((i) => i !== item)
                    : [...p.likedItems, item],
                }))}
                className={`py-4 px-4 rounded-2xl border-2 text-lg font-semibold transition-all ${
                  state.likedItems.includes(item)
                    ? 'border-transparent text-white shadow-lg'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
                style={state.likedItems.includes(item) ? { background: accentColor } : {}}
              >
                {LIKED_ITEM_LABELS[item] || item}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setState((p) => ({ ...p, step: 'rating', rating: null }))}
              className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-lg"
            >
              Back
            </button>
            <button
              onClick={handleSubmitHighRating}
              disabled={state.loading}
              className="flex-1 py-4 rounded-2xl text-white font-bold text-xl transition-all disabled:opacity-60"
              style={{ background: accentColor }}
            >
              {state.loading ? 'Generating...' : 'Generate Review ✨'}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {state.step === 'result' && state.generatedReview && (
        <div className="w-full max-w-2xl animate-fade-in-up text-center">
          <p className="text-4xl font-bold text-gray-900 mb-2">Your review is ready!</p>
          <div className="flex justify-center gap-0.5 mb-6">
            {[1,2,3,4,5].map(s => (
              <span key={s} className="text-3xl" style={{ color: s <= (state.rating||0) ? '#F59E0B' : '#e5e7eb' }}>★</span>
            ))}
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
            <p className="text-lg text-gray-800 whitespace-pre-wrap">{state.generatedReview}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCopyReview}
              className="flex-1 py-4 rounded-2xl text-white font-bold text-xl"
              style={{ background: accentColor }}
            >
              📋 Copy Review
            </button>
            <button
              onClick={reset}
              className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Negative */}
      {state.step === 'negative' && (
        <div className="text-center animate-fade-in-up">
          <p className="text-8xl mb-6">🙏</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">We&apos;re sorry to hear that</h2>
          <p className="text-xl text-gray-500 mb-8">
            Your feedback has been shared with the team. We&apos;ll work to improve.
          </p>
          <button
            onClick={reset}
            className="px-8 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-lg"
          >
            Submit Another Response
          </button>
        </div>
      )}
    </main>
  );
}
