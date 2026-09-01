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
}

export async function addProduct(data: ProductInput) {
  const supabase = await createClient();
  const { error } = await supabase.from('products').insert(data);
  if (error) throw error;
  revalidatePath('/admin');
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
  revalidatePath('/admin');
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
