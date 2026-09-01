'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/sign-in');
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        padding: '6px 14px',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.25)',
        background: 'none',
        color: '#f5f2fb',
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      Sign out
    </button>
  );
}
