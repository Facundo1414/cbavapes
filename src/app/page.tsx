'use client';

import { useEffect, useRef, useState } from 'react';
import FilterBar from '@/components/FilterBar';
import ProductList from '@/components/ProductList';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  available?: boolean;
};

const products: Product[] = [
  {
    id: 1,
    name: 'Lost Mary 30K',
    category: 'Lost Mary',
    price: 3000,
    image: 'https://picsum.photos/id/1011/400/300',
  },
  {
    id: 2,
    name: 'Priv Bar 15K',
    category: 'Priv Bar',
    price: 1500,
    image: 'https://picsum.photos/id/1012/400/300',
  },
  {
    id: 3,
    name: 'Elfbar 30K TE',
    category: 'Elfbar',
    price: 3200,
    image: 'https://picsum.photos/id/1013/400/300',
  },
  {
    id: 4,
    name: 'Rabbeats Touch 10K',
    category: 'Rabbeats',
    price: 1200,
    image: 'https://picsum.photos/id/1014/400/300',
    available: false,
  },
  {
    id: 5,
    name: 'Lost Mary 15K',
    category: 'Lost Mary',
    price: 1700,
    image: 'https://picsum.photos/id/1015/400/300',
  },
  {
    id: 6,
    name: 'Priv Bar 30K',
    category: 'Priv Bar',
    price: 2800,
    image: 'https://picsum.photos/id/1016/400/300',
  },
  {
    id: 7,
    name: 'Elfbar 15K',
    category: 'Elfbar',
    price: 1600,
    image: 'https://picsum.photos/id/1018/400/300',
  },
  {
    id: 8,
    name: 'Rabbeats Touch 15K',
    category: 'Rabbeats',
    price: 1700,
    image: 'https://picsum.photos/id/1019/400/300',
  },
  {
    id: 9,
    name: 'Lost Mary Ice 20K',
    category: 'Lost Mary',
    price: 2200,
    image: 'https://picsum.photos/id/1020/400/300',
  },
  {
    id: 10,
    name: 'Priv Bar Ice 20K',
    category: 'Priv Bar',
    price: 2100,
    image: 'https://picsum.photos/id/1021/400/300',
  },
  {
    id: 11,
    name: 'Elfbar Max 50K',
    category: 'Elfbar',
    price: 5500,
    image: 'https://picsum.photos/id/1022/400/300',
  },
  {
    id: 12,
    name: 'Rabbeats Mini 10K',
    category: 'Rabbeats',
    price: 1100,
    image: 'https://picsum.photos/id/1023/400/300',
  },
  {
    id: 13,
    name: 'Lost Mary Pro 25K',
    category: 'Lost Mary',
    price: 2500,
    image: 'https://picsum.photos/id/1024/400/300',
  },
  {
    id: 14,
    name: 'Priv Bar Pro 25K',
    category: 'Priv Bar',
    price: 2600,
    image: 'https://picsum.photos/id/1025/400/300',
  },
  {
    id: 15,
    name: 'Elfbar Nano 15K',
    category: 'Elfbar',
    price: 1700,
    image: 'https://picsum.photos/id/1026/400/300',
  },
];


export default function Home() {
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const [category, setCategory] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

useEffect(() => {
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
      rootMargin: '-50% 0px -50% 0px', // 🔧 menos exigente
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

  const filteredProducts = products.filter((product) => product.available !== false);

  return (
    <main className="max-w-5xl mx-auto flex flex-col h-screen overflow-hidden">
      <h1 className="text-3xl font-bold py-2 text-center">CBA VAPES</h1>

      <FilterBar
        onFilterChange={({ category }) => {
          setCategory(category);
          const el = document.getElementById(`category-${category.replace(/\s+/g, '-')}`);
          if (category && el && containerRef.current) {
            containerRef.current.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
          } else if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        categories={categories}
        selectedCategory={category}
        
      />

      <div
        id="scroll-container"
        ref={containerRef}
        className="flex-grow overflow-y-auto relative z-0 pb-32 top-5 px-4"
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
        {/* 🔽 Invisible end-marker sin dejar espacio visible extra */}
        <div data-category="__end-marker__" className="h-1 invisible" />
      </div>
    </main>
  );
}


