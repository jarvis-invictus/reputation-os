'use client';
import { useState, useEffect } from 'react';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function QrSettingsPage() {
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationTag, setLocationTag] = useState('');
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function loadQrCodes() {
    const res = await fetch('/api/qr');
    const data = await res.json();
    setQrCodes(data.qr_codes || []);
    setLoading(false);
  }

  useEffect(() => {
    loadQrCodes();
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!locationTag.trim()) return;
    setGenerating(true);
    setMsg(null);

    const res = await fetch('/api/qr/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location_tag: locationTag.trim() }),
    });

    if (res.ok) {
      setLocationTag('');
      setMsg({ type: 'success', text: 'QR code generated!' });
      loadQrCodes();
    } else {
      const data = await res.json();
      setMsg({ type: 'error', text: data.error || 'Failed to generate QR code' });
    }
    setGenerating(false);
  }

  function downloadQr(imageUrl: string, tag: string) {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `qr-${tag.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>QR Codes</h1>
      <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
        Generate QR codes for different locations in your business. Print and display them to collect reviews.
      </p>

      {/* Generate Form */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>Generate New QR Code</h2>
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Location Tag</label>
            <input
              type="text"
              value={locationTag}
              onChange={(e) => setLocationTag(e.target.value)}
              placeholder="e.g. Front Desk, Counter, Table 5"
              required
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" disabled={generating} style={{ padding: '9px 20px', background: '#00C48C', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.6 : 1, whiteSpace: 'nowrap' }}>
            {generating ? 'Generating...' : 'Generate QR'}
          </button>
        </form>
        {msg && (
          <p style={{ color: msg.type === 'success' ? '#00C48C' : '#EF4444', fontSize: 13, marginTop: 10 }}>{msg.text}</p>
        )}
      </div>

      {/* Existing QR Codes */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>
          Existing QR Codes ({qrCodes.length})
        </h2>
        {loading ? (
          <p style={{ color: '#64748B' }}>Loading...</p>
        ) : qrCodes.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: 14 }}>No QR codes yet. Generate one above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {qrCodes.map((qr) => (
              <div key={qr.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', border: '1px solid #F1F5F9', borderRadius: 10 }}>
                {qr.image_url ? (
                  <img src={qr.image_url} alt={`QR for ${qr.location_tag}`} style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    📲
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{qr.location_tag}</div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{qr.total_scans} scans · Created {formatDate(qr.created_at)}</div>
                  {qr.url_slug && (
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Slug: {qr.url_slug}</div>
                  )}
                </div>
                {qr.image_url && (
                  <button
                    onClick={() => downloadQr(qr.image_url, qr.location_tag)}
                    style={{ padding: '8px 16px', border: '1px solid #D1D5DB', borderRadius: 8, background: 'white', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}
                  >
                    ⬇ Download
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
