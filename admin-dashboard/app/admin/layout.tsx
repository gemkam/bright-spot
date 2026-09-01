// app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { requireAdmin } from '@/lib/admin-auth';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const check = await requireAdmin();

  if (!check.authorized) {
    // Signed in but not an admin -> bounce to the storefront, not a sign-in loop
    if (check.reason === 'not-admin') {
      redirect('/?admin_denied=1');
    }
    // Not signed in at all -> middleware should already have caught this,
    // but redirect defensively just in case.
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
          <strong style={{ fontFamily: 'sans-serif', fontSize: 18 }}>Bright Spot Admin</strong>
          <nav style={{ display: 'flex', gap: 18, fontSize: 14 }}>
            <Link href="/admin" style={{ color: '#f5f2fb', opacity: 0.8 }}>Products</Link>
            <Link href="/admin/orders" style={{ color: '#f5f2fb', opacity: 0.8 }}>Orders</Link>
            <Link href="/" style={{ color: '#f5f2fb', opacity: 0.6 }}>← Back to store</Link>
          </nav>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>
      <main style={{ padding: 28 }}>{children}</main>
    </div>
  );
}
