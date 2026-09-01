'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateStock, toggleActive, deleteProduct } from './actions';
import ProductForm from './product-form';

type Product = {
  id: string;
  category_id: string;
  name: string;
  note: string;
  description?: string;
  price_pkr: number;
  stock_quantity: number;
  is_active: boolean;
  image_front?: string;
  image_back?: string;
};

type Category = { id: string; label: string; sort_order: number };

export default function ProductsTable({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const router = useRouter();

  const filtered = useMemo(() => {
    if (categoryFilter === 'all') return products;
    return products.filter((p) => p.category_id === categoryFilter);
  }, [products, categoryFilter]);

  function handleStockChange(id: string, value: string) {
    const qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 0) return;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock_quantity: qty } : p)));
    startTransition(() => updateStock(id, qty));
  }

  function handleToggleActive(id: string, current: boolean) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: !current } : p)));
    startTransition(() => toggleActive(id, !current));
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    startTransition(() => deleteProduct(id));
  }

  function openAddForm() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEditForm(p: Product) {
    setEditingProduct(p);
    setFormOpen(true);
  }

  function handleSaved() {
    setFormOpen(false);
    setEditingProduct(null);
    router.refresh();
  }

  const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setCategoryFilter('all')} style={filterBtnStyle(categoryFilter === 'all')}>
            All ({products.length})
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCategoryFilter(c.id)} style={filterBtnStyle(categoryFilter === c.id)}>
              {c.label} ({products.filter((p) => p.category_id === c.id).length})
            </button>
          ))}
        </div>
        <button onClick={openAddForm} style={addBtnStyle}>+ Add Product</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: 'left', opacity: 0.6, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
            <th style={th}>Product</th>
            <th style={th}>Category</th>
            <th style={th}>Price (PKR)</th>
            <th style={th}>Stock</th>
            <th style={th}>Active</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <td style={td}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {p.image_front && (
                    <img src={p.image_front} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ opacity: 0.5, fontSize: 12 }}>{p.note}</div>
                  </div>
                </div>
              </td>
              <td style={td}>{categoryLabel(p.category_id)}</td>
              <td style={td}>{Number(p.price_pkr).toLocaleString()}</td>
              <td style={td}>
                <input
                  type="number"
                  min={0}
                  value={p.stock_quantity}
                  onChange={(e) => handleStockChange(p.id, e.target.value)}
                  style={{ width: 70, background: '#1a1428', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '4px 8px', borderRadius: 4 }}
                />
                {p.stock_quantity === 0 && <span style={{ color: '#f87171', fontSize: 12, marginLeft: 6 }}>Out of stock</span>}
                {p.stock_quantity > 0 && p.stock_quantity <= 5 && <span style={{ color: '#fbbf24', fontSize: 12, marginLeft: 6 }}>Low</span>}
              </td>
              <td style={td}>
                <button
                  onClick={() => handleToggleActive(p.id, p.is_active)}
                  style={{
                    padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)',
                    background: p.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                    color: p.is_active ? '#4ade80' : 'rgba(255,255,255,0.5)', cursor: 'pointer',
                  }}
                >
                  {p.is_active ? 'Visible' : 'Hidden'}
                </button>
              </td>
              <td style={td}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEditForm(p)} style={rowActionBtn('#38bdf8')}>Edit</button>
                  <button onClick={() => handleDelete(p.id, p.name)} style={rowActionBtn('#f87171')}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isPending && <p style={{ opacity: 0.5, fontSize: 12, marginTop: 8 }}>Saving…</p>}

      {formOpen && (
        <ProductForm
          categories={categories}
          editing={editingProduct}
          onClose={() => { setFormOpen(false); setEditingProduct(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: '10px 12px', fontWeight: 500 };
const td: React.CSSProperties = { padding: '10px 12px' };
function filterBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 14px', borderRadius: 4, border: '1px solid ' + (active ? '#F97316' : 'rgba(255,255,255,0.2)'),
    background: active ? 'rgba(249,115,22,0.15)' : 'transparent', color: active ? '#FB923C' : '#f5f2fb',
    fontSize: 13, cursor: 'pointer',
  };
}
function rowActionBtn(color: string): React.CSSProperties {
  return {
    padding: '4px 10px', fontSize: 12, borderRadius: 4, border: `1px solid ${color}`,
    background: 'transparent', color, cursor: 'pointer',
  };
}
const addBtnStyle: React.CSSProperties = {
  padding: '8px 16px', background: 'linear-gradient(120deg, #FB923C, #F97316)',
  border: 'none', borderRadius: 6, color: '#1a0e05', fontWeight: 600, fontSize: 13, cursor: 'pointer',
};
