'use client';
import { useState, useEffect } from 'react';

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#F59E0B', letterSpacing: -1, fontSize: 15 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ opacity: i <= rating ? 1 : 0.2 }}>★</span>
      ))}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function copyToClipboard(text: string, setCopied: (id: string) => void, id: string) {
  try {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  }
}

export default function ReviewsPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [copiedId, setCopiedId] = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/feedbacks');
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = feedbacks.filter((fb) => {
    if (filter === 'all') return true;
    if (filter === '5') return fb.rating === 5;
    if (filter === 'high') return fb.rating >= 4;
    if (filter === 'low') return fb.rating < 4;
    return true;
  });

  const ratingCounts = {
    all: feedbacks.length,
    high: feedbacks.filter((f) => f.rating >= 4).length,
    low: feedbacks.filter((f) => f.rating < 4).length,
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>Reviews</h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { key: 'all', label: `All (${ratingCounts.all})` },
          { key: 'high', label: `⭐ 4-5 (${ratingCounts.high})` },
          { key: 'low', label: `⭐ 1-3 (${ratingCounts.low})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '7px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: filter === key ? '#0F172A' : '#F1F5F9',
              color: filter === key ? 'white' : '#475569',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <p style={{ color: '#64748B' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: 14 }}>No reviews found.</p>
        ) : filtered.map((fb) => (
          <div key={fb.id} style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{fb.contact_name}</span>
                  <StarRating rating={fb.rating} />
                  <span style={{ fontSize: 12, color: '#94A3B8', background: '#F1F5F9', padding: '2px 8px', borderRadius: 100 }}>{fb.channel}</span>
                </div>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>{formatDate(fb.created_at)}</span>
              </div>
              {fb.review_copied && (
                <span style={{ fontSize: 12, color: '#00C48C', background: '#ECFDF5', padding: '2px 8px', borderRadius: 100 }}>Copied</span>
              )}
            </div>

            {fb.liked_items && fb.liked_items.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {fb.liked_items.map((item: string) => (
                  <span key={item} style={{ fontSize: 12, color: '#0F172A', background: '#F1F5F9', padding: '3px 10px', borderRadius: 100 }}>{item}</span>
                ))}
              </div>
            )}

            {fb.comment && (
              <p style={{ fontSize: 14, color: '#475569', marginBottom: 10, fontStyle: 'italic', lineHeight: 1.5 }}>
                &ldquo;{fb.comment}&rdquo;
              </p>
            )}

            {fb.generated_review && (
              <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                <p style={{ fontSize: 13, color: '#0F172A', lineHeight: 1.5, margin: 0 }}>{fb.generated_review}</p>
              </div>
            )}

            {fb.generated_review && (
              <button
                onClick={() => copyToClipboard(fb.generated_review, setCopiedId, fb.id)}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: '1px solid #D1D5DB', background: 'white',
                  fontSize: 13, fontWeight: 500, color: copiedId === fb.id ? '#00C48C' : '#374151',
                  cursor: 'pointer',
                }}
              >
                {copiedId === fb.id ? '✓ Copied!' : 'Copy Review'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
