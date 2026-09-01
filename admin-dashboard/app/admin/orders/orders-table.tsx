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
  const [exporting, setExporting] = useState(false);

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

  async function handleDownloadListPdf() {
    setExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      const title = statusFilter === 'all' ? 'All Orders' : statusFilter;

      doc.setFontSize(16);
      doc.text('Bright Spot — Orders', 14, 18);
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`${title} · ${filtered.length} orders · Generated ${new Date().toLocaleString()}`, 14, 25);

      autoTable(doc, {
        startY: 32,
        head: [['Order #', 'Customer', 'Phone', 'City', 'Total (PKR)', 'Status', 'Date']],
        body: filtered.map((o) => [
          o.order_number,
          o.customer_name,
          o.customer_phone,
          o.customer_city,
          Number(o.subtotal_pkr).toLocaleString(),
          o.status,
          new Date(o.created_at).toLocaleDateString(),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [249, 115, 22] },
      });

      doc.save(`bright-spot-orders-${statusFilter}-${Date.now()}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  async function handleDownloadReceipt(o: Order) {
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text('Bright Spot', 14, y); y += 8;
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text('Multan, Punjab, Pakistan', 14, y); y += 12;

    doc.setTextColor(0);
    doc.setFontSize(13);
    doc.text('Order Receipt', 14, y); y += 8;
    doc.setFontSize(10);
    doc.text(`Order ID: ${o.order_number}`, 14, y); y += 6;
    doc.text(`Date: ${new Date(o.created_at).toLocaleString()}`, 14, y); y += 6;
    doc.text(`Payment Method: Cash on Delivery`, 14, y); y += 6;
    doc.text(`Status: ${o.status}`, 14, y); y += 10;

    doc.setFontSize(11);
    doc.text('Customer Details', 14, y); y += 7;
    doc.setFontSize(10);
    doc.text(`Name: ${o.customer_name}`, 14, y); y += 6;
    doc.text(`Phone: ${o.customer_phone}`, 14, y); y += 6;
    const addressLines = doc.splitTextToSize(`Address: ${o.customer_address}, ${o.customer_city}`, 180);
    doc.text(addressLines, 14, y); y += addressLines.length * 6 + 2;
    if (o.notes) {
      const noteLines = doc.splitTextToSize(`Notes: ${o.notes}`, 180);
      doc.text(noteLines, 14, y); y += noteLines.length * 6 + 2;
    }
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Product', 'Qty', 'Total (PKR)']],
      body: o.order_items.map((it) => [it.product_name_snapshot, String(it.quantity), Number(it.line_total_pkr).toLocaleString()]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [249, 115, 22] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Due on Delivery: Rs ${Number(o.subtotal_pkr).toLocaleString()}`, 14, finalY);

    doc.save(`${o.order_number}-receipt.pdf`);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
        <button onClick={handleDownloadListPdf} disabled={exporting} style={pdfBtnStyle}>
          {exporting ? 'Generating…' : '⬇ Download PDF'}
        </button>
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
                    <button onClick={() => handleDownloadReceipt(o)} style={actionBtn('#f5f2fb')}>⬇ Download receipt PDF</button>
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
const pdfBtnStyle: React.CSSProperties = {
  padding: '8px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.25)',
  borderRadius: 6, color: '#f5f2fb', fontWeight: 500, fontSize: 13, cursor: 'pointer',
};
