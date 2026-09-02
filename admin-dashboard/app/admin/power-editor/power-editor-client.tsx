'use client';

import { useState, useMemo, useTransition } from 'react';
import { updateSiteSettings, quickUpdateProduct, type SiteSettings } from '../actions';
import VideoPicker from './video-picker';
import ImagePicker from '../image-picker';

type Product = {
  id: string;
  category_id: string;
  name: string;
  note: string;
  price_pkr: number;
  image_front: string;
  image_back: string;
};
type Category = { id: string; label: string; sort_order: number };

export default function PowerEditorClient({
  initialSettings,
  products,
  categories,
}: {
  initialSettings: SiteSettings;
  products: Product[];
  categories: Category[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 760 }}>
      <div>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>⚡ Power Editor</h1>
        <p style={{ opacity: 0.6, fontSize: 14 }}>
          Full control over the storefront — hero video, headline text, WhatsApp number, and every product's price and photos.
          Changes here go live on the site without needing a new deploy.
        </p>
      </div>

      <SiteSettingsSection initialSettings={initialSettings} />
      <ProductQuickEditSection products={products} categories={categories} />
    </div>
  );
}

// ==================== Site Settings (hero video, text, WhatsApp) ====================

function SiteSettingsSection({ initialSettings }: { initialSettings: SiteSettings }) {
  const [form, setForm] = useState<SiteSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await updateSiteSettings(form);
      setSaved(true);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={cardStyle}>
      <h2 style={sectionTitle}>Hero Banner &amp; Site Info</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <VideoPicker
          label="Hero background video"
          value={form.hero_video_url || ''}
          onChange={(url) => set('hero_video_url', url)}
        />

        <div>
          <label style={labelStyle}>Hero headline</label>
          <input
            type="text"
            value={form.hero_headline || ''}
            onChange={(e) => set('hero_headline', e.target.value)}
            placeholder="Everything your home needs, delivered across Multan."
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Hero subtext</label>
          <textarea
            value={form.hero_subtext || ''}
            onChange={(e) => set('hero_subtext', e.target.value)}
            placeholder="Home & kitchen, beauty, electronics, and fashion — all in one place…"
            style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={labelStyle}>WhatsApp number (used for orders, share buttons, and the floating chat icon)</label>
          <input
            type="text"
            value={form.whatsapp_number || ''}
            onChange={(e) => set('whatsapp_number', e.target.value)}
            placeholder="923001234567"
            style={inputStyle}
          />
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
        {saved && <p style={{ color: '#4ade80', fontSize: 13 }}>Saved — live on the site now.</p>}

        <button onClick={handleSave} disabled={saving} style={saveBtnStyle}>
          {saving ? 'Saving…' : 'Save Site Settings'}
        </button>
      </div>
    </section>
  );
}

// ==================== Quick Product Price & Photo Editor ====================

function ProductQuickEditSection({ products: initialProducts, categories }: { products: Product[]; categories: Category[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [savedId, setSavedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (categoryFilter === 'all') return products;
    return products.filter((p) => p.category_id === categoryFilter);
  }, [products, categoryFilter]);

  function updateLocal(id: string, patch: Partial<Product>) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function saveProduct(p: Product) {
    startTransition(async () => {
      await quickUpdateProduct(p.id, {
        price_pkr: p.price_pkr,
        image_front: p.image_front,
        image_back: p.image_back,
      });
      setSavedId(p.id);
      setTimeout(() => setSavedId((cur) => (cur === p.id ? null : cur)), 1500);
    });
  }

  return (
    <section style={cardStyle}>
      <h2 style={sectionTitle}>Quick Product Price &amp; Photo Editor</h2>
      <p style={{ opacity: 0.6, fontSize: 13, marginTop: -8, marginBottom: 16 }}>
        For editing name, description, or stock, use the regular Edit button on the Products page instead — this view is for fast price/photo updates across many products.
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <button onClick={() => setCategoryFilter('all')} style={filterBtnStyle(categoryFilter === 'all')}>All</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setCategoryFilter(c.id)} style={filterBtnStyle(categoryFilter === c.id)}>{c.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((p) => {
          const isOpen = expandedId === p.id;
          return (
            <div key={p.id} style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {p.image_front && <img src={p.image_front} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, opacity: 0.6 }}>Rs</span>
                  <input
                    type="number"
                    value={p.price_pkr}
                    onChange={(e) => updateLocal(p.id, { price_pkr: Number(e.target.value) })}
                    onBlur={() => saveProduct(p)}
                    style={{ width: 90, background: '#1a1428', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '5px 8px', borderRadius: 4, fontSize: 13 }}
                  />
                </div>
                <button onClick={() => setExpandedId(isOpen ? null : p.id)} style={rowBtnStyle}>
                  {isOpen ? 'Close' : 'Edit photos'}
                </button>
                {savedId === p.id && <span style={{ color: '#4ade80', fontSize: 12 }}>Saved</span>}
              </div>

              {isOpen && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <ImagePicker label="Front photo" value={p.image_front} onChange={(url) => updateLocal(p.id, { image_front: url })} />
                  </div>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <ImagePicker label="Back photo" value={p.image_back} onChange={(url) => updateLocal(p.id, { image_back: url })} />
                  </div>
                  <div style={{ width: '100%' }}>
                    <button onClick={() => saveProduct(p)} style={saveBtnStyle}>Save Photos</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {isPending && <p style={{ opacity: 0.5, fontSize: 12, marginTop: 10 }}>Saving…</p>}
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: 22, background: 'rgba(255,255,255,0.02)',
};
const sectionTitle: React.CSSProperties = { fontSize: 17, marginBottom: 16 };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, opacity: 0.7, marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', background: '#1a1428', border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 6, color: '#fff', fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit',
};
const saveBtnStyle: React.CSSProperties = {
  padding: '9px 18px', background: 'linear-gradient(120deg, #FB923C, #F97316)', border: 'none',
  borderRadius: 6, color: '#1a0e05', fontWeight: 600, fontSize: 13, cursor: 'pointer', alignSelf: 'flex-start',
};
const rowBtnStyle: React.CSSProperties = {
  padding: '5px 12px', fontSize: 12, borderRadius: 4, border: '1px solid #38bdf8', background: 'transparent', color: '#38bdf8', cursor: 'pointer',
};
function filterBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 14px', borderRadius: 4, border: '1px solid ' + (active ? '#F97316' : 'rgba(255,255,255,0.2)'),
    background: active ? 'rgba(249,115,22,0.15)' : 'transparent', color: active ? '#FB923C' : '#f5f2fb', fontSize: 13, cursor: 'pointer',
  };
}
