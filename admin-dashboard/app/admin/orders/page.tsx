// app/admin/orders/page.tsx
import { createClient } from '@/lib/supabase/server';
import OrdersTable from './orders-table';

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, order_number, customer_name, customer_phone, customer_address,
      customer_city, notes, subtotal_pkr, status, created_at,
      order_items ( product_name_snapshot, quantity, line_total_pkr )
    `)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Orders</h1>
      <p style={{ opacity: 0.6, fontSize: 14, marginBottom: 24 }}>
        {orders?.length ?? 0} orders — Cash on Delivery
      </p>
      <OrdersTable initialOrders={orders ?? []} />
    </div>
  );
}
