'use client';

import { useEffect, useRef, useState } from 'react';
import FilterBar from '@/components/FilterBar';
import ProductList from '@/components/ProductList';
import { useProducts, ProductFull } from './api/products/useProducts';

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
      <main className="h-screen flex justify-center items-center">
        <p className="text-lg">Cargando productos...</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto flex flex-col h-screen overflow-hidden">
      <h1 className="text-3xl font-bold py-2 text-center">CBA VAPES</h1>

      <div className="sticky top-14 z-20 bg-white bottom-5" style={{ height: '56px' }}>
        <FilterBar
          onFilterChange={({ category }) => {
            setCategory(category);
            const el = document.getElementById(`category-${category.replace(/\s+/g, '-')}`);
            const container = containerRef.current;
            const headerHeight = 72;

            if (category && el && container) {
              const elOffsetTop = el.offsetTop;
              container.scrollTo({ top: elOffsetTop - headerHeight, behavior: 'smooth' });
            } else if (container) {
              container.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          categories={categories}
          selectedCategory={category}
        />
      </div>

      <div
        id="scroll-container"
        ref={containerRef}
        className="flex-grow overflow-y-scroll h-[calc(100vh-72px)] relative z-0 pb-32 px-4 top-2"
        style={{ scrollPaddingTop: '3.5rem' }}
      >
        <ProductList
          products={filteredProducts}
          selectedCategory={category}
          dataAttribute={(cat) => ({
            'data-category': cat,
            id: `category-${cat.replace(/\s+/g, '-')}`,
          })}
        />
        {/* Invisible end-marker sin dejar espacio visible extra */}
        <div data-category="__end-marker__" className="h-1 invisible" />
      </div>
    </main>
  );
}
