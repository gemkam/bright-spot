// app/admin/page.tsx
import { sql } from '@/lib/db';
import ProductsTable from './products-table';

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    sql`
      SELECT id, category_id, name, note, price_pkr, stock_quantity, is_active
      FROM products
      ORDER BY category_id, name
    `,
    sql`SELECT id, label, sort_order FROM categories ORDER BY sort_order`,
  ]);

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Products</h1>
      <p style={{ opacity: 0.6, fontSize: 14, marginBottom: 24 }}>
        {products.length} total across {categories.length} categories
      </p>
      <ProductsTable initialProducts={products as any} categories={categories as any} />
    </div>
  );
}
