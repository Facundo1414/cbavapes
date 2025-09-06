import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";

type OrderItemInput = {
  product_id: number;
  product_name: string;
  brand: string;
  flavor_id: number;
  flavor: string;
  qty: number;
  price: number;
  discount?: number;
};

type Client = {
  id: number;
  name: string;
  phone?: string;
  notes?: string;
};
type Props = {
  clients: Client[];
  onCreated: () => void;
  orderItems: OrderItemInput[];
};

export default function OrderCreateForm({ clients, onCreated, orderItems }: Props) {
  const [clientName, setClientName] = useState("");
  const [total, setTotal] = useState("");
  const [notes, setNotes] = useState("");
  const [coupon, setCoupon] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  // Calcular descuento total sumando los descuentos de cada producto
  const discount = orderItems.reduce((acc, item) => acc + (item.discount || 0), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (!clientName || !total || !orderItems.length) {
      setLoading(false);
      return;
    }
  const client = clients.find(c => c.name?.toLowerCase().trim() === clientName.toLowerCase().trim());
  let client_id = client?.id;
    if (!client_id) {
  const { data, error } = await supabaseBrowser.from("clients").insert([{ name: clientName }]).select();
      if (error || !data || !data[0]) {
        setLoading(false);
        return;
      }
      client_id = data[0].id;
    }
  const { data: orderData, error: orderError } = await supabaseBrowser.from("orders").insert([
      {
        client_id,
        total: Number(total),
        notes,
        coupon: coupon || null,
        created_at: date ? date : new Date().toISOString().slice(0, 10),
        paid: false,
        delivered: false,
        status: "nuevo",
        discount,
      },
    ]).select();
    if (orderError || !orderData || !orderData[0]) {
      setLoading(false);
      return;
    }
    const order_id = orderData[0].id;
    const itemsToInsert = orderItems.map(item => ({
  order_id,
  product_id: item.product_id,
  flavor_id: item.flavor_id,
  product_name: item.product_name,
  flavor: item.flavor,
  quantity: item.qty,
  price: item.price,
  // No se envía discount aquí
    }));
    if (itemsToInsert.length > 0) {
  const { error: orderItemsError } = await supabaseBrowser.from("order_items").insert(itemsToInsert);
      if (orderItemsError) {
        alert("Error al guardar productos del pedido: " + orderItemsError.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    setClientName("");
    setTotal("");
    setNotes("");
    setCoupon("");
    setDate("");
    nameRef.current?.focus();
    onCreated();
  }

  return (
    <form className="flex flex-wrap gap-2" onSubmit={handleSubmit}>
      <input ref={nameRef} className="border p-1 rounded" placeholder="Cliente (ej: Juan Perez)" value={clientName} onChange={e => setClientName(e.target.value)} required />
      <input className="border p-1 rounded" placeholder="Total (ej: 12000)" value={total} onChange={e => setTotal(e.target.value)} type="number" required />
      <input className="border p-1 rounded" placeholder="Notas (ej: Instagram)" value={notes} onChange={e => setNotes(e.target.value)} />
      <input className="border p-1 rounded" placeholder="Cupón (opcional)" value={coupon} onChange={e => setCoupon(e.target.value)} />
      <input className="border p-1 rounded" type="date" value={date} onChange={e => setDate(e.target.value)} />
      {/* Total Final y Descuento Final juntos, solo lectura */}
      <div className="flex gap-2 items-center mt-2">
        <input className="border p-1 rounded bg-gray-100" placeholder="Total Final" value={total} readOnly />
        <input className="border p-1 rounded bg-gray-100" placeholder="Descuento Final" value={discount} readOnly />
      </div>
      <Button size="sm" type="submit" disabled={loading || !orderItems.length}>{loading ? "Agregando..." : "Agregar"}</Button>
      {orderItems.length === 0 && <span className="text-xs text-red-500 ml-2">Agregá al menos un producto</span>}
    </form>
  );
}
