// app/admin/power-editor/page.tsx
import { createClient } from '@/lib/supabase/server';
import PowerEditorClient from './power-editor-client';

export default async function PowerEditorPage() {
  const supabase = await createClient();

  const [{ data: settings }, { data: products }, { data: categories }] = await Promise.all([
    supabase.from('site_settings').select('*').eq('id', 1).single(),
    supabase
      .from('products')
      .select('id, category_id, name, note, price_pkr, image_front, image_back')
      .order('category_id')
      .order('name'),
    supabase.from('categories').select('id, label, sort_order').order('sort_order'),
  ]);

  return (
    <PowerEditorClient
      initialSettings={settings ?? { hero_video_url: '', hero_headline: '', hero_subtext: '', whatsapp_number: '' }}
      products={products ?? []}
      categories={categories ?? []}
    />
  );
}
