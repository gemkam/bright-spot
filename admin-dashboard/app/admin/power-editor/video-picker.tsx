'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function VideoPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [mode, setMode] = useState<'link' | 'upload'>('link');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError('File too large — 50MB max. Compress it first (Clipchamp, HandBrake, etc.).');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const path = `hero-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('site-assets').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, opacity: 0.7, marginBottom: 6 }}>{label}</label>

      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button type="button" onClick={() => setMode('link')} style={tabStyle(mode === 'link')}>Paste link</button>
        <button type="button" onClick={() => setMode('upload')} style={tabStyle(mode === 'upload')}>Upload file</button>
      </div>

      {mode === 'link' ? (
        <input type="text" placeholder="https://…" value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      ) : (
        <div>
          <input type="file" accept="video/*" onChange={handleFile} disabled={uploading} style={{ fontSize: 13 }} />
          {uploading && <p style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>Uploading… large files may take a minute.</p>}
        </div>
      )}
      {error && <p style={{ fontSize: 12, color: '#f87171', marginTop: 6 }}>{error}</p>}

      {value && (
        <video src={value} muted loop autoPlay playsInline style={{ width: '100%', maxWidth: 320, marginTop: 10, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)' }} />
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', background: '#1a1428', border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box',
};
function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: '4px 10px', fontSize: 12, borderRadius: 4, border: '1px solid ' + (active ? '#F97316' : 'rgba(255,255,255,0.2)'),
    background: active ? 'rgba(249,115,22,0.15)' : 'transparent', color: active ? '#FB923C' : '#f5f2fb', cursor: 'pointer',
  };
}
