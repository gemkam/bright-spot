'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();

    const { error } =
      mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (mode === 'sign-up') {
      setError('Account created. If email confirmation is on, check your inbox, then sign in.');
      setMode('sign-in');
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0714',
        color: '#f5f2fb',
        fontFamily: 'sans-serif',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: 28,
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8,
        }}
      >
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>Bright Spot Admin</h1>
        <p style={{ fontSize: 13, opacity: 0.6, marginTop: -8 }}>
          {mode === 'sign-in' ? 'Sign in to continue' : 'Create an account'}
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={inputStyle}
        />

        {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 16px',
            background: 'linear-gradient(120deg, #FB923C, #F97316)',
            border: 'none',
            borderRadius: 6,
            color: '#1a0e05',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Sign up'}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
          style={{ background: 'none', border: 'none', color: '#FB923C', fontSize: 13, cursor: 'pointer' }}
        >
          {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  background: '#1a1428',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 6,
  color: '#fff',
  fontSize: 14,
};
