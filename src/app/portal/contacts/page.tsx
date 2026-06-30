'use client';
import { useState, useEffect, useRef } from 'react';

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#F59E0B', letterSpacing: -1, fontSize: 14 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ opacity: i <= rating ? 1 : 0.2 }}>★</span>
      ))}
    </span>
  );
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  async function loadContacts() {
    const res = await fetch('/api/contacts');
    const data = await res.json();
    setContacts(data.contacts || []);
    setLoading(false);
  }

  useEffect(() => {
    loadContacts();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    setAddSuccess('');

    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    });

    if (res.ok) {
      setName('');
      setPhone('');
      setAddSuccess('Contact added successfully!');
      loadContacts();
    } else {
      const data = await res.json();
      setAddError(data.error || 'Failed to add contact');
    }
    setAddLoading(false);
  }

  async function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    setImportMsg('');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/contacts/import', { method: 'POST', body: formData });
    const data = await res.json();

    if (res.ok) {
      setImportMsg(`Imported ${data.imported ?? 0} contacts.`);
      loadContacts();
    } else {
      setImportMsg(data.error || 'Import failed');
    }
    setImportLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>Contacts</h1>

      {/* Add Contact Form */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>Add Contact</h2>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contact name"
              required
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91..."
              required
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" disabled={addLoading} style={{ padding: '9px 20px', background: '#00C48C', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: addLoading ? 'not-allowed' : 'pointer', opacity: addLoading ? 0.6 : 1, whiteSpace: 'nowrap' }}>
            {addLoading ? 'Adding...' : 'Add Contact'}
          </button>
        </form>
        {addError && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 8 }}>{addError}</p>}
        {addSuccess && <p style={{ color: '#00C48C', fontSize: 13, marginTop: 8 }}>{addSuccess}</p>}
      </div>

      {/* CSV Import */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>CSV Import</h2>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>Upload a CSV with columns: name, phone. Max 500 rows.</p>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCsvImport} disabled={importLoading} style={{ fontSize: 14 }} />
        {importMsg && <p style={{ color: importMsg.includes('Imported') ? '#00C48C' : '#EF4444', fontSize: 13, marginTop: 8 }}>{importMsg}</p>}
      </div>

      {/* Contacts Table */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>
          All Contacts ({contacts.length})
        </h2>
        {loading ? (
          <p style={{ color: '#64748B' }}>Loading...</p>
        ) : contacts.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: 14 }}>No contacts yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Phone</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Last Visit</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Last Rating</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Visits</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px', fontSize: 14, color: '#0F172A', fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: '12px', fontSize: 14, color: '#475569' }}>{c.phone}</td>
                    <td style={{ padding: '12px', fontSize: 14, color: '#475569' }}>{formatDate(c.last_service_date)}</td>
                    <td style={{ padding: '12px' }}>
                      {c.last_rating ? <StarRating rating={c.last_rating} /> : <span style={{ color: '#94A3B8', fontSize: 14 }}>—</span>}
                    </td>
                    <td style={{ padding: '12px', fontSize: 14, color: '#475569' }}>{c.total_visits ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
