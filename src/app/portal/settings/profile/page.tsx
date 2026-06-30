'use client';
import { useState, useEffect } from 'react';

const BUSINESS_TYPES = [
  { value: 'clinic', label: 'Clinic' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'salon', label: 'Salon' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Other' },
];

export default function ProfileSettingsPage() {
  const [business, setBusiness] = useState<any>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('other');
  const [ownerName, setOwnerName] = useState('');
  const [ownerTitle, setOwnerTitle] = useState('');
  const [accentColor, setAccentColor] = useState('#00C48C');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/business');
      const data = await res.json();
      if (data.business) {
        setBusiness(data.business);
        setName(data.business.name || '');
        setType(data.business.type || 'other');
        setOwnerName(data.business.owner_name || '');
        setOwnerTitle(data.business.owner_title || '');
        setAccentColor(data.business.accent_color || '#00C48C');
        setLogoUrl(data.business.logo_url || '');
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

    const res = await fetch('/api/business', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: business.id,
        name,
        type,
        owner_name: ownerName,
        owner_title: ownerTitle,
        accent_color: accentColor,
        logo_url: logoUrl || null,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setBusiness(data.business);
      setMsg({ type: 'success', text: 'Profile saved successfully!' });
    } else {
      setMsg({ type: 'error', text: 'Failed to save profile' });
    }
    setSaving(false);
  }

  if (loading) return <div style={{ color: '#64748B' }}>Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>Profile Settings</h1>

      <div style={{ background: 'white', borderRadius: 12, padding: 32, maxWidth: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Business Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Business Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'white' }}
            >
              {BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Owner Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Owner Title</label>
              <input
                type="text"
                value={ownerTitle}
                onChange={(e) => setOwnerTitle(e.target.value)}
                placeholder="e.g. Director, Chef"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'center', marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Accent Color</label>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                style={{ width: 48, height: 40, borderRadius: 8, border: '1px solid #D1D5DB', cursor: 'pointer' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Logo URL</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
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
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
