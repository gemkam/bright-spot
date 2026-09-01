// lib/admin-auth.ts
// Checks whether the current Supabase user is authorized for the admin dashboard.
//
// Note: this check is for UI purposes (showing/hiding pages, friendly redirects).
// The REAL security boundary is Row Level Security in Postgres — every table
// has a policy requiring is_admin() to be true, so even if this check were
// somehow bypassed, the database itself would refuse to return or accept data
// for a non-admin user. Two layers, not just one.

import { createClient } from './supabase/server';

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false as const, reason: 'not-signed-in' as const };
  }

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!adminRow) {
    return { authorized: false as const, reason: 'not-admin' as const };
  }

  return { authorized: true as const, role: adminRow.role as string, email: user.email };
}

// One-time setup: after you sign up once through /sign-in, add yourself as an
// admin by running this in the Supabase SQL Editor (replace the email):
//
//   insert into admin_users (user_id, email, role)
//   select id, email, 'admin' from auth.users where email = 'you@example.com';
