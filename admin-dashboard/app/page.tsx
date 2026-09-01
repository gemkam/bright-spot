// app/page.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const STORE_URL = 'https://bright-spot.vercel.app';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        fontFamily: 'sans-serif',
        background: '#0b0714',
        color: '#f5f2fb',
      }}
    >
      <h1>Bright Spot Admin</h1>
      {user ? (
        <Link href="/admin" style={{ color: '#FB923C' }}>
          Go to dashboard →
        </Link>
      ) : (
        <Link href="/sign-in" style={{ color: '#FB923C' }}>
          Sign in →
        </Link>
      )}
      <a href={STORE_URL} style={{ color: 'rgba(245,242,251,0.6)', fontSize: 14, marginTop: 6 }}>
        ← Back to store
      </a>
    </main>
  );
}
