import { useEffect, useState } from "react";

export type Flavor = {
  id: number;
  product_id: number;
  flavor: string;
  stock: number;
  price: number; // Agregar la propiedad price
};

export type ProductFull = {
  id: number;
  brand: string;
  name: string;
  image1?: string;
  image2?: string;
  image3?: string;
  price: number;
  category?: string;
  flavors: Flavor[];
};

export function useProducts() {
  const [products, setProducts] = useState<ProductFull[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        setProducts(json.products || []);
      } catch (e) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return { products, loading };
}
