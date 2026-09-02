// app/admin/page.tsx
import Link from 'next/link';

type Feature = { title: string; desc: string };
type Module = {
  emoji: string;
  title: string;
  status: 'available' | 'soon';
  href?: string;
  summary: string;
  features: Feature[];
};

const MODULES: Module[] = [
  {
    emoji: '📦',
    title: 'Product Management',
    status: 'available',
    href: '/admin/products',
    summary: 'Manage your catalog — stock, prices, visibility.',
    features: [
      { title: 'Inventory tracking', desc: 'Manually update stock levels per product.' },
      { title: 'Low stock indicator', desc: 'Visual "Low" / "Out of stock" flags on the list.' },
      { title: 'Bulk editing', desc: 'CSV import + quick price/photo grid in Power Editor.' },
      { title: 'Variant control', desc: 'Sizes, colors, and SKUs — not built yet.' },
      { title: 'Dynamic pricing', desc: 'Rule/date-based discounts — not built yet.' },
    ],
  },
  {
    emoji: '⚡',
    title: 'Power Editor',
    status: 'available',
    href: '/admin/power-editor',
    summary: 'Hero video, site text, WhatsApp number, and bulk product updates.',
    features: [
      { title: 'Hero banner replacement', desc: 'Upload or link a new video, live on the site instantly.' },
      { title: 'Site text & WhatsApp number', desc: 'Edit headline, subtext, and contact number everywhere at once.' },
      { title: 'Quick price & photo editor', desc: 'Fast inline updates across many products.' },
      { title: 'CSV bulk import', desc: 'Update price, description, and photos for many products at once.' },
    ],
  },
  {
    emoji: '🛒',
    title: 'Order Processing',
    status: 'available',
    href: '/admin/orders',
    summary: 'Track and manage Cash on Delivery orders.',
    features: [
      { title: 'Status tracking', desc: 'Pending → Confirmed → Packed → Shipped → Delivered.' },
      { title: 'PDF export', desc: 'Download the order list or a single order receipt.' },
      { title: 'Label printing', desc: 'Shipping slips/invoices — not built yet.' },
      { title: 'Fraud screening', desc: 'Suspicious order flagging — not built yet.' },
      { title: 'Split fulfillment', desc: 'Multi-warehouse shipping — not built yet.' },
    ],
  },
  {
    emoji: '📊',
    title: 'Financial Calculators',
    status: 'soon',
    summary: 'Profit margins, tax, shipping cost, ROI.',
    features: [
      { title: 'Profit margin calculator', desc: 'Factors in cost, shipping, and fees.' },
      { title: 'Tax automation', desc: 'Regional sales tax at checkout.' },
      { title: 'Discounts tool', desc: 'Validate coupon codes and percentage cuts.' },
      { title: 'ROI tracker', desc: 'Marketing spend vs. incoming sales.' },
      { title: 'Shipping estimator', desc: 'Carrier rates based on weight.' },
    ],
  },
  {
    emoji: '📒',
    title: 'Ledger & Accounting',
    status: 'soon',
    summary: 'Cash flow, reconciliation, payouts, audit trail.',
    features: [
      { title: 'Cash flow ledger', desc: 'Daily income and operational expenses.' },
      { title: 'Gateway reconciliation', desc: 'Match bank deposits with processor payouts.' },
      { title: 'Payout scheduler', desc: 'Track outstanding and settled balances.' },
      { title: 'Audit trails', desc: 'Every financial change, logged by staff member.' },
      { title: 'Tax reporting', desc: 'Clean export sheets for accounting software.' },
    ],
  },
  {
    emoji: '👥',
    title: 'Customer Management (CRM)',
    status: 'soon',
    summary: 'Purchase history, segments, support, loyalty.',
    features: [
      { title: 'Purchase history', desc: 'Lifetime value and past orders per customer.' },
      { title: 'Segment creator', desc: 'Group customers by behavior or spending.' },
      { title: 'Support timeline', desc: 'Help tickets and chat history in one place.' },
      { title: 'Account controls', desc: 'Reset passwords, ban fraudulent profiles.' },
      { title: 'Loyalty tracker', desc: 'Points earned and rewards claimed.' },
    ],
  },
  {
    emoji: '📈',
    title: 'Analytics & Reporting',
    status: 'soon',
    summary: 'Funnels, traffic sources, top sellers.',
    features: [
      { title: 'Conversion funnel', desc: 'Drop-off points in checkout.' },
      { title: 'Traffic sources', desc: 'Which channels drive sales.' },
      { title: 'Popular products', desc: 'Top sellers and dead stock.' },
    ],
  },
];

export default function AdminDashboardHub() {
  return (
    <div>
      <h1 style={{ fontSize: 30, marginBottom: 6, fontFamily: 'sans-serif' }}>Admin Dashboard</h1>
      <p style={{ opacity: 0.6, fontSize: 14, marginBottom: 32 }}>
        Everything for managing Bright Spot, in one place.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {MODULES.map((mod) => (
          <ModuleCard key={mod.title} mod={mod} />
        ))}
      </div>
    </div>
  );
}

function ModuleCard({ mod }: { mod: Module }) {
  const isAvailable = mod.status === 'available';

  const cardInner = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 22 }}>{mod.emoji}</span>
        <span
          style={{
            fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, letterSpacing: 0.3,
            background: isAvailable ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.08)',
            color: isAvailable ? '#4ade80' : 'rgba(245,242,251,0.5)',
          }}
        >
          {isAvailable ? 'Available' : 'Coming soon'}
        </span>
      </div>
      <h2 style={{ fontSize: 16, marginBottom: 4 }}>{mod.title}</h2>
      <p style={{ fontSize: 12.5, opacity: 0.6, marginBottom: 14, lineHeight: 1.4 }}>{mod.summary}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {mod.features.map((f) => (
          <li key={f.title} style={{ fontSize: 12, lineHeight: 1.4 }}>
            <strong style={{ opacity: 0.9 }}>{f.title}:</strong>{' '}
            <span style={{ opacity: 0.55 }}>{f.desc}</span>
          </li>
        ))}
      </ul>
    </>
  );

  const cardStyle: React.CSSProperties = {
    display: 'block', padding: 18, borderRadius: 10,
    border: '1px solid ' + (isAvailable ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.1)'),
    background: isAvailable ? 'rgba(249,115,22,0.04)' : 'rgba(255,255,255,0.015)',
    color: '#f5f2fb', textDecoration: 'none',
    opacity: isAvailable ? 1 : 0.75,
    transition: 'border-color .2s, transform .2s',
  };

  if (isAvailable && mod.href) {
    return (
      <Link href={mod.href} style={cardStyle} className="module-card-link">
        {cardInner}
      </Link>
    );
  }

  return <div style={{ ...cardStyle, cursor: 'not-allowed' }}>{cardInner}</div>;
}
