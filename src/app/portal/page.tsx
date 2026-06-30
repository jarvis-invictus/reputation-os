'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#F59E0B', letterSpacing: -1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ opacity: i <= rating ? 1 : 0.2 }}>★</span>
      ))}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [statsRes, fbRes] = await Promise.all([
        fetch('/api/business/stats'),
        fetch('/api/feedbacks'),
      ]);
      const statsData = await statsRes.json();
      const fbData = await fbRes.json();
      setStats(statsData);
      setFeedbacks(fbData.feedbacks || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div style={{ color: '#64748B' }}>Loading...</div>;
  }

  const totalReviews = stats?.total_reviews ?? 0;
  const avgRating = stats?.average_rating ?? 0;
  const thisMonth = stats?.this_month_reviews ?? 0;
  const recentFeedbacks = feedbacks.slice(0, 10);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>Dashboard</h1>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard
          label="Total Reviews"
          value={totalReviews}
          icon="⭐"
          color="#00C48C"
        />
        <StatCard
          label="Average Rating"
          value={avgRating ? avgRating.toFixed(1) : '—'}
          icon="📊"
          color="#F59E0B"
          suffix={avgRating ? ' / 5' : ''}
        />
        <StatCard
          label="This Month"
          value={thisMonth}
          icon="📅"
          color="#3B82F6"
        />
      </div>

      {/* Rating Distribution */}
      {stats?.rating_distribution && (
        <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>Rating Distribution</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.rating_distribution[star] ?? 0;
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 16, fontSize: 14, color: '#F59E0B' }}>{star}★</span>
                  <div style={{ flex: 1, height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#F59E0B', borderRadius: 4, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ width: 32, fontSize: 13, color: '#64748B', textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Reviews */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>Recent Reviews</h2>
        {recentFeedbacks.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: 14 }}>No reviews yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentFeedbacks.map((fb) => (
              <div key={fb.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{fb.contact_name}</span>
                    <StarRating rating={fb.rating} />
                  </div>
                  {fb.generated_review && (
                    <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 0', lineHeight: 1.5 }}>{fb.generated_review}</p>
                  )}
                </div>
                <span style={{ fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap' }}>{formatDate(fb.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/portal/appointments" style={{ padding: '12px 20px', background: '#00C48C', color: 'white', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            📋 Mark Visit Complete
          </Link>
          <Link href="/portal/contacts" style={{ padding: '12px 20px', background: '#F1F5F9', color: '#0F172A', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            👥 Add Contact
          </Link>
          <Link href="/portal/reviews" style={{ padding: '12px 20px', background: '#F1F5F9', color: '#0F172A', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            ⭐ View All Reviews
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, suffix = '' }: { label: string; value: string | number; icon: string; color: string; suffix?: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>
        {value}{suffix}
      </div>
    </div>
  );
}
