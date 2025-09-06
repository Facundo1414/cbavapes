import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";

export function useOrderItems(orderId: number) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    supabaseBrowser
      .from("order_items")
      .select(
        "id, product_id, product_name, flavor_id, flavor, price, quantity"
      )
      .eq("order_id", orderId)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setItems(data || []);
        setLoading(false);
      });
  }, [orderId]);

  return { items, loading, error };
}
