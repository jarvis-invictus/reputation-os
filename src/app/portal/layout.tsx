import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import './layout.css';

async function checkAuth() {
  const cookieStore = await cookies();
  const password = cookieStore.get('portal_password')?.value;
  const correctPassword = process.env.PORTAL_PASSWORD || 'reputation2026';
  if (password !== correctPassword) {
    redirect('/portal/login');
  }
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  await checkAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: '#0F172A', color: 'white', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#00C48C' }}>ReputationOS</div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Business Portal</div>
        </div>

        <NavLink href="/portal" icon="📊">Dashboard</NavLink>
        <NavLink href="/portal/contacts" icon="👥">Contacts</NavLink>
        <NavLink href="/portal/appointments" icon="📋">Mark Visit</NavLink>
        <NavLink href="/portal/reviews" icon="⭐">Reviews</NavLink>
        <NavLink href="/portal/settings" icon="⚙️">Settings</NavLink>

        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <NavLink href="/api/auth/logout" icon="🚪">Logout</NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 32, background: '#F8FAFC', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
      borderRadius: 8, color: '#94A3B8', textDecoration: 'none', fontSize: 14,
      fontWeight: 500, transition: 'all 0.15s'
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      {children}
    </Link>
  );
}
