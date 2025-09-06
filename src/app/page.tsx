'use client';

import { useEffect, useRef, useState } from 'react';
import CategoryLayout from '@/components/CategoryLayout';
import Link from 'next/link';
import { useProducts } from './api/products/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories } from './api/categories/useCategories';

export default function Home() {
  const { products, loading } = useProducts();
  const [category, setCategory] = useState('');
  const { categories, loading: loadingCategories } = useCategories();
  const containerRef = useRef<HTMLDivElement>(null);
  const manualScrollRef = useRef(false);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (manualScrollRef.current) return;

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
      const selector = `[data-category="${kebab(cat.key)}"]`;
      const el = document.querySelector(selector);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);


  if (loading || loadingCategories) {
    return (
      <main className="max-w-5xl mx-auto flex flex-col min-h-screen pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="relative aspect-[4/5] md:aspect-[4/3] w-full rounded-lg overflow-hidden">
              <div className="absolute inset-0">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6">
                <Skeleton className="h-8 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
  <main className="max-w-5xl mx-auto flex flex-col min-h-screen pt-5 px-4 sm:px-6 lg:px-8">
      {!category && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 px-0 sm:px-4 justify-center">
            {categories.map((cat, idx) => {
              const isLast = idx === categories.length - 1;
              const isOdd = categories.length % 2 === 1;
              const colSpan = isLast && isOdd ? 'md:col-span-2' : '';
              // Solo aplicar min/max width en desktop, nunca en mobile
              const style: Record<string, string> = {
                minHeight: '400px',
                maxHeight: '540px',
              };
              // En desktop, aplicar min/max width
              if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                style.minHeight = '400px';
                style.maxHeight = '540px';
                if (!(isLast && isOdd)) {
                  style.minWidth = '420px';
                  style.maxWidth = '600px';
                }
              } else {
                // En mobile, nunca minWidth/maxWidth
                delete style.minWidth;
                delete style.maxWidth;
              }
              // Si es la última y la cantidad es impar, quitar md:aspect-[4/3] para evitar que crezca de alto
              // Para la card solitaria, no usar aspect-* en desktop
              let aspectClass = 'aspect-[4/6] md:aspect-[4/3]';
              if (isLast && isOdd) aspectClass = 'aspect-[4/6] md:aspect-auto';
              return (
                <Link
                  key={cat.key}
                  href={`/categoria/${cat.key}`}
                  className={`relative group ${aspectClass} w-full rounded-2xl shadow-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 ${colSpan}`}
                  style={style}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                    <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3 md:mb-4 drop-shadow-2xl text-shadow-lg">{cat.name}</h2>
                    <p className="text-gray-100 text-base md:text-xl drop-shadow-lg max-w-full md:max-w-xl">{cat.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
      {/* Lista de productos filtrada */}
      {category && (
        <div className="flex flex-col gap-4 px-4 mt-8">
          <CategoryLayout
            title={categories.find((c) => c.key === category)?.name || category}
            description={categories.find((c) => c.key === category)?.description}
            brands={Array.from(new Set(products.filter((p) => p.category === category).map((p) => p.brand || 'Sin marca')))}
            products={products.filter((p) => p.category === category)}
            showBrandSelector={category === 'vapes'}
            categoryKey={category}
            loading={loading}
          />
        </div>
      )}

      {/* Cards de acceso rápido al final */}
      {!category && (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 mb-8">
          <Link
            href="/instructivo"
            className="flex flex-col items-center justify-center bg-white rounded-xl shadow-lg border-2 border-black px-8 py-8 w-full h-full min-h-[180px] hover:border-violet-600 transition-all duration-300"
          >
            <span className="text-2xl font-bold text-black mb-2">¿Qué sabor elegir?</span>
            <span className="text-gray-600 text-center">Guía para encontrar tu sabor ideal</span>
          </Link>
          <Link
            href="/faq"
            className="flex flex-col items-center justify-center bg-white rounded-xl shadow-lg border-2 border-black px-8 py-8 w-full h-full min-h-[180px] hover:border-blue-500 transition-all duration-300"
          >
            <span className="text-2xl font-bold text-black mb-2">Preguntas frecuentes</span>
            <span className="text-gray-600 text-center">Respuestas a dudas comunes</span>
          </Link>
        </div>
      )}
    </main>
  );
}

// 🔧 Util para convertir a kebab-case
function kebab(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-');
}

