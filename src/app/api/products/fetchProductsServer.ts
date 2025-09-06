import { ProductFull } from "./useProducts";

export async function fetchProductsServer(): Promise<ProductFull[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/products`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) return [];
  const json = await res.json();
  return json.products || [];
}
