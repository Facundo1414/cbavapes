import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProviderQuickCreateModal from "./ProviderQuickCreateModal";
import { toast } from "@/components/ui/sonner-toast";

export default function StockAddImportModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [flavors, setFlavors] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [form, setForm] = useState({
    product_id: "",
    provider_id: "",
    unit_cost: "",
    unit_sale_price: "",
    unit_discount: "",
    discounts_gifts: "",
    total_purchased: "",
    purchase_date: "",
    notes: ""
  });
  const [flavorRows, setFlavorRows] = useState([
    { flavor_id: "", purchased_quantity: "", sold_quantity: "" }
  ]);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    fetchProducts();
    fetchProviders();
  }, [open]);

  async function fetchProducts() {
    const { data } = await supabaseBrowser.from("products").select("id, name");
    setProducts(data || []);
  }
  async function fetchProviders() {
    const { data } = await supabaseBrowser.from("providers").select("id, name");
    setProviders(data || []);
  }

  function handleProviderCreated() {
    fetchProviders();
  }
  async function fetchFlavors(productId: string) {
    if (!productId) return setFlavors([]);
    const { data } = await supabaseBrowser.from("flavors").select("id, flavor").eq("product_id", productId);
    setFlavors(data || []);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === "product_id") fetchFlavors(value);
  }

  function handleFlavorRowChange(idx: number, field: string, value: string) {
    setFlavorRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  }

  function handleAddFlavorRow() {
    setFlavorRows(rows => [...rows, { flavor_id: "", purchased_quantity: "", sold_quantity: "" }]);
  }

  function handleRemoveFlavorRow(idx: number) {
    setFlavorRows(rows => rows.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const price = Number(form.unit_sale_price) || 0;
    const unit_cost = Number(form.unit_cost) || 0;
    const unit_discount = Number(form.unit_discount) || 0;
    const discounts = Number(form.discounts_gifts) || 0;
    const total_purchased = Number(form.total_purchased) || 0;

    for (const row of flavorRows) {
      const purchased = Number(row.purchased_quantity) || 0;
      const sold = Number(row.sold_quantity) || 0;
      if (!form.product_id || !row.flavor_id) continue;

      // Buscar si ya existe una línea para este producto y sabor
      const { data: existing, error: fetchError } = await supabaseBrowser
        .from("imports")
        .select("*")
        .eq("product_id", form.product_id)
        .eq("flavor_id", row.flavor_id)
        .limit(1);
      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      if (existing && existing.length > 0) {
        // Sumar cantidades y actualizar línea existente
        const prev = existing[0];
        const new_purchased = (Number(prev.purchased_quantity) || 0) + purchased;
        const new_sold = (Number(prev.sold_quantity) || 0) + sold;
        const new_stock = new_purchased - new_sold;
        const new_unit_cost = unit_cost || prev.unit_cost;
        const new_unit_sale_price = price || prev.unit_sale_price;
        const new_unit_discount = unit_discount || prev.unit_discount;
        const new_discounts_gifts = (Number(prev.discounts_gifts) || 0) + discounts;
        const new_net_sale_price = new_unit_sale_price - new_unit_discount;
        const new_total_sales = new_sold * new_unit_sale_price;
        const new_unit_gain = new_unit_sale_price - new_unit_cost;
        const new_total_gain = new_unit_gain * new_sold;
        const new_real_total_gain = new_total_gain - new_discounts_gifts;
        const new_real_total_sales = new_total_sales - new_discounts_gifts;
        const new_margin = new_unit_sale_price > 0 && new_unit_cost > 0 ? new_unit_gain / new_unit_sale_price : 0;
        const new_total_purchased = (Number(prev.total_purchased) || 0) + total_purchased;

        const { error: updateError } = await supabaseBrowser
          .from("imports")
          .update({
            unit_cost: new_unit_cost,
            purchased_quantity: new_purchased,
            sold_quantity: new_sold,
            current_stock: new_stock,
            unit_sale_price: new_unit_sale_price,
            unit_discount: new_unit_discount,
            discounts_gifts: new_discounts_gifts,
            net_sale_price: new_net_sale_price,
            total_sales: new_total_sales,
            unit_gain: new_unit_gain,
            total_gain: new_total_gain,
            real_total_gain: new_real_total_gain,
            real_total_sales: new_real_total_sales,
            margin: new_margin,
            purchase_date: form.purchase_date || prev.purchase_date,
            notes: form.notes || prev.notes,
            total_purchased: new_total_purchased
          })
          .eq("id", prev.id);
        if (updateError) {
          setError(updateError.message);
          setLoading(false);
          return;
        }
      } else {
        // Crear nueva línea
        const stock = purchased - sold;
        const net_sale_price = price - unit_discount;
        const total_sales = sold * price;
        const unit_gain = price - unit_cost;
        const total_gain = unit_gain * sold;
        const real_total_gain = total_gain - discounts;
        const real_total_sales = total_sales - discounts;
        const margin = price > 0 && unit_cost > 0 ? unit_gain / price : 0;
        const { error: insertError } = await supabaseBrowser.from("imports").insert([
          {
            product_id: Number(form.product_id),
            flavor_id: Number(row.flavor_id),
            provider_id: Number(form.provider_id),
            unit_cost,
            purchased_quantity: purchased,
            sold_quantity: sold,
            current_stock: stock,
            unit_sale_price: price,
            unit_discount,
            discounts_gifts: discounts,
            net_sale_price,
            total_sales,
            unit_gain,
            total_gain,
            real_total_gain,
            real_total_sales,
            margin,
            purchase_date: form.purchase_date,
            notes: form.notes,
            total_purchased: total_purchased
          }
        ]);
        if (insertError) {
          setError(insertError.message);
          setLoading(false);
          return;
        }
      }
    }
    setLoading(false);
    setForm({
      product_id: "",
      provider_id: "",
      unit_cost: "",
      unit_sale_price: "",
      unit_discount: "",
      discounts_gifts: "",
      total_purchased: "",
      purchase_date: "",
      notes: ""
    });
    setFlavorRows([{ flavor_id: "", purchased_quantity: "", sold_quantity: "" }]);
  toast.success("Importación guardada correctamente");
  if (onCreated) onCreated();
  onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl relative overflow-auto max-h-[90vh]">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl" onClick={onClose} aria-label="Cerrar">×</button>
  <h2 className="font-bold mb-4 text-lg">Agregar línea de importación</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs mb-1">Producto</label>
              <select name="product_id" value={form.product_id} onChange={handleChange} required className="border rounded p-1 w-full">
                <option value="">Selecciona producto</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1">Proveedor</label>
              <div className="flex gap-2">
                <select name="provider_id" value={form.provider_id} onChange={handleChange} required className="border rounded p-1 w-full">
                  <option value="">Selecciona proveedor</option>
                  {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Button type="button" variant="outline" size="sm" onClick={() => setProviderModalOpen(true)}>
                  +
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs mb-2">Sabores y cantidades</label>
            {flavorRows.map((row, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs mb-1">Sabor</label>
                  <select value={row.flavor_id} onChange={e => handleFlavorRowChange(idx, "flavor_id", e.target.value)} required className="border rounded p-1 w-full">
                    <option value="">Selecciona sabor</option>
                    {flavors.map(f => <option key={f.id} value={f.id}>{f.flavor}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1">Cantidad comprada</label>
                  <Input type="number" value={row.purchased_quantity} onChange={e => handleFlavorRowChange(idx, "purchased_quantity", e.target.value)} placeholder="Cantidad comprada" required />
                </div>
                <div>
                  <label className="block text-xs mb-1">Cantidad vendida</label>
                  <Input type="number" value={row.sold_quantity} onChange={e => handleFlavorRowChange(idx, "sold_quantity", e.target.value)} placeholder="Cantidad vendida" required />
                </div>
                {flavorRows.length > 1 && (
                  <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveFlavorRow(idx)}>-</Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={handleAddFlavorRow}>Agregar otro sabor</Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs mb-1">Costo unitario (ARS)</label>
              <Input type="number" name="unit_cost" value={form.unit_cost} onChange={handleChange} placeholder="Costo unitario (ARS)" required />
            </div>
            {/* Los campos de cantidad comprada y vendida ahora se gestionan por sabor en flavorRows */}
            <div>
              <label className="block text-xs mb-1">Precio unitario de venta (ARS)</label>
              <Input type="number" name="unit_sale_price" value={form.unit_sale_price} onChange={handleChange} placeholder="Precio unitario de venta (ARS)" required />
            </div>
            <div>
              <label className="block text-xs mb-1">Descuento unitario (ARS)</label>
              <Input type="number" name="unit_discount" value={form.unit_discount} onChange={handleChange} placeholder="Descuento unitario (ARS)" />
            </div>
            <div>
              <label className="block text-xs mb-1">Descuentos/Regalos</label>
              <Input type="number" name="discounts_gifts" value={form.discounts_gifts} onChange={handleChange} placeholder="Descuentos/Regalos" />
            </div>
            <div>
              <label className="block text-xs mb-1">Total comprado (USD)</label>
              <Input type="number" name="total_purchased" value={form.total_purchased} onChange={handleChange} placeholder="Total comprado (USD)" />
            </div>
            <div>
              <label className="block text-xs mb-1">Fecha de compra</label>
              <Input type="date" name="purchase_date" value={form.purchase_date} onChange={handleChange} placeholder="Fecha de compra" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs mb-1">Notas</label>
              <Input type="text" name="notes" value={form.notes} onChange={handleChange} placeholder="Notas" />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Guardando..." : "Guardar línea de importación"}</Button>
        </form>
      </div>
      <ProviderQuickCreateModal open={providerModalOpen} onClose={() => setProviderModalOpen(false)} onCreated={handleProviderCreated} />
    </div>
  );
}
