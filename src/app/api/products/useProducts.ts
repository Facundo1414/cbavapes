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
    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        setProducts(data);
        setLoading(false);
      } catch (e) {
        console.warn('Error reading cached data', e);
      }
    }

    async function checkForUpdates() {
      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        const newHash = await hashString(json.csvContent);

        const cached = localStorage.getItem(CACHE_KEY);
        const oldHash = cached ? JSON.parse(cached).hash : null;

        if (newHash !== oldHash) {
          setProducts(json.products);
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ hash: newHash, data: json.products })
          );
        }
      } catch (e) {
        console.error('Error fetching products:', e);
      } finally {
        setLoading(false);
      }
    }

    checkForUpdates();

    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { products, loading };
}
