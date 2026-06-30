'use client';
import { useState, useEffect } from 'react';

export default function AppointmentsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderDays, setReminderDays] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      setContacts(data.contacts || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedContact) {
      setMessage({ type: 'error', text: 'Please select a contact' });
      return;
    }
    setSubmitting(true);
    setMessage(null);

    const res = await fetch('/api/appointments/mark-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact_id: selectedContact,
        appointment_date: appointmentDate,
        reminder_days: reminderDays,
      }),
    });

    if (res.ok) {
      setMessage({ type: 'success', text: 'Visit marked complete! Reminder scheduled.' });
      setSelectedContact('');
      setReminderDays(1);
      setAppointmentDate(new Date().toISOString().split('T')[0]);
    } else {
      const data = await res.json();
      setMessage({ type: 'error', text: data.error || 'Failed to mark visit complete' });
    }
    setSubmitting(false);
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>Mark Visit Complete</h1>

      <div style={{ background: 'white', borderRadius: 12, padding: 32, maxWidth: 560, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
          Select a contact after their visit to schedule a review reminder.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Contact</label>
            {loading ? (
              <p style={{ color: '#94A3B8', fontSize: 14 }}>Loading contacts...</p>
            ) : (
              <select
                value={selectedContact}
                onChange={(e) => setSelectedContact(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'white' }}
              >
                <option value="">Select a contact...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Visit Date</label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Days until reminder <span style={{ color: '#94A3B8', fontWeight: 400 }}>(after visit)</span>
            </label>
            <input
              type="number"
              value={reminderDays}
              onChange={(e) => setReminderDays(Number(e.target.value))}
              min={0}
              max={30}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>The reminder will be sent this many days after the visit date.</p>
          </div>

          {message && (
            <p style={{
              color: message.type === 'success' ? '#00C48C' : '#EF4444',
              fontSize: 14, marginBottom: 16, padding: '10px 14px',
              background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              borderRadius: 8,
            }}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || loading}
            style={{ width: '100%', padding: '12px', background: '#00C48C', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Saving...' : 'Mark Visit Complete'}
          </button>
        </form>
      </div>
    </div>
  );
}
