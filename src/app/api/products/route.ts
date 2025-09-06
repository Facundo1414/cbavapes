// Mapeo simple de brand o name a categoría
const CATEGORY_MAP: Record<string, string> = {
  RABBEATS: "vapes",
  SMOK: "vapes",
  ELFBAR: "vapes",
  "SEX ADDICT": "vapes",
  IGNITE: "vapes",
  "LOST MARY": "vapes",
  LUFBAR: "vapes",
  NIKBAR: "vapes",
  WAKA: "vapes",
  "TORCH THC": "thc-vapes",
  // Agrega más mapeos según tus marcas/nombres
};

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

interface Flavor {
  id: number;
  product_id: number;
  flavor: string;
  stock: number;
  purchased_quantity: number;
  quantity_sold: number;
  discounts_gifts: number;
  price: number;
  total_sales: number;
  actual_total_sales: number;
}

interface Product {
  id: number;
  brand: string;
  name: string;
  image1: string;
  image2: string;
  image3: string;
  price: number;
  category_key: string;
  flavors: Flavor[];
  category?: string; // calculado en runtime
}

export async function GET() {
  try {
    // Traer productos y sus sabores relacionados
    const { data: products, error } = await supabase
      .from("products")
      .select("*, flavors(*)");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Agregar campo category a cada producto según brand o name
    const productsWithCategory = (products ?? []).map((p: Product) => ({
      ...p,
      category: CATEGORY_MAP[p.brand] || CATEGORY_MAP[p.name] || "otros",
    }));

    return NextResponse.json({ products: productsWithCategory });
  } catch (error) {
    console.error("API fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
