// lib/admin-auth.ts
// Checks whether the current Clerk user is authorized for the admin dashboard.
// Authorization = their Clerk user ID exists in the `admin_users` table in Neon.
//
// This is a second layer of protection on top of Clerk's own sign-in check:
// Clerk confirms WHO the person is; this confirms they're actually ALLOWED
// into the admin area (not just any customer with an account).

import { auth } from '@clerk/nextjs/server';
import { sql } from './db';

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    return { authorized: false as const, reason: 'not-signed-in' as const };
  }

  const rows = await sql`
    SELECT id, role FROM admin_users WHERE clerk_user_id = ${userId} LIMIT 1
  `;

  if (rows.length === 0) {
    return { authorized: false as const, reason: 'not-admin' as const };
  }

  return { authorized: true as const, role: rows[0].role as string };
}

// One-time helper for you to run yourself (e.g. from a temporary API route,
// or directly in the Neon SQL editor) to add your own Clerk user ID once
// you've signed up once through Clerk and know your user ID:
//
//   INSERT INTO admin_users (clerk_user_id, email, role)
//   VALUES ('user_XXXXXXXXXXXX', 'you@example.com', 'admin');
//
// Find your Clerk user ID in the Clerk dashboard under Users, or by logging
// `userId` from `auth()` anywhere in your app while signed in.
