'use client';
import { useState, useEffect } from 'react';

export default function GoogleSettingsPage() {
  const [business, setBusiness] = useState<any>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [googleBusinessName, setGoogleBusinessName] = useState('');
  const [serviceList, setServiceList] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/business');
      const data = await res.json();
      if (data.business) {
        setBusiness(data.business);
        setGoogleMapsUrl(data.business.google_maps_url || '');
        setGoogleBusinessName(data.business.google_business_name || '');
        setServiceList((data.business.service_list || []).join(', '));
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!business) return;
    setSaving(true);
    setMsg(null);

    const services = serviceList.split(',').map((s) => s.trim()).filter(Boolean);

    const res = await fetch('/api/business', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: business.id,
        google_maps_url: googleMapsUrl || null,
        google_business_name: googleBusinessName || null,
        service_list: services,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setBusiness(data.business);
      setMsg({ type: 'success', text: 'Google settings saved!' });
    } else {
      setMsg({ type: 'error', text: 'Failed to save' });
    }
    setSaving(false);
  }

  if (loading) return <div style={{ color: '#64748B' }}>Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Google Business</h1>
      <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
        Connect your Google Business profile to display your review link prominently.
      </p>

      <div style={{ background: 'white', borderRadius: 12, padding: 32, maxWidth: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Google Maps URL</label>
            <input
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Google Business Name</label>
            <input
              type="text"
              value={googleBusinessName}
              onChange={(e) => setGoogleBusinessName(e.target.value)}
              placeholder="Your Business @ Google"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Services / Dishes / Treatments</label>
            <textarea
              value={serviceList}
              onChange={(e) => setServiceList(e.target.value)}
              placeholder="Comma-separated: Haircut, Coloring, Treatments"
              rows={4}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            />
            <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Comma-separated list. Used by AI when generating reviews.</p>
          </div>

          {msg && (
            <p style={{
              color: msg.type === 'success' ? '#00C48C' : '#EF4444',
              fontSize: 14, marginBottom: 16, padding: '10px 14px',
              background: msg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              borderRadius: 8,
            }}>
              {msg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{ width: '100%', padding: '12px', background: '#00C48C', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
