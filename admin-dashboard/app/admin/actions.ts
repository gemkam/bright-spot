// app/admin/actions.ts
'use server';

import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';

// Every action re-checks admin status server-side. The layout check keeps
// people off the admin PAGES, but actions are separate server endpoints
// under the hood — always re-verify before touching the database.
async function assertAdmin() {
  const check = await requireAdmin();
  if (!check.authorized) throw new Error('Not authorized');
}

// ---------- Products ----------

export async function updateStock(productId: string, newQuantity: number) {
  await assertAdmin();
  if (newQuantity < 0) throw new Error('Stock cannot be negative');

  await sql`
    UPDATE products SET stock_quantity = ${newQuantity} WHERE id = ${productId}
  `;
  revalidatePath('/admin');
}

export async function toggleActive(productId: string, isActive: boolean) {
  await assertAdmin();
  await sql`
    UPDATE products SET is_active = ${isActive} WHERE id = ${productId}
  `;
  revalidatePath('/admin');
}

export async function updateProduct(productId: string, data: {
  name: string;
  note: string;
  description: string;
  price_pkr: number;
  category_id: string;
}) {
  await assertAdmin();
  await sql`
    UPDATE products
    SET name = ${data.name},
        note = ${data.note},
        description = ${data.description},
        price_pkr = ${data.price_pkr},
        category_id = ${data.category_id}
    WHERE id = ${productId}
  `;
  revalidatePath('/admin');
}

export async function addProduct(data: {
  category_id: string;
  name: string;
  note: string;
  description: string;
  price_pkr: number;
  stock_quantity: number;
  image_front?: string;
  image_back?: string;
}) {
  await assertAdmin();
  await sql`
    INSERT INTO products (category_id, name, note, description, price_pkr, stock_quantity, image_front, image_back)
    VALUES (${data.category_id}, ${data.name}, ${data.note}, ${data.description}, ${data.price_pkr}, ${data.stock_quantity}, ${data.image_front ?? null}, ${data.image_back ?? null})
  `;
  revalidatePath('/admin');
}

export async function deleteProduct(productId: string) {
  await assertAdmin();
  await sql`DELETE FROM products WHERE id = ${productId}`;
  revalidatePath('/admin');
}

// ---------- Orders ----------

const ORDER_STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  await assertAdmin();
  if (!ORDER_STATUSES.includes(newStatus)) throw new Error('Invalid status');

  await sql`
    UPDATE orders SET status = ${newStatus} WHERE id = ${orderId}
  `;
  revalidatePath('/admin/orders');
}
