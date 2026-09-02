'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { bulkImportProducts, type CsvProductRow, type BulkImportResult } from '../actions';

// Accepts flexible header names, case-insensitive, so a CSV exported from
// different sources (or the reference products.csv used earlier in this
// project) still works without the user having to rename columns.
const HEADER_ALIASES: Record<string, keyof CsvProductRow> = {
  product_name: 'product_name',
  name: 'product_name',
  price_pkr: 'price_pkr',
  price: 'price_pkr',
  description: 'description',
  desc: 'description',
  image_front: 'image_front',
  front_image: 'image_front',
  img1: 'image_front',
  image_back: 'image_back',
  back_image: 'image_back',
  img2: 'image_back',
};

export default function CsvImportSection() {
  const [rows, setRows] = useState<CsvProductRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);
    setError('');
    setParsing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        try {
          const parsed: CsvProductRow[] = (results.data as any[]).map((raw) => {
            const row: Partial<CsvProductRow> = {};
            Object.entries(raw).forEach(([key, value]) => {
              const mapped = HEADER_ALIASES[key];
              if (!mapped || value === undefined || value === '') return;
              if (mapped === 'price_pkr') {
                row.price_pkr = Number(String(value).replace(/,/g, ''));
              } else {
                (row as any)[mapped] = String(value).trim();
              }
            });
            return row as CsvProductRow;
          }).filter((r) => r.product_name);

          if (parsed.length === 0) {
            setError('No usable rows found. Make sure the CSV has a "product_name" column (or "name").');
          }
          setRows(parsed);
        } catch (err: any) {
          setError(err?.message ?? 'Failed to parse CSV');
        } finally {
          setParsing(false);
        }
      },
      error: (err) => {
        setError(err.message);
        setParsing(false);
      },
    });
  }

  async function handleImport() {
    setImporting(true);
    setError('');
    try {
      const res = await bulkImportProducts(rows);
      setResult(res);
    } catch (err: any) {
      setError(err?.message ?? 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setRows([]);
    setFileName('');
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <section style={cardStyle}>
      <h2 style={sectionTitle}>Bulk Update via CSV</h2>
      <p style={{ opacity: 0.6, fontSize: 13, marginTop: -8, marginBottom: 16 }}>
        Upload a CSV to update price, description, and photos for many products at once. Products are matched by name — a row for a name that doesn't exist yet is skipped and reported, never created as a new product. Only the columns you include are changed; leave a column out (or blank) to leave that field untouched.
      </p>
      <p style={{ opacity: 0.5, fontSize: 12, marginBottom: 18, fontFamily: 'monospace' }}>
        Expected columns: product_name, price_pkr, description, image_front, image_back
      </p>

      {rows.length === 0 ? (
        <div>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFile} disabled={parsing} style={{ fontSize: 13 }} />
          {parsing && <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>Reading file…</p>}
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 13, marginBottom: 10 }}>
            <strong>{fileName}</strong> — {rows.length} row{rows.length === 1 ? '' : 's'} ready to import
          </p>

          <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ opacity: 0.6, textAlign: 'left', position: 'sticky', top: 0, background: '#14101f' }}>
                  <th style={{ padding: '6px 10px' }}>Product</th>
                  <th style={{ padding: '6px 10px' }}>Price</th>
                  <th style={{ padding: '6px 10px' }}>Description</th>
                  <th style={{ padding: '6px 10px' }}>Photos</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <td style={{ padding: '6px 10px' }}>{r.product_name}</td>
                    <td style={{ padding: '6px 10px' }}>{r.price_pkr ?? '—'}</td>
                    <td style={{ padding: '6px 10px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description ?? '—'}</td>
                    <td style={{ padding: '6px 10px' }}>{[r.image_front && 'front', r.image_back && 'back'].filter(Boolean).join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleImport} disabled={importing} style={saveBtnStyle}>
              {importing ? 'Importing…' : `Apply to ${rows.length} product${rows.length === 1 ? '' : 's'}`}
            </button>
            <button onClick={reset} disabled={importing} style={cancelBtnStyle}>Cancel</button>
          </div>
        </div>
      )}

      {error && <p style={{ color: '#f87171', fontSize: 13, marginTop: 14 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: '#4ade80', fontSize: 14, marginBottom: 8 }}>
            ✓ Updated {result.updated.length} product{result.updated.length === 1 ? '' : 's'}
          </p>
          {result.notFound.length > 0 && (
            <div>
              <p style={{ color: '#fbbf24', fontSize: 13, marginBottom: 6 }}>
                {result.notFound.length} row{result.notFound.length === 1 ? '' : 's'} skipped (no matching product name):
              </p>
              <ul style={{ fontSize: 12, opacity: 0.7, paddingLeft: 18 }}>
                {result.notFound.map((name, i) => <li key={i}>{name}</li>)}
              </ul>
            </div>
          )}
          <button onClick={reset} style={{ ...cancelBtnStyle, marginTop: 12 }}>Import another file</button>
        </div>
      )}
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: 22, background: 'rgba(255,255,255,0.02)',
};
const sectionTitle: React.CSSProperties = { fontSize: 17, marginBottom: 6 };
const saveBtnStyle: React.CSSProperties = {
  padding: '9px 18px', background: 'linear-gradient(120deg, #FB923C, #F97316)', border: 'none',
  borderRadius: 6, color: '#1a0e05', fontWeight: 600, fontSize: 13, cursor: 'pointer',
};
const cancelBtnStyle: React.CSSProperties = {
  padding: '9px 18px', background: 'none', border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 6, color: '#f5f2fb', fontSize: 13, cursor: 'pointer',
};
