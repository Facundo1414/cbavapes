'use client';

import { useEffect, useRef, useState } from 'react';
import FilterBar from '@/components/FilterBar';
import ProductList from '@/components/ProductList';
import { useProducts, ProductFull } from './api/products/useProducts';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Home() {
  const { products, loading } = useProducts();
  const [category, setCategory] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // Extraemos las categorías únicas (brands)
  const categories = Array.from(new Set(products.map((p) => p.brand || 'Otros')));
  const filteredProducts = products; 


  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    // Al entrar a la página
    document.body.classList.add('no-scroll');

    // Al salir de la página
  return () => {
    document.body.classList.remove('no-scroll');
  };
}, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const options = {
      root: container,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const cat = entry.target.getAttribute('data-category');
        if (entry.isIntersecting && cat && cat !== '__end-marker__') {
          setCategory(cat);
        }
      });
    }, options);

    categories.forEach((cat) => {
      const el = document.querySelector(`[data-category="${cat}"]`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  if (loading) {
    return (
      <main className="h-screen flex flex-col justify-center items-center">
        <LoadingSpinner className="w-8 h-8 mb-4" />
        <p className="text-sm text-muted-foreground">Cargando productos...</p>
      </main>
    )
  }


  return (
    <>
<main className="max-w-5xl mx-auto flex flex-col h-screen overflow-hidden">
  <div className="sticky top-0 z-40 bg-white h-14">
    <FilterBar
      onFilterChange={({ category }) => {
        setCategory(category);
        const el = document.getElementById(`category-${category.replace(/\s+/g, '-')}`);
        const container = containerRef.current;
        const filterHeight = 56; // h-14 en px

        if (category && el && container) {
          const elOffsetTop = el.offsetTop;
          // Scroll ajustado
          container.scrollTo({ top: elOffsetTop - filterHeight, behavior: 'smooth' });
        } else if (container) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }}
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
      products={filteredProducts}
      selectedCategory={category}
      dataAttribute={(cat) => ({
        'data-category': cat,
        id: `category-${cat.replace(/\s+/g, '-')}`,
      })}
    />
      {/* Espacio extra para scroll */}
      <div style={{ height: 120 }} />
      {/* End marker */}
      <div data-category="__end-marker__" className="h-1 invisible" />
  </div>
</main>



    </>
  );
}
