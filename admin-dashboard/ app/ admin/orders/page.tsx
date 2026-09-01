// app/admin/orders/page.tsx
import { sql } from '@/lib/db';
import OrdersTable from './orders-table';

export default async function AdminOrdersPage() {
  const orders = await sql`
    SELECT
      o.id, o.order_number, o.customer_name, o.customer_phone,
      o.customer_address, o.customer_city, o.notes, o.subtotal_pkr,
      o.status, o.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'product_name', oi.product_name_snapshot,
            'quantity', oi.quantity,
            'line_total_pkr', oi.line_total_pkr
          )
        ) FILTER (WHERE oi.id IS NOT NULL), '[]'
      ) AS items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Orders</h1>
      <p style={{ opacity: 0.6, fontSize: 14, marginBottom: 24 }}>
        {orders.length} orders — Cash on Delivery
      </p>
      <OrdersTable initialOrders={orders as any} />
    </div>
  );
}
