import { useEffect, useState, useRef } from 'react';

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
const CACHE_HASH_KEY = 'cachedProductsHashes';

export function useProducts() {
  const [products, setProducts] = useState<ProductFull[]>([]);
  const [loading, setLoading] = useState(true);

  const initialHash = useRef({ productHash: '', flavorHash: '' });

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedHashes = localStorage.getItem(CACHE_HASH_KEY);

    if (cached && cachedHashes) {
      try {
        const { data } = JSON.parse(cached);
        const hashes = JSON.parse(cachedHashes);
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          initialHash.current = hashes;
        }
      } catch {
        // Ignorar errores de cache
      } finally {
        setLoading(false);
      }
    }

    if (!initialHash.current.flavorHash) {
      checkForUpdates();
    }
    checkForUpdates();

    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
    return () => clearInterval(interval);

    async function checkForUpdates() {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);

        const json = await res.json();

        const newHashes = {
          productHash: json.productHash,
          flavorHash: json.flavorHash,
        };

        if (
          newHashes.productHash !== initialHash.current.productHash ||
          newHashes.flavorHash !== initialHash.current.flavorHash
        ) {
          setProducts(json.products);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: json.products }));
          localStorage.setItem(CACHE_HASH_KEY, JSON.stringify(newHashes));
          initialHash.current = newHashes;
        }
      } catch {
        // Manejar error si quieres
      } finally {
        setLoading(false);
      }
    }
  }, []);

  return { products, loading };
}
