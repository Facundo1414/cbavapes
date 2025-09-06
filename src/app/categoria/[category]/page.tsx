import { notFound } from 'next/navigation';
import CategoryLayout from '@/components/CategoryLayout';
import { fetchProductsServer } from '@/app/api/products/fetchProductsServer';
import type { ProductFull } from '@/app/api/products/useProducts';
import { supabaseServer } from '@/utils/supabaseServer';

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params;
  const products: ProductFull[] = await fetchProductsServer();

  // Obtener la categoría desde Supabase
  const supabase = supabaseServer();
  const { data: categoryData, error } = await supabase
    .from('categories')
    .select('*')
    .eq('key', category)
    .single();

  if (!categoryData || error) return notFound();

  const brands: string[] = Array.from(
    new Set(products.filter((p: ProductFull) => p.category === category).map((p: ProductFull) => p.brand || 'Sin marca'))
  );

  return (
    <CategoryLayout
      title={categoryData.name}
      description={categoryData.description}
      brands={brands}
      products={products.filter((p: ProductFull) => p.category === category)}
      showBrandSelector={category === 'vapes'}
      categoryKey={category}
    />
  );
}
