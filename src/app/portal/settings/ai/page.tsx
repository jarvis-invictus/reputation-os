'use client';
import { useState, useEffect } from 'react';

const AI_STYLES = [
  { value: 'simple', label: 'Simple', description: 'Short, direct, no fluff' },
  { value: 'casual', label: 'Casual', description: 'Friendly, conversational tone' },
  { value: 'enthusiastic', label: 'Enthusiastic', description: 'Expressive, energetic, with exclamation marks' },
  { value: 'formal', label: 'Formal', description: 'Professional, polished, structured' },
];

export default function AiSettingsPage() {
  const [businessId, setBusinessId] = useState('');
  const [aiStyle, setAiStyle] = useState('simple');
  const [customInstructions, setCustomInstructions] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/business');
      const data = await res.json();
      if (data.business) {
        setBusinessId(data.business.id);
        setAiStyle(data.business.ai_style || 'simple');
        setCustomInstructions(data.business.ai_custom_instructions || '');
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId) return;
    setSaving(true);
    setMsg(null);

    const res = await fetch('/api/business', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: businessId,
        ai_style: aiStyle,
        ai_custom_instructions: customInstructions || null,
      }),
    });

    if (res.ok) {
      setMsg({ type: 'success', text: 'AI settings saved!' });
    } else {
      setMsg({ type: 'error', text: 'Failed to save AI settings' });
    }
    setSaving(false);
  }

  if (loading) return <div style={{ color: '#64748B' }}>Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>AI Settings</h1>
      <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
        Configure how AI generates review texts from customer feedback.
      </p>

      <div style={{ background: 'white', borderRadius: 12, padding: 32, maxWidth: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>Review Style</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {AI_STYLES.map((style) => (
                <label key={style.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', border: `2px solid ${aiStyle === style.value ? '#00C48C' : '#E2E8F0'}`, borderRadius: 10, cursor: 'pointer', background: aiStyle === style.value ? '#ECFDF5' : 'white', transition: 'all 0.15s' }}>
                  <input
                    type="radio"
                    name="ai_style"
                    value={style.value}
                    checked={aiStyle === style.value}
                    onChange={() => setAiStyle(style.value)}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{style.label}</div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{style.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>
              Custom Instructions <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Always mention our 10-year anniversary, use British English, highlight our eco-friendly practices..."
              rows={5}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
            />
            <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>These instructions will be added to all AI-generated review prompts.</p>
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
            {saving ? 'Saving...' : 'Save AI Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
