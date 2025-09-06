"use client"
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";

import FlavorQuickCreateModal from "@/components/dashboard/FlavorQuickCreateModal";
import { Button } from "@/components/ui/button";

export default function AdminSabores() {
  // Para edición en línea (solo actualiza el estado local)
  function handleFieldChange(id: number, field: string, value: number) {
    setFlavors(flavors => flavors.map(f => {
      if (f.id !== id) return f;
      const updated = { ...f, [field]: value, modified: true };
      updated.stock = (updated.purchased_quantity ?? 0) - (updated.quantity_sold ?? 0) - (updated.discounts_gifts ?? 0);
      updated.total_sales = (updated.quantity_sold ?? 0) * (updated.price ?? 0);
      updated.actual_total_sales = updated.total_sales - ((updated.discounts_gifts ?? 0) * (updated.price ?? 0));
      return updated;
    }));
  }

  // Guardar todos los cambios en Supabase
  async function guardarCambios() {
    const saboresModificados = flavors.filter(f => f.modified);
    if (saboresModificados.length === 0) return;
    for (const f of saboresModificados) {
      await supabaseBrowser.from("flavors").update({
        purchased_quantity: f.purchased_quantity,
        quantity_sold: f.quantity_sold,
        discounts_gifts: f.discounts_gifts,
        price: f.price,
        stock: f.stock,
        total_sales: f.total_sales,
        actual_total_sales: f.actual_total_sales
      }).eq("id", f.id);
    }
    // Refrescar datos y limpiar flag de modificado
    fetchFlavors();
  }
  const [modalOpen, setModalOpen] = useState(false);
  // Paginación por brand
  const BRANDS_PER_PAGE = 5;
  const [page, setPage] = useState(1);
  type Flavor = {
    id: number;
    flavor: string;
    product_id: number;
    products?: { name?: string; brand?: string };
    stock?: number;
    purchased_quantity?: number;
    quantity_sold?: number;
    discounts_gifts?: number;
    price?: number;
    total_sales?: number;
    actual_total_sales?: number;
    modified?: boolean;
  };
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlavors();
  }, []);

  async function fetchFlavors() {
    setLoading(true);
  const { data, error } = await supabaseBrowser.from("flavors").select("id, flavor, product_id, products(name, brand), stock, purchased_quantity, quantity_sold, discounts_gifts, price, total_sales, actual_total_sales").order("flavor", { ascending: true });
    if (error) setError(error.message);
        else setFlavors(
          (data || []).map((f: {
            id: number;
            flavor: string;
            product_id: number;
            products?: { name?: string; brand?: string } | { name?: string; brand?: string }[];
            stock?: number;
            purchased_quantity?: number;
            quantity_sold?: number;
            discounts_gifts?: number;
            price?: number;
            total_sales?: number;
            actual_total_sales?: number;
            modified?: boolean;
          }) => ({
            id: f.id,
            flavor: f.flavor,
            product_id: f.product_id,
            products: Array.isArray(f.products) ? f.products[0] : f.products,
            stock: f.stock,
            purchased_quantity: f.purchased_quantity,
            quantity_sold: f.quantity_sold,
            discounts_gifts: f.discounts_gifts,
            price: f.price,
            total_sales: f.total_sales,
            actual_total_sales: f.actual_total_sales,
            modified: false,
          }))
        );
    setLoading(false);
  }

  return (
  <div>
    <h1 className="text-2xl font-bold mb-4 text-left">Gestión de Sabores</h1>
    <div className="flex justify-end items-center gap-2 mb-4">
      <Button className="bg-black hover:bg-gray-900 text-white" onClick={() => setModalOpen(true)}>
        Agregar sabor
      </Button>
      <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={guardarCambios}>
        Guardar cambios
      </Button>
    </div>
    <FlavorQuickCreateModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={fetchFlavors} />
      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white rounded shadow text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left min-w-[120px]">Sabor</th>
                <th className="px-3 py-2 text-left min-w-[120px]">Producto</th>
                <th className="px-3 py-2 text-right min-w-[80px]">Stock</th>
                <th className="px-3 py-2 text-right min-w-[80px]">Comprados</th>
                <th className="px-3 py-2 text-right min-w-[80px]">Vendidos</th>
                <th className="px-3 py-2 text-right min-w-[90px]">Desc./Regalos</th>
                <th className="px-3 py-2 text-right min-w-[90px]">Precio</th>
                <th className="px-3 py-2 text-right min-w-[90px]">Total ventas</th>
                <th className="px-3 py-2 text-right min-w-[90px]">Ventas reales</th>
              </tr>
            </thead>
            <tbody>
              {/* Agrupar por brand y paginar */}
              {(() => {
                if (!flavors.length) return null;
                // Agrupar por brand, luego por producto
                const brandGroups: Record<string, Flavor[]> = {};
                for (const f of flavors) {
                  const brand = f.products?.brand || '-';
                  if (!brandGroups[brand]) brandGroups[brand] = [];
                  brandGroups[brand].push(f);
                }
                const brandList = Object.keys(brandGroups);
                const totalPages = Math.ceil(brandList.length / BRANDS_PER_PAGE);
                const paginatedBrands = brandList.slice((page - 1) * BRANDS_PER_PAGE, page * BRANDS_PER_PAGE);
                return [
                  ...paginatedBrands.flatMap(brand => {
                    const brandItems = brandGroups[brand];
                    // Agrupar por producto dentro de cada brand
                    const productGroups: Record<string, Flavor[]> = {};
                    for (const f of brandItems) {
                      const product = f.products?.name || '-';
                      if (!productGroups[product]) productGroups[product] = [];
                      productGroups[product].push(f);
                    }
                    return [
                      <tr key={brand} className="bg-gray-200 text-black">
                        <td colSpan={9} className="px-3 py-2 font-bold text-lg text-black">{brand}</td>
                      </tr>,
                      ...Object.entries(productGroups).flatMap(([product, items]) => [
                        <tr key={brand + product} className="bg-gray-100">
                          <td colSpan={9} className="px-3 py-2 font-semibold text-base text-gray-800">{product}</td>
                        </tr>,
                        ...items.map(f => (
                          <tr key={f.id} className="border-t">
                            <td className="px-3 py-2 text-left">{f.flavor}</td>
                            <td className="px-3 py-2 text-left">{f.products?.name || '-'}</td>
                            <td className="px-3 py-2 text-right font-bold">{f.stock}</td>
                            <td className="px-3 py-2 text-right">
                              <input type="number" className="w-16 border rounded px-1" value={f.purchased_quantity ?? 0}
                                onChange={e => handleFieldChange(f.id, 'purchased_quantity', Number(e.target.value))} />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <input type="number" className="w-16 border rounded px-1" value={f.quantity_sold ?? 0}
                                onChange={e => handleFieldChange(f.id, 'quantity_sold', Number(e.target.value))} />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <input type="number" className="w-16 border rounded px-1" value={f.discounts_gifts ?? 0}
                                onChange={e => handleFieldChange(f.id, 'discounts_gifts', Number(e.target.value))} />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <input type="number" className="w-16 border rounded px-1" value={f.price ?? 0}
                                onChange={e => handleFieldChange(f.id, 'price', Number(e.target.value))} />
                            </td>
                            <td className="px-3 py-2 text-right">{f.total_sales}</td>
                            <td className="px-3 py-2 text-right">{f.actual_total_sales}</td>
                          </tr>
                        ))
                      ])
                    ];
                  }),
                  // Controles de paginación
                  <tr key="pagination">
                    <td colSpan={9} className="py-4">
                      <div className="flex justify-center items-center gap-2">
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
                    </td>
                  </tr>
                ];
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
