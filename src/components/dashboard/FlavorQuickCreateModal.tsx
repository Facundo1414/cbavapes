"use client";
import React, { useState, useEffect } from "react";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Product {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function FlavorQuickCreateModal({ open, onClose, onCreated }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<number | null>(null);
  const [flavor, setFlavor] = useState("");
  const [stock, setStock] = useState(0);
  const [purchasedQuantity, setPurchasedQuantity] = useState(0);
  const [quantitySold, setQuantitySold] = useState(0);
  const [discountsGifts, setDiscountsGifts] = useState(0);
  const [price, setPrice] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [actualTotalSales, setActualTotalSales] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    fetchProducts();
    resetForm();
  }, [open]);

  async function fetchProducts() {
    const { data } = await supabaseBrowser.from("products").select("id, name");
    setProducts(data || []);
  }

  function resetForm() {
    setProductId(null);
    setFlavor("");
    setStock(0);
    setPurchasedQuantity(0);
    setQuantitySold(0);
    setDiscountsGifts(0);
    setPrice(0);
    setTotalSales(0);
    setActualTotalSales(0);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!productId || !flavor) {
      setError("Selecciona un producto y completa el nombre del sabor");
      setLoading(false);
      return;
    }
    const { error } = await supabaseBrowser.from("flavors").insert([
      {
        product_id: productId,
        flavor,
        stock,
        purchased_quantity: purchasedQuantity,
        quantity_sold: quantitySold,
        discounts_gifts: discountsGifts,
        price,
        total_sales: totalSales,
        actual_total_sales: actualTotalSales,
      },
    ]);
    if (error) {
      setError("Error creando sabor: " + error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    resetForm();
    onClose();
    if (onCreated) onCreated();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
          onClick={() => { resetForm(); onClose(); }}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="font-semibold mb-4 text-lg">Agregar nuevo sabor</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs mb-1">Producto</label>
            <select
              className="border rounded p-1 w-full"
              value={productId || ''}
              onChange={e => setProductId(Number(e.target.value))}
              required
            >
              <option value="">Seleccionar producto</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Nombre del sabor</label>
            <Input
              type="text"
              value={flavor}
              onChange={e => setFlavor(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs mb-1">Stock</label>
              <Input type="number" min={0} value={stock} onChange={e => setStock(Number(e.target.value))} required />
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1">Cantidad comprada</label>
              <Input type="number" min={0} value={purchasedQuantity} onChange={e => setPurchasedQuantity(Number(e.target.value))} required />
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1">Cantidad vendida</label>
              <Input type="number" min={0} value={quantitySold} onChange={e => setQuantitySold(Number(e.target.value))} required />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs mb-1">Descuentos/Regalos</label>
              <Input type="number" min={0} value={discountsGifts} onChange={e => setDiscountsGifts(Number(e.target.value))} required />
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1">Precio</label>
              <Input type="number" min={0} value={price} onChange={e => setPrice(Number(e.target.value))} required />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs mb-1">Total ventas</label>
              <Input type="number" min={0} value={totalSales} onChange={e => setTotalSales(Number(e.target.value))} required />
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1">Total ventas real</label>
              <Input type="number" min={0} value={actualTotalSales} onChange={e => setActualTotalSales(Number(e.target.value))} required />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando..." : "Agregar sabor"}
          </Button>
        </form>
      </div>
    </div>
  );
}
