import { useEffect, useState } from "react";
import Papa from "papaparse";
import { getImageUrl } from "@/components/hook/getImageUrl";

export type Product = {
  ID: string;
  name: string;
  brand: string;
  flavor: string;
  image: string;
  stock: number;
  price: number;
  purchasedQuantity: string;
  quantitySold: string;
  discountsGifts: string;
  totalSales: string;
  actualTotalSales: string;
};

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbzB2xGgA8S0zNnYIB_kDxQmSEIxBctw1AyYGX25HMzlU0cfeYuqba3rc0_3fnopIwCE0HEihZVXv8/pub?gid=288833677&single=true&output=csv";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCSV() {
      try {
        const res = await fetch(CSV_URL);
        const text = await res.text();

        const parsed = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
        });

        const items: Product[] = (parsed.data as any[]).map((rawItem) => {
          const img = getImageUrl(rawItem["image"]);
          console.log("IMG:", rawItem["image"], "→", img);
            return {
              ID: rawItem["ID"],
              name: rawItem["name"],
              brand: rawItem["brand"],
              flavor: rawItem["flavor"],
              image: img,
              stock: Number(rawItem["stock"]),
              price: Number(rawItem["price"]),
              purchasedQuantity: rawItem["purchasedQuantity"],
              quantitySold: rawItem["quantitySold"],
              discountsGifts: rawItem["discountsGifts"],
              totalSales: rawItem["totalSales"],
              actualTotalSales: rawItem["actualTotalSales"],
            };
        });


        setProducts(items);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCSV();
  }, []);

  return { products, loading };
}
