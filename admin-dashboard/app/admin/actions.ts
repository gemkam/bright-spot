// app/admin/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Note: RLS in Postgres enforces "admins only" automatically on every query
// below — no manual re-check needed here.

// ---------- Products ----------

export async function updateStock(productId: string, newQuantity: number) {
  if (newQuantity < 0) throw new Error('Stock cannot be negative');
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ stock_quantity: newQuantity, updated_at: new Date().toISOString() })
    .eq('id', productId);
  if (error) throw error;
  revalidatePath('/admin');
}

export async function toggleActive(productId: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', productId);
  if (error) throw error;
  revalidatePath('/admin');
}

export type ProductInput = {
  category_id: string;
  name: string;
  note: string;
  description: string;
  price_pkr: number;
  stock_quantity: number;
  image_front: string;
  image_back: string;
};

export async function updateProduct(productId: string, data: ProductInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', productId);
  if (error) throw error;
  revalidatePath('/admin');
  revalidatePath('/admin/power-editor');
}

export async function addProduct(data: ProductInput) {
  const supabase = await createClient();
  const { error } = await supabase.from('products').insert(data);
  if (error) throw error;
  revalidatePath('/admin');
  revalidatePath('/admin/power-editor');
}

// Partial update used by the Power Editor's quick price/photo grid.
// Deliberately touches ONLY these 3 columns — never overwrites stock,
// description, name, or category, even if the caller doesn't have those
// values loaded (unlike updateProduct, which replaces the whole row).
export async function quickUpdateProduct(productId: string, data: {
  price_pkr: number;
  image_front: string;
  image_back: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', productId);
  if (error) throw error;
  revalidatePath('/admin');
  revalidatePath('/admin/power-editor');
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
  revalidatePath('/admin');
  revalidatePath('/admin/power-editor');
}

// ---------- CSV Bulk Import (Power Editor) ----------

export type CsvProductRow = {
  product_name: string;
  price_pkr?: number;
  description?: string;
  image_front?: string;
  image_back?: string;
};

export type BulkImportResult = {
  updated: string[];
  notFound: string[];
};

// Matches each CSV row to an existing product by exact name, and updates
// ONLY the fields present in that row (price, description, photos) —
// never touches stock, category, or anything not included in the CSV.
// Products not found by name are reported back, not silently skipped.
export async function bulkImportProducts(rows: CsvProductRow[]): Promise<BulkImportResult> {
  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from('products')
    .select('id, name');
  if (fetchError) throw fetchError;

  const idByName = new Map<string, string>();
  (existing ?? []).forEach((p) => idByName.set(p.name.trim().toLowerCase(), p.id));

  const updated: string[] = [];
  const notFound: string[] = [];

  for (const row of rows) {
    const key = (row.product_name || '').trim().toLowerCase();
    const id = idByName.get(key);
    if (!id) {
      notFound.push(row.product_name);
      continue;
    }

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (row.price_pkr !== undefined && !isNaN(row.price_pkr)) patch.price_pkr = row.price_pkr;
    if (row.description) patch.description = row.description;
    if (row.image_front) patch.image_front = row.image_front;
    if (row.image_back) patch.image_back = row.image_back;

    const { error } = await supabase.from('products').update(patch).eq('id', id);
    if (error) {
      notFound.push(`${row.product_name} (save failed: ${error.message})`);
    } else {
      updated.push(row.product_name);
    }
  }

  revalidatePath('/admin');
  revalidatePath('/admin/power-editor');
  return { updated, notFound };
}

// ---------- Orders ----------

const ORDER_STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  if (!ORDER_STATUSES.includes(newStatus)) throw new Error('Invalid status');
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
  revalidatePath('/admin/orders');
}

// ---------- Site settings (Power Editor) ----------

export type SiteSettings = {
  hero_video_url: string;
  hero_headline: string;
  hero_subtext: string;
  whatsapp_number: string;
};

export async function updateSiteSettings(data: SiteSettings) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('site_settings')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw error;
  revalidatePath('/admin/power-editor');
}
