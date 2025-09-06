"use client";
import React from 'react';
import { useState } from 'react';
import type { ProductFull } from '@/app/api/products/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/PageHeader';
import ProductList from '@/components/ProductList';

interface CategoryLayoutProps {
  title: string;
  description?: string;
  brands: string[];
  products: ProductFull[];
  showBrandSelector?: boolean;
  categoryKey: string;
}

export default function CategoryLayout({
  title,
  description,
  brands,
  products,
  showBrandSelector = false,
  categoryKey,
  loading = false,
}: CategoryLayoutProps & { loading?: boolean }) {
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas');


  // Si hay selector, filtrar productos por marca
  const filteredProducts =
    showBrandSelector && selectedBrand && selectedBrand !== 'Todas'
      ? products.filter((p) => (p.brand || 'Sin marca') === selectedBrand)
      : products;

  // Ordenar marcas alfabéticamente (excepto 'Todas' que va primero)
  const sortedBrands = [...brands].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

  // Ordenar productos alfabéticamente por nombre
  const sortedProducts = [...filteredProducts].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' }));

  return (
    <section className="w-full max-w-4xl mx-auto px-4 md:px-8">
      {loading ? (
        <div className="py-12">
          <Skeleton className="h-8 w-1/2 mb-6 mx-auto" />
          <div className="flex gap-4 mb-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-32 rounded-full" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className='pt-2'>
            
            <PageHeader title={title} />

          </div>
  {description && <p className="text-gray-500 mb-4 text-center">{description}</p>}


      {(
        <div className="mb-6 overflow-x-auto overflow-y-hidden px-1 md:px-2">
          <div className="flex gap-2 w-max min-w-full">
            {['Todas', ...sortedBrands].map((brand, idx) => (
              <RippleChip
                key={brand}
                brand={brand}
                selected={selectedBrand === brand}
                onClick={() => setSelectedBrand(brand)}
                index={idx}
              />
            ))}
          </div>
        </div>
      )}

      <ProductList
        products={sortedProducts}
        selectedCategory={categoryKey}
      />
      </>
      )}
    </section>
  );
}


// --- RippleChip con animación de entrada y ripple effect ---
function RippleChip({ brand, selected, onClick, index }: { brand: string; selected: boolean; onClick: () => void; index: number }) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [show, setShow] = React.useState(false);

  // Animación de entrada (fade + slide)
  React.useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 40 * index);
    return () => clearTimeout(timeout);
  }, [index]);

  // Ripple effect
  const handleClick = (e: React.MouseEvent) => {
    const button = btnRef.current;
    if (!button) return;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.className = 'ripple-chip-effect';
    button.appendChild(circle);
    setTimeout(() => circle.remove(), 500);
    onClick();
  };

  React.useEffect(() => {
    // Inyectar CSS para ripple solo una vez
    if (typeof window !== 'undefined' && !document.getElementById('ripple-chip-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-chip-style';
      style.innerHTML = `
        .ripple-chip-effect {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          animation: ripple-chip 0.5s linear;
          background: rgba(255,255,255,0.5);
          pointer-events: none;
          z-index: 10;
        }
        @keyframes ripple-chip {
          to {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <button
      ref={btnRef}
      type="button"
      className={`px-4 py-2 rounded-full border whitespace-nowrap text-sm font-medium relative overflow-hidden
        transition-transform duration-200 ease-in-out
        ${selected
          ? 'bg-primary text-white border-primary shadow scale-105'
          : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:scale-105 active:scale-95'}
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
      style={{ willChange: 'transform, opacity', transitionProperty: 'transform, opacity, box-shadow, background, color' }}
      onClick={handleClick}
    >
      {brand}
    </button>
  );
}
