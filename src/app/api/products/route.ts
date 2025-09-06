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
    const productsWithCategory = (products ?? []).map((p: any) => ({
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
