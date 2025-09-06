'use client'
import { useEffect, useState } from "react";

type StockRow = {
  id: number;
  product_id: number;
  product_name: string;
  brand: string;
  flavor_id: number;
  flavor_name: string;
  provider_id: number;
  provider_name: string;
  unit_cost: number;
  purchased_quantity: number;
  sold_quantity: number;
  current_stock: number;
  unit_sale_price: number;
  unit_discount: number;
  discounts_gifts: number;
  net_sale_price: number;
  total_sales: number;
  unit_gain: number;
  total_gain: number;
  real_total_gain: number;
  real_total_sales: number;
  margin: number;
  purchase_date: string;
  notes: string;
  total_purchased: number;
};
import StockAddImportModal from "./StockAddImportModal";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";


export function StockTable() {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  // Paginación simple por filas
  const ROWS_PER_PAGE = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(rows.length / ROWS_PER_PAGE);
  const paginatedRows = rows.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ [id: number]: boolean }>({});
  const [editValues, setEditValues] = useState<{ [id: number]: { purchased_quantity: number; quantity_sold: number } }>({});
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  function handleModalCreated() {
    fetchAll();
  }

  async function fetchAll() {
    setLoading(true);
    const { data, error } = await supabaseBrowser
      .from("imports")
      .select(`
        id,
        product_id,
        products(name, brand),
        flavor_id,
        flavors(flavor),
        provider_id,
        providers(name),
        unit_cost,
        purchased_quantity,
        sold_quantity,
        current_stock,
        unit_sale_price,
        unit_discount,
        discounts_gifts,
        net_sale_price,
        total_sales,
        unit_gain,
        total_gain,
        real_total_gain,
        real_total_sales,
        margin,
        purchase_date,
        notes,
        total_purchased
      `)
      .order("id");
    if (error) setError(error.message);
    else {
      setRows(
        (data || []).map((row: {
          id: number;
          product_id: number;
          products?: { name?: string; brand?: string } | { name?: string; brand?: string }[];
          flavor_id: number;
          flavors?: { flavor?: string } | { flavor?: string }[];
          provider_id: number;
          providers?: { name?: string } | { name?: string }[];
          unit_cost: number;
          purchased_quantity: number;
          sold_quantity: number;
          current_stock: number;
          unit_sale_price: number;
          unit_discount: number;
          discounts_gifts: number;
          net_sale_price: number;
          total_sales: number;
          unit_gain: number;
          total_gain: number;
          real_total_gain: number;
          real_total_sales: number;
          margin: number;
          purchase_date: string;
          notes: string;
          total_purchased: number;
        }): StockRow => ({
          id: row.id,
          product_id: row.product_id,
          product_name: Array.isArray(row.products) ? row.products[0]?.name || "" : (row.products as { name?: string } | undefined)?.name || "",
          brand: Array.isArray(row.products) ? row.products[0]?.brand || "" : (row.products as { brand?: string } | undefined)?.brand || "",
          flavor_id: row.flavor_id,
          flavor_name: Array.isArray(row.flavors) ? row.flavors[0]?.flavor || "" : (row.flavors as { flavor?: string } | undefined)?.flavor || "",
          provider_id: row.provider_id,
          provider_name: Array.isArray(row.providers) ? row.providers[0]?.name || "" : (row.providers as { name?: string } | undefined)?.name || "",
          unit_cost: row.unit_cost,
          purchased_quantity: row.purchased_quantity,
          sold_quantity: row.sold_quantity,
          current_stock: row.current_stock,
          unit_sale_price: row.unit_sale_price,
          unit_discount: row.unit_discount,
          discounts_gifts: row.discounts_gifts,
          net_sale_price: row.net_sale_price,
          total_sales: row.total_sales,
          unit_gain: row.unit_gain,
          total_gain: row.total_gain,
          real_total_gain: row.real_total_gain,
          real_total_sales: row.real_total_sales,
          margin: row.margin,
          purchase_date: row.purchase_date,
          notes: row.notes,
          total_purchased: row.total_purchased,
        }))
      );
    }
    setLoading(false);
  }

  async function handleSave(id: number) {
  const { purchased_quantity, quantity_sold } = editValues[id];
  const stock = purchased_quantity - quantity_sold;
  await supabaseBrowser.from("flavors").update({ purchased_quantity, quantity_sold, stock }).eq("id", id);
  setEditing((prev) => ({ ...prev, [id]: false }));
  fetchAll();
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    );
  }

  if (error) return <p className="text-red-500">Error: {error}</p>;

  // Agrupar por brand
  // ...existing code...

  return (
    <div>
      {/* Título principal se muestra en page.tsx, no aquí */}
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setModalOpen(true)}>Agregar línea</Button>
      </div>
      <div className="overflow-x-auto w-full">
  <table className="min-w-full border bg-white rounded shadow text-sm" style={{ minWidth: '1200px' }}>
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 text-left min-w-[120px]">Producto</th>
              <th className="px-3 py-2 text-left min-w-[100px]">Sabor</th>
              <th className="px-3 py-2 text-left min-w-[120px]">Proveedor</th>
              <th className="px-3 py-2 text-right min-w-[90px]">Costo unit.</th>
              <th className="px-3 py-2 text-right min-w-[80px]">Comprados</th>
              <th className="px-3 py-2 text-right min-w-[80px]">Vendidos</th>
              <th className="px-3 py-2 text-right min-w-[80px]">Stock</th>
              <th className="px-3 py-2 text-right min-w-[90px]">Precio venta</th>
              <th className="px-3 py-2 text-right min-w-[90px]">Desc. unit.</th>
              <th className="px-3 py-2 text-right min-w-[90px]">Desc./Regalos</th>
              <th className="px-3 py-2 text-right min-w-[90px]">Precio neto</th>
              <th className="px-3 py-2 text-right min-w-[90px]">Ventas</th>
              <th className="px-3 py-2 text-right min-w-[90px]">Ganancia unit.</th>
              <th className="px-3 py-2 text-right min-w-[90px]">Ganancia total</th>
              <th className="px-3 py-2 text-right min-w-[90px]">Ganancia real</th>
              <th className="px-3 py-2 text-right min-w-[90px]">Ventas reales</th>
              <th className="px-3 py-2 text-right min-w-[80px]">Margen %</th>
              <th className="px-3 py-2 text-center min-w-[90px]">Fecha</th>
              <th className="px-3 py-2 text-left min-w-[120px]">Notas</th>
              <th className="px-3 py-2 text-right min-w-[90px]">Total USD</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map(row => (
              <tr key={row.id} className="border-t">
                <td className="px-3 py-2 text-left">{row.product_name}</td>
                <td className="px-3 py-2 text-left">{row.flavor_name}</td>
                <td className="px-3 py-2 text-left">{row.provider_name}</td>
                <td className="px-3 py-2 text-right">{row.unit_cost}</td>
                <td className="px-3 py-2 text-right">{row.purchased_quantity}</td>
                <td className="px-3 py-2 text-right">{row.sold_quantity}</td>
                <td className="px-3 py-2 text-right font-bold">{row.current_stock}</td>
                <td className="px-3 py-2 text-right">{row.unit_sale_price}</td>
                <td className="px-3 py-2 text-right">{row.unit_discount}</td>
                <td className="px-3 py-2 text-right">{row.discounts_gifts}</td>
                <td className="px-3 py-2 text-right font-bold">{row.net_sale_price?.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-bold">{row.total_sales?.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-bold">{row.unit_gain?.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-bold">{row.total_gain?.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-bold">{row.real_total_gain?.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-bold">{row.real_total_sales?.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-bold">{((row.margin || 0) * 100).toFixed(2)}%</td>
                <td className="px-3 py-2 text-center">{row.purchase_date}</td>
                <td className="px-3 py-2 text-left">{row.notes}</td>
                <td className="px-3 py-2 text-right">{row.total_purchased}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Controles de paginación */}
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
      <StockAddImportModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleModalCreated} />
    </div>
  );
}
