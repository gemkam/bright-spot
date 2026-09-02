// app/api/keep-alive/route.ts
//
// Supabase pauses free-tier projects after 7 days with zero database
// activity. This route runs a trivial, harmless read query — enough to
// count as "activity" and reset that 7-day clock, without touching or
// exposing any real data.
//
// Vercel's cron (see vercel.json) hits this once a day, which is far more
// often than needed — comfortable margin under the 7-day pause window.

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // never cache — we want a real query every time

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Cheapest possible real query: just ask for a count, fetch nothing.
    // Uses `products`, not `categories` — categories are admin-only to read,
    // so an anonymous query there would just fail on RLS instead of succeeding.
    const { error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pinged_at: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
