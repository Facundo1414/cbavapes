import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Data type for imports table
export type ImportRow = {
  id: number;
  product_id: number;
  product_name: string;
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

export default function StockMassEdit() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ [id: number]: Partial<ImportRow> }>({});

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    const { data, error } = await supabaseBrowser
      .from("imports")
      .select(`
        id,
        product_id,
        products(name),
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
        (data || []).map((row: any) => ({
          ...row,
          product_name: row.products?.name || "",
          flavor_name: row.flavors?.flavor || "",
          provider_name: row.providers?.name || ""
        }))
      );
    }
    setLoading(false);
  }

  function handleChange(id: number, field: keyof ImportRow, value: any) {
    setEditValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  async function handleSave(id: number) {
    const values = editValues[id];
    if (!values) return;
    const purchased = values.purchased_quantity ?? rows.find(r => r.id === id)?.purchased_quantity ?? 0;
    const sold = values.sold_quantity ?? rows.find(r => r.id === id)?.sold_quantity ?? 0;
    const price = values.unit_sale_price ?? rows.find(r => r.id === id)?.unit_sale_price ?? 0;
    const unit_cost = values.unit_cost ?? rows.find(r => r.id === id)?.unit_cost ?? 0;
    const unit_discount = values.unit_discount ?? rows.find(r => r.id === id)?.unit_discount ?? 0;
    const discounts = values.discounts_gifts ?? rows.find(r => r.id === id)?.discounts_gifts ?? 0;
    const stock = purchased - sold;
    const net_sale_price = price - unit_discount;
    const total_sales = sold * price;
    const unit_gain = price - unit_cost;
    const total_gain = unit_gain * sold;
    const real_total_gain = total_gain - discounts;
    const real_total_sales = total_sales - discounts;
    const margin = price > 0 && unit_cost > 0 ? unit_gain / price : 0;
    await supabaseBrowser.from("imports").update({
      ...values,
      current_stock: stock,
      net_sale_price,
      total_sales,
      unit_gain,
      total_gain,
      real_total_gain,
      real_total_sales,
      margin
    }).eq("id", id);
    setEditValues((prev) => ({ ...prev, [id]: {} }));
    fetchAll();
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <h2 className="font-bold text-lg mb-4">Mass Edit Imports</h2>
      <table className="min-w-full border bg-white rounded shadow text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th>Product</th>
            <th>Flavor</th>
            <th>Provider</th>
            <th>Unit Cost</th>
            <th>Purchased Qty</th>
            <th>Sold Qty</th>
            <th>Current Stock</th>
            <th>Unit Sale Price</th>
            <th>Unit Discount</th>
            <th>Discounts/Gifts</th>
            <th>Net Sale Price</th>
            <th>Total Sales</th>
            <th>Unit Gain</th>
            <th>Total Gain</th>
            <th>Real Total Gain</th>
            <th>Real Total Sales</th>
            <th>Margin %</th>
            <th>Purchase Date</th>
            <th>Notes</th>
            <th>Total Purchased</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const edit = editValues[row.id] || {};
            const unit_cost = edit.unit_cost ?? row.unit_cost ?? 0;
            const purchased = edit.purchased_quantity ?? row.purchased_quantity ?? 0;
            const sold = edit.sold_quantity ?? row.sold_quantity ?? 0;
            const price = edit.unit_sale_price ?? row.unit_sale_price ?? 0;
            const unit_discount = edit.unit_discount ?? row.unit_discount ?? 0;
            const discounts = edit.discounts_gifts ?? row.discounts_gifts ?? 0;
            const stock = purchased - sold;
            const net_sale_price = price - unit_discount;
            const total_sales = sold * price;
            const unit_gain = price - unit_cost;
            const total_gain = unit_gain * sold;
            const real_total_gain = total_gain - discounts;
            const real_total_sales = total_sales - discounts;
            const margin = price > 0 && unit_cost > 0 ? unit_gain / price : 0;
            const purchase_date = edit.purchase_date ?? row.purchase_date ?? "";
            const notes = edit.notes ?? row.notes ?? "";
            const total_purchased = edit.total_purchased ?? row.total_purchased ?? 0;
            return (
              <tr key={row.id} className="border-t">
                <td>{row.product_name}</td>
                <td>{row.flavor_name}</td>
                <td>{row.provider_name}</td>
                <td><Input type="number" value={unit_cost} onChange={e => handleChange(row.id, "unit_cost", Number(e.target.value))} /></td>
                <td><Input type="number" value={purchased} onChange={e => handleChange(row.id, "purchased_quantity", Number(e.target.value))} /></td>
                <td><Input type="number" value={sold} onChange={e => handleChange(row.id, "sold_quantity", Number(e.target.value))} /></td>
                <td className="font-bold">{stock}</td>
                <td><Input type="number" value={price} onChange={e => handleChange(row.id, "unit_sale_price", Number(e.target.value))} /></td>
                <td><Input type="number" value={unit_discount} onChange={e => handleChange(row.id, "unit_discount", Number(e.target.value))} /></td>
                <td><Input type="number" value={discounts} onChange={e => handleChange(row.id, "discounts_gifts", Number(e.target.value))} /></td>
                <td className="font-bold">{net_sale_price.toLocaleString()}</td>
                <td className="font-bold">{total_sales.toLocaleString()}</td>
                <td className="font-bold">{unit_gain.toLocaleString()}</td>
                <td className="font-bold">{total_gain.toLocaleString()}</td>
                <td className="font-bold">{real_total_gain.toLocaleString()}</td>
                <td className="font-bold">{real_total_sales.toLocaleString()}</td>
                <td className="font-bold">{(margin * 100).toFixed(2)}%</td>
                <td><Input type="date" value={purchase_date} onChange={e => handleChange(row.id, "purchase_date", e.target.value)} /></td>
                <td><Input type="text" value={notes} onChange={e => handleChange(row.id, "notes", e.target.value)} /></td>
                <td><Input type="number" value={total_purchased} onChange={e => handleChange(row.id, "total_purchased", Number(e.target.value))} /></td>
                <td>
                  <Button size="sm" onClick={() => handleSave(row.id)}>Save</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
