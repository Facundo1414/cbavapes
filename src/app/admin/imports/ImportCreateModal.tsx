import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ImportCreateModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [flavors, setFlavors] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [form, setForm] = useState({
    product_id: "",
    flavor_id: "",
    provider_id: "",
    unit_cost: "",
    purchased_quantity: "",
    sold_quantity: "",
    current_stock: "",
    unit_sale_price: "",
    unit_discount: "",
    discounts_gifts: "",
    net_sale_price: "",
    total_sales: "",
    unit_gain: "",
    total_gain: "",
    real_total_gain: "",
    real_total_sales: "",
    margin: "",
    purchase_date: "",
    notes: "",
    total_purchased: ""
  });
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Calcula campos derivados
    const purchased = Number(form.purchased_quantity) || 0;
    const sold = Number(form.sold_quantity) || 0;
    const price = Number(form.unit_sale_price) || 0;
    const unit_cost = Number(form.unit_cost) || 0;
    const unit_discount = Number(form.unit_discount) || 0;
    const discounts = Number(form.discounts_gifts) || 0;
    const stock = purchased - sold;
    const net_sale_price = price - unit_discount;
    const total_sales = sold * price;
    const unit_gain = price - unit_cost;
    const total_gain = unit_gain * sold;
    const real_total_gain = total_gain - discounts;
    const real_total_sales = total_sales - discounts;
    const margin = price > 0 && unit_cost > 0 ? unit_gain / price : 0;
    // Insert en imports
    const { error: insertError } = await supabaseBrowser.from("imports").insert([
      {
        product_id: Number(form.product_id),
        flavor_id: Number(form.flavor_id),
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
        total_purchased: Number(form.total_purchased) || 0
      }
    ]);
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setForm({
      product_id: "",
      flavor_id: "",
      provider_id: "",
      unit_cost: "",
      purchased_quantity: "",
      sold_quantity: "",
      current_stock: "",
      unit_sale_price: "",
      unit_discount: "",
      discounts_gifts: "",
      net_sale_price: "",
      total_sales: "",
      unit_gain: "",
      total_gain: "",
      real_total_gain: "",
      real_total_sales: "",
      margin: "",
      purchase_date: "",
      notes: "",
      total_purchased: ""
    });
    if (onCreated) onCreated();
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl relative overflow-auto max-h-[90vh]">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl" onClick={onClose} aria-label="Cerrar">×</button>
        <h2 className="font-bold mb-4 text-lg">Add Import</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs mb-1">Product</label>
              <select name="product_id" value={form.product_id} onChange={handleChange} required className="border rounded p-1 w-full">
                <option value="">Select product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1">Flavor</label>
              <select name="flavor_id" value={form.flavor_id} onChange={handleChange} required className="border rounded p-1 w-full">
                <option value="">Select flavor</option>
                {flavors.map(f => <option key={f.id} value={f.id}>{f.flavor}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1">Provider</label>
              <select name="provider_id" value={form.provider_id} onChange={handleChange} required className="border rounded p-1 w-full">
                <option value="">Select provider</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" name="unit_cost" value={form.unit_cost} onChange={handleChange} placeholder="Unit Cost (ARS)" required />
            <Input type="number" name="purchased_quantity" value={form.purchased_quantity} onChange={handleChange} placeholder="Purchased Quantity" required />
            <Input type="number" name="sold_quantity" value={form.sold_quantity} onChange={handleChange} placeholder="Sold Quantity" required />
            <Input type="number" name="unit_sale_price" value={form.unit_sale_price} onChange={handleChange} placeholder="Unit Sale Price (ARS)" required />
            <Input type="number" name="unit_discount" value={form.unit_discount} onChange={handleChange} placeholder="Unit Discount (ARS)" />
            <Input type="number" name="discounts_gifts" value={form.discounts_gifts} onChange={handleChange} placeholder="Discounts/Gifts" />
            <Input type="number" name="total_purchased" value={form.total_purchased} onChange={handleChange} placeholder="Total Purchased" />
            <Input type="date" name="purchase_date" value={form.purchase_date} onChange={handleChange} placeholder="Purchase Date" />
            <Input type="text" name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Saving..." : "Save Import"}</Button>
        </form>
      </div>
    </div>
  );
}
