'use client';

import { useState } from 'react';
import { addProduct, updateProduct, type ProductInput } from './actions';
import ImagePicker from './image-picker';

type Category = { id: string; label: string; sort_order: number };

type EditingProduct = {
  id: string;
  category_id: string;
  name: string;
  note: string;
  description?: string;
  price_pkr: number;
  stock_quantity: number;
  image_front?: string;
  image_back?: string;
};

export default function ProductForm({
  categories,
  editing,
  onClose,
  onSaved,
}: {
  categories: Category[];
  editing: EditingProduct | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductInput>({
    category_id: editing?.category_id ?? categories[0]?.id ?? '',
    name: editing?.name ?? '',
    note: editing?.note ?? '',
    description: editing?.description ?? '',
    price_pkr: editing?.price_pkr ?? 0,
    stock_quantity: editing?.stock_quantity ?? 0,
    image_front: editing?.image_front ?? '',
    image_back: editing?.image_back ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updateProduct(editing.id, form);
      } else {
        await addProduct(form);
      }
      onSaved();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>{editing ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#f5f2fb', fontSize: 20, cursor: 'pointer', opacity: 0.6 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} style={inputStyle} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Product name</label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} style={inputStyle} required />
          </div>

          <div>
            <label style={labelStyle}>Note (short spec, e.g. "Cotton, S-XXL")</label>
            <input type="text" value={form.note} onChange={(e) => set('note', e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Price (PKR)</label>
              <input type="number" min={0} value={form.price_pkr} onChange={(e) => set('price_pkr', Number(e.target.value))} style={inputStyle} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Stock quantity</label>
              <input type="number" min={0} value={form.stock_quantity} onChange={(e) => set('stock_quantity', Number(e.target.value))} style={inputStyle} required />
            </div>
          </div>

          <ImagePicker label="Front photo" value={form.image_front} onChange={(url) => set('image_front', url)} />
          <ImagePicker label="Back photo" value={form.image_back} onChange={(url) => set('image_back', url)} />

          {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button type="submit" disabled={saving} style={submitBtnStyle}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
            </button>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
  alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto', zIndex: 100,
};
const modalStyle: React.CSSProperties = {
  background: '#14101f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
  padding: 24, width: '100%', maxWidth: 460, color: '#f5f2fb',
};
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, opacity: 0.7, marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', background: '#1a1428', border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 6, color: '#fff', fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit',
};
const submitBtnStyle: React.CSSProperties = {
  flex: 1, padding: '10px 16px', background: 'linear-gradient(120deg, #FB923C, #F97316)',
  border: 'none', borderRadius: 6, color: '#1a0e05', fontWeight: 600, cursor: 'pointer',
};
const cancelBtnStyle: React.CSSProperties = {
  padding: '10px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 6, color: '#f5f2fb', cursor: 'pointer',
};
