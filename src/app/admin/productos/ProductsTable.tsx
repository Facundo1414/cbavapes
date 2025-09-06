"use client";
import { useEffect, useState } from "react";
import { ProductForm, ProductFormValues } from "./ProductForm";
import useCategories from "./useCategories";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Mostrar el nombre de la categoría usando category_key
type Category = {
  key: string;
  name: string;
};

type Flavor = {
  id: number;
  stock?: number;
};

function getCategoryName(product: Product, categories: Category[]) {
  if (!product.category_key) return "-";
  const cat = categories.find((c) => c.key === product.category_key);
  return cat ? cat.name : product.category_key;
}



export type Product = {
  id: number;
  name: string;
  price: number;
  brand?: string;
  category_key?: string;
  image1?: string;
  image2?: string;
  image3?: string;
  stock?: number;
};

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  // Paginación (después de products)
  const ROWS_PER_PAGE = 8;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(products.length / ROWS_PER_PAGE);
  const paginatedProducts = products.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const [categoriesRefreshKey, setCategoriesRefreshKey] = useState(0);
  const { categories, loading: loadingCategories } = useCategories(categoriesRefreshKey);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabaseBrowser
      .from("products")
      .select("*, flavors(*)");
    if (error) setError(error.message);
    else {
      // Calcular el stock total sumando el stock de cada flavor
      const productsWithStock: Product[] = (data || []).map((product: any) => ({
        ...product,
        stock: Array.isArray(product.flavors)
          ? (product.flavors as Flavor[]).reduce((sum, flavor) => sum + (flavor.stock || 0), 0)
          : 0,
      }));
      // Ordenar alfabéticamente por nombre
      productsWithStock.sort((a, b) => a.name.localeCompare(b.name));
      setProducts(productsWithStock);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleSave(values: ProductFormValues) {
    // Enviar todos los campos requeridos, nunca stock ni flavors
    let clean: Omit<Product, "id" | "stock"> & Partial<Product> = {
      name: values.name,
      price: values.price,
      brand: values.brand,
      category_key: values.category_key,
      image1: values.image1,
      image2: values.image2,
      image3: values.image3,
    };
    // Si estamos editando, mantener los valores actuales de imágenes si no se modifican
    if (editProduct) {
      clean = {
        ...editProduct,
        ...clean,
      };
    }
    if ('stock' in clean) delete (clean as any).stock;
    if ('flavors' in clean) delete (clean as any).flavors;
    if (editProduct) {
      await supabaseBrowser.from("products").update(clean).eq("id", editProduct.id);
    } else {
      await supabaseBrowser.from("products").insert([clean]);
    }
    setShowForm(false);
    setEditProduct(null);
    fetchProducts();
    setCategoriesRefreshKey((k) => k + 1); // Forzar refresco de categorías
  }

  async function handleDelete(id: number) {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
  await supabaseBrowser.from("products").delete().eq("id", id);
    fetchProducts();
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded" />
        ))}
      </div>
    );
  }

  if (error) return <p className="text-red-500">Error: {String(error)}</p>;

  if (showForm) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">{editProduct ? "Editar producto" : "Agregar producto"}</h2>
        <ProductForm
          initial={editProduct ? {
            ...editProduct,
            category_key: editProduct.category_key || ""
          } : undefined}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditProduct(null); }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setShowForm(true); setEditProduct(null); }}>Agregar producto</Button>
      </div>
      <div className="overflow-x-auto">
  <table className="min-w-full border bg-white rounded shadow text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Marca</th>
              <th className="p-2 text-left">Categoría</th>
              <th className="p-2 text-left">Precio</th>
              <th className="p-2 text-left">Imagen 1</th>
              <th className="p-2 text-left">Imagen 2</th>
              <th className="p-2 text-left">Imagen 3</th>
              <th className="p-2 text-left">Stock</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="p-2">{product.name}</td>
                <td className="p-2">{product.brand || "-"}</td>
                <td className="p-2">{getCategoryName(product, categories)}</td>
                <td className="p-2">${product.price}</td>
                <td className="p-2 break-all max-w-xs">{product.image1 || "-"}</td>
                <td className="p-2 break-all max-w-xs">{product.image2 || "-"}</td>
                <td className="p-2 break-all max-w-xs">{product.image3 || "-"}</td>
                <td className="p-2">{product.stock ?? "-"}</td>
                <td className="p-2">
                  <Button size="sm" variant="outline" className="mr-2" onClick={() => { setEditProduct(product); setShowForm(true); }}>Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Controles de paginación fuera de la tabla */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >Anterior</button>
          <span className="font-semibold text-sm">Página {page} de {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >Siguiente</button>
        </div>
      </div>
    </div>
  );
}
