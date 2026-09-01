// app/admin/page.tsx
import { createClient } from '@/lib/supabase/server';
import ProductsTable from './products-table';

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('id, category_id, name, note, price_pkr, stock_quantity, is_active')
      .order('category_id')
      .order('name'),
    supabase.from('categories').select('id, label, sort_order').order('sort_order'),
  ]);

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Products</h1>
      <p style={{ opacity: 0.6, fontSize: 14, marginBottom: 24 }}>
        {products?.length ?? 0} total across {categories?.length ?? 0} categories
      </p>
      <ProductsTable initialProducts={products ?? []} categories={categories ?? []} />
    </div>
  );
}
