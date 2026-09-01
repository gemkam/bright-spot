'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatus, type OrderStatus } from '../actions';

type OrderItem = { product_name_snapshot: string; quantity: number; line_total_pkr: number };
type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  notes: string | null;
  subtotal_pkr: number;
  status: OrderStatus;
  created_at: string;
  order_items: OrderItem[];
};

const FLOW: OrderStatus[] = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#94a3b8', confirmed: '#38bdf8', packed: '#a78bfa',
  shipped: '#fb923c', delivered: '#4ade80', cancelled: '#f87171', returned: '#f87171',
};

export default function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

  function setStatus(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    startTransition(() => updateOrderStatus(id, status));
  }

  function nextStatus(current: OrderStatus): OrderStatus | null {
    const idx = FLOW.indexOf(current);
    if (idx === -1 || idx === FLOW.length - 1) return null;
    return FLOW[idx + 1];
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(['all', ...FLOW, 'cancelled', 'returned'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '6px 14px', borderRadius: 4, border: '1px solid ' + (statusFilter === s ? '#F97316' : 'rgba(255,255,255,0.2)'),
              background: statusFilter === s ? 'rgba(249,115,22,0.15)' : 'transparent',
              color: statusFilter === s ? '#FB923C' : '#f5f2fb', fontSize: 13, cursor: 'pointer', textTransform: 'capitalize',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((o) => {
          const next = nextStatus(o.status);
          const isOpen = expanded === o.id;
          return (
            <div key={o.id} style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: 14 }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setExpanded(isOpen ? null : o.id)}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{o.order_number} — {o.customer_name}</div>
                  <div style={{ opacity: 0.6, fontSize: 12, marginTop: 2 }}>
                    {o.customer_phone} · {o.customer_city} · Rs {Number(o.subtotal_pkr).toLocaleString()}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: STATUS_COLORS[o.status],
                    border: `1px solid ${STATUS_COLORS[o.status]}`, borderRadius: 4, padding: '3px 10px',
                  }}
                >
                  {o.status}
                </span>
              </div>

              {isOpen && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 13 }}>
                  <div style={{ opacity: 0.7, marginBottom: 8 }}>{o.customer_address}</div>
                  {o.notes && <div style={{ opacity: 0.6, marginBottom: 8, fontStyle: 'italic' }}>Note: {o.notes}</div>}
                  <div style={{ marginBottom: 12 }}>
                    {o.order_items.map((it, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.85, marginBottom: 4 }}>
                        <span>{it.product_name_snapshot} × {it.quantity}</span>
                        <span>Rs {Number(it.line_total_pkr).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {next && (
                      <button onClick={() => setStatus(o.id, next)} style={actionBtn(STATUS_COLORS[next])}>
                        Mark as {next}
                      </button>
                    )}
                    {o.status !== 'cancelled' && o.status !== 'delivered' && o.status !== 'returned' && (
                      <button onClick={() => setStatus(o.id, 'cancelled')} style={actionBtn('#f87171')}>Cancel order</button>
                    )}
                    {o.status === 'delivered' && (
                      <button onClick={() => setStatus(o.id, 'returned')} style={actionBtn('#f87171')}>Mark as returned</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p style={{ opacity: 0.5 }}>No orders in this status.</p>}
      </div>
      {isPending && <p style={{ opacity: 0.5, fontSize: 12, marginTop: 8 }}>Saving…</p>}
    </div>
  );
}

function actionBtn(color: string): React.CSSProperties {
  return { padding: '6px 14px', borderRadius: 4, border: `1px solid ${color}`, background: 'transparent', color, fontSize: 13, cursor: 'pointer' };
}
