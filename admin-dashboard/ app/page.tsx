// app/page.tsx
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function Home() {
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
      <SignedOut>
        <SignInButton>
          <button style={{ padding: '10px 20px', cursor: 'pointer' }}>Sign in</button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Link href="/admin" style={{ color: '#FB923C' }}>
          Go to dashboard →
        </Link>
      </SignedIn>
    </main>
  );
}
