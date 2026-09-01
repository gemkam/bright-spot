// lib/db.ts
// Thin query helper around the Neon serverless Postgres driver.
// Install: npm install @neondatabase/serverless

import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.local.example to .env.local and fill it in.');
}

// `sql` is a tagged-template query function: sql`SELECT * FROM products WHERE id = ${id}`
export const sql = neon(process.env.DATABASE_URL);
