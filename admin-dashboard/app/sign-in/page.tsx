'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } =
        mode === 'sign-in'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (error) {
        setError(`${error.message} (code: ${error.status ?? 'unknown'})`);
        return;
      }

      if (mode === 'sign-up') {
        if (data.user && !data.session) {
          setInfo('Account created — this project requires email confirmation. Check your inbox for a confirmation link before signing in.');
        } else {
          setInfo('Account created successfully. You can sign in now.');
        }
        setMode('sign-in');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(`Unexpected error: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
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
          width: 340,
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

        {error && (
          <p style={{ color: '#f87171', fontSize: 13, background: 'rgba(248,113,113,0.1)', padding: 10, borderRadius: 6 }}>
            {error}
          </p>
        )}
        {info && (
          <p style={{ color: '#4ade80', fontSize: 13, background: 'rgba(74,222,128,0.1)', padding: 10, borderRadius: 6 }}>
            {info}
          </p>
        )}

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
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Sign up'}
        </button>

        <button
          type="button"
          onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setError(''); setInfo(''); }}
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
