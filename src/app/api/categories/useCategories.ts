import { useEffect, useState } from "react";

export interface Category {
  id: number;
  key: string;
  name: string;
  image?: string;
  description?: string;
  [key: string]: unknown;
}

export function useCategories(refreshKey?: unknown) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [refreshKey]);

  return { categories, loading, error };
}
