import Link from 'next/link';

const settingsLinks = [
  {
    href: '/portal/settings/profile',
    icon: '🏢',
    title: 'Profile',
    description: 'Business name, type, owner details, logo',
  },
  {
    href: '/portal/settings/google',
    icon: '🔍',
    title: 'Google Business',
    description: 'Google Maps URL, business name, services',
  },
  {
    href: '/portal/settings/channels',
    icon: '📱',
    title: 'Channels',
    description: 'QR code, WhatsApp, SMS, Email toggles',
  },
  {
    href: '/portal/settings/qr',
    icon: '📲',
    title: 'QR Codes',
    description: 'Generate and manage QR codes',
  },
  {
    href: '/portal/settings/ai',
    icon: '🤖',
    title: 'AI Settings',
    description: 'Review generation style and custom instructions',
  },
];

export default function SettingsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>Settings</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {settingsLinks.map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: '#64748B' }}>{item.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
