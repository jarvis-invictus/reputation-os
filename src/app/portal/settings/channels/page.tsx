'use client';
import { useState, useEffect } from 'react';

function Toggle({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: disabled ? 'default' : 'pointer',
        background: enabled ? '#00C48C' : '#E2E8F0', position: 'relative', transition: 'background 0.2s',
        opacity: disabled ? 0.6 : 1,
      }}
      disabled={disabled}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 3, transition: 'left 0.2s',
        left: enabled ? 23 : 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

interface ChannelState {
  qr_enabled: boolean;
  whatsapp_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
  kiosk_enabled: boolean;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<ChannelState>({
    qr_enabled: true,
    whatsapp_enabled: false,
    sms_enabled: false,
    email_enabled: false,
    kiosk_enabled: true,
  });
  const [businessId, setBusinessId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/business');
      const data = await res.json();
      if (data.business) {
        setBusinessId(data.business.id);
        setChannels({
          qr_enabled: data.business.channels?.qr_enabled ?? true,
          whatsapp_enabled: data.business.channels?.whatsapp_enabled ?? false,
          sms_enabled: data.business.channels?.sms_enabled ?? false,
          email_enabled: data.business.channels?.email_enabled ?? false,
          kiosk_enabled: data.business.channels?.kiosk_enabled ?? true,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function saveChannels() {
    if (!businessId) return;
    setSaving(true);
    setMsg(null);

    const res = await fetch('/api/business', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: businessId, channels }),
    });

    if (res.ok) {
      setMsg({ type: 'success', text: 'Channels saved!' });
    } else {
      setMsg({ type: 'error', text: 'Failed to save channels' });
    }
    setSaving(false);
  }

  if (loading) return <div style={{ color: '#64748B' }}>Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Channels</h1>
      <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
        Enable or disable feedback collection channels.
      </p>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, maxWidth: 560, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <ChannelRow
            icon="📲"
            label="QR Codes"
            description="Collect feedback via printed QR codes"
            enabled={channels.qr_enabled}
            onChange={() => {}}
            note="Always enabled when QR codes exist"
            disabled
          />
          <ChannelRow
            icon="💬"
            label="WhatsApp"
            description="Send reminders and review links via WhatsApp"
            enabled={channels.whatsapp_enabled}
            onChange={(v) => { setChannels({ ...channels, whatsapp_enabled: v }); saveChannels(); }}
            note="Configure in WhatsApp settings"
          />
          <ChannelRow
            icon="📱"
            label="SMS"
            description="Send reminders and review links via SMS (coming soon)"
            enabled={channels.sms_enabled}
            onChange={(v) => { setChannels({ ...channels, sms_enabled: v }); saveChannels(); }}
            note="Future feature"
            disabled
          />
          <ChannelRow
            icon="📧"
            label="Email"
            description="Send reminders and review links via Email (coming soon)"
            enabled={channels.email_enabled}
            onChange={(v) => { setChannels({ ...channels, email_enabled: v }); saveChannels(); }}
            note="Future feature"
            disabled
          />
          <ChannelRow
            icon="🖥️"
            label="Kiosk"
            description="Collect in-person feedback on a tablet or kiosk"
            enabled={channels.kiosk_enabled}
            onChange={(v) => { setChannels({ ...channels, kiosk_enabled: v }); saveChannels(); }}
          />
        </div>

        {msg && (
          <p style={{
            color: msg.type === 'success' ? '#00C48C' : '#EF4444',
            fontSize: 14, marginTop: 16, padding: '10px 14px',
            background: msg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            borderRadius: 8,
          }}>
            {msg.text}
          </p>
        )}

        {saving && <p style={{ color: '#64748B', fontSize: 13, marginTop: 8 }}>Saving...</p>}
      </div>
    </div>
  );
}

function ChannelRow({
  icon, label, description, enabled, onChange, note, disabled = false,
}: {
  icon: string; label: string; description: string; enabled: boolean;
  onChange: (v: boolean) => void; note?: string; disabled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 20, marginTop: 2 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{label}</div>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{description}</div>
          {note && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{note}</div>}
        </div>
      </div>
      <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
    </div>
  );
}
