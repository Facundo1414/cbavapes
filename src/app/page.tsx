'use client';

import { useEffect, useRef, useState } from 'react';
import FilterBar from '@/components/FilterBar';
import ProductList from '@/components/ProductList';
import { useProducts } from './api/products/useProducts';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Home() {
  const { products, loading } = useProducts();
  const [category, setCategory] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const manualScrollRef = useRef(false); // 👈 Nuevo ref para controlar scroll programático

const categories = Array.from(new Set((products || []).map((p) => p.brand || 'Otros')));

useEffect(() => {
  document.body.classList.add('no-scroll');
  return () => {
    document.body.classList.remove('no-scroll');
  };
}, []);


  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (manualScrollRef.current) return; // 👈 Ignorar mientras es scroll programado

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        const firstVisible = visible[0];
        const cat = firstVisible?.target?.getAttribute('data-category');
        if (cat && cat !== '__end-marker__') {
          setCategory(cat);
        }
      },
      {
        root: container,
        rootMargin: '0px 0px -50% 0px',
        threshold: 0.1,
      }
    );

    categories.forEach((cat) => {
      const selector = `[data-category="${kebab(cat)}"]`;
      const el = document.querySelector(selector);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  const handleCategoryChange = ({ category }: { category: string }) => {
    setCategory(category);
    const el = document.getElementById(`category-${kebab(category)}`);
    const container = containerRef.current;
    const filterHeight = 56;

    if (el && container) {
      manualScrollRef.current = true;

      const offset = el.offsetTop;
      container.scrollTo({ top: offset - filterHeight, behavior: 'smooth' });

      // Esperamos un poco antes de permitir que el observer vuelva a activar
      setTimeout(() => {
        manualScrollRef.current = false;
      }, 800); // Ajustable
    }
  };

  if (loading) {
    return (
      <main className="h-screen flex flex-col justify-center items-center">
        <LoadingSpinner className="w-8 h-8 mb-4" />
        <p className="text-sm text-muted-foreground">Cargando productos...</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto flex flex-col min-h-screen pt-20 .body.no-scroll">
      <div className="sticky top-0 z-40 bg-white h-14">
        <FilterBar
          onFilterChange={handleCategoryChange}
          categories={categories}
          selectedCategory={category}
        />
      </div>

      <div
        ref={containerRef}
        className="flex-grow overflow-y-scroll h-[calc(100vh-64px)] relative z-0 pb-32 px-4 mt-8"
        style={{ scrollPaddingTop: '56px' }}
      >
        <ProductList
          products={products}
          selectedCategory={category}
          dataAttribute={(cat) => ({
            'data-category': kebab(cat),
            id: `category-${kebab(cat)}`,
          })}
        />
        <div style={{ height: 120 }} />
        <div data-category="__end-marker__" className="h-1 invisible" />
      </div>
    </main>
  );
}

// 🔧 Util para convertir a kebab-case
function kebab(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-');
}
