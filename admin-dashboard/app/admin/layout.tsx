// app/admin/layout.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import SignOutButton from './sign-out-button';

const STORE_URL = 'https://bright-spot.vercel.app';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const check = await requireAdmin();

  if (!check.authorized) {
    if (check.reason === 'not-admin') {
      redirect('/?admin_denied=1');
    }
    redirect('/sign-in');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b0714', color: '#f5f2fb' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 28px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Link href="/admin" style={{ fontFamily: 'sans-serif', fontSize: 18, fontWeight: 700, color: '#f5f2fb', textDecoration: 'none' }}>
            Bright Spot Admin
          </Link>
          <nav style={{ display: 'flex', gap: 18, fontSize: 14 }}>
            <Link href="/admin" style={{ color: '#f5f2fb', opacity: 0.8 }}>Dashboard</Link>
            <Link href="/admin/products" style={{ color: '#f5f2fb', opacity: 0.8 }}>Products</Link>
            <Link href="/admin/orders" style={{ color: '#f5f2fb', opacity: 0.8 }}>Orders</Link>
            <Link href="/admin/power-editor" style={{ color: '#FB923C' }}>⚡ Power Editor</Link>
            <a href={STORE_URL} style={{ color: '#f5f2fb', opacity: 0.6 }}>← Back to store</a>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, opacity: 0.6 }}>{check.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main style={{ padding: 28 }}>{children}</main>
    </div>
  );
}
