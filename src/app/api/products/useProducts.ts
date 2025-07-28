import { useEffect, useState } from 'react';

export type ProductFull = {
  productId: string;
  brand: string;
  name: string;
  images: string[];
  price: number;
  flavors: {
    flavorId: string;
    productId: string;
    flavor: string;
    stock: number;
    purchasedQuantity: number;
    quantitySold: number;
    discountsGifts: number;
    totalSales: number;
    actualTotalSales: number;
  }[];
};

const CACHE_KEY = 'cachedProducts';

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function useProducts() {
  const [products, setProducts] = useState<ProductFull[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const cached = localStorage.getItem(CACHE_KEY);
  let initialHash: string | null = null;

  if (cached) {
    try {
      const { data, hash } = JSON.parse(cached);
      initialHash = hash;
      setProducts(data);
      setLoading(false);
    } catch (e) {
      console.warn('Error leyendo cache:', e);
    }
  }

  // 👇 Solo hacé el fetch si no hay datos en cache
  if (!initialHash) {
    checkForUpdates(); // hace fetch solo si no había nada en cache
  }

  const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
  return () => clearInterval(interval);

  async function checkForUpdates() {
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      const newHash = await hashString(json.csvContent);

      if (newHash !== initialHash) {
        setProducts(json.products);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ hash: newHash, data: json.products }));
      }
    } catch (e) {
      console.error('Error al actualizar productos:', e);
    } finally {
      setLoading(false);
    }
  }
}, []);


  return { products, loading };
}
