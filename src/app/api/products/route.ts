// Eliminar el mapeo hardcodeado y usar las categorías directamente desde los datos de Product

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

interface Flavor {
  id: number;
  flavor: string;
  stock: number;
  price: number;
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");

    // Traer productos y sus sabores relacionados con campos filtrados
    const { data: products, error } = await supabase.from("products").select(`
        id,
        brand,
        name,
        image1,
        image2,
        image3,
        price,
        category_key,
        flavors (
          id,
          flavor,
          stock,
          price
        )
      `);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Usar directamente la categoría desde los datos de Product
    const productsWithCategory = (products ?? []).map((p: Product) => ({
      ...p,
      category: p.category_key || "otros",
    }));

    // Filtrar productos por categoría si se proporciona
    const filteredProducts = category
      ? productsWithCategory.filter((p) => p.category === category)
      : productsWithCategory;

    return NextResponse.json({ products: filteredProducts });
  } catch (error) {
    console.error("API fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
