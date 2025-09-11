'use client'
import { notFound } from 'next/navigation';
import CategoryLayout from '@/components/CategoryLayout';
import { fetchProductsServer } from '@/app/api/products/fetchProductsServer';
import type { ProductFull } from '@/app/api/products/useProducts';
import { supabaseServer } from '@/utils/supabaseServer';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

interface Category {
  name: string;
  description: string;
  key: string;
}

interface PageProps {
  params: Promise<{ category: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function CategoryPage({ params }: PageProps) {
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<Category | null>(null);
  const [products, setProducts] = useState<ProductFull[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { category } = await params;

      // Obtener productos y categoría
      const fetchedProducts: ProductFull[] = await fetchProductsServer(category);
      const supabase = supabaseServer();
      const { data: fetchedCategoryData, error } = await supabase
        .from('categories')
        .select('*')
        .eq('key', category)
        .single();

      if (!fetchedCategoryData || error) {
        setLoading(false);
        return notFound();
      }

      setCategoryData(fetchedCategoryData);
      setProducts(fetchedProducts);
      setBrands(
        Array.from(
          new Set(
            fetchedProducts
              .filter((p: ProductFull) => p.category === category)
              .map((p: ProductFull) => p.brand || 'Sin marca')
          )
        )
      );
      setLoading(false);
    }

    fetchData();
  }, [params]);

  return (
    <CategoryLayout
      title={categoryData?.name || ''}
      description={categoryData?.description || ''}
      brands={brands}
      products={products.filter((p: ProductFull) => p.category === categoryData?.key)}
      showBrandSelector={categoryData?.key === 'vapes'}
      categoryKey={categoryData?.key || ''}
      loading={loading}
    />
  );
}
