"use client";
import React, { useState, useEffect, useRef } from "react";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Client {
  id: number;
  name: string;
  phone?: string;
  notes?: string;
}

interface Product {
  id: number;
  name: string;
  price?: number;
  flavors: Flavor[];
}

interface Flavor {
  id: number;
  flavor: string;
  price: number;
  stock: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function OrderQuickCreateModal({ open, onClose, onCreated }: Props) {
  // ...resto del componente...
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [newClient, setNewClient] = useState({ name: "", phone: "", notes: "" });
  type OrderItemDraft = {
    product: Product | null;
    flavor: Flavor | null;
    quantity: number;
    price: number;
    discount: number;
  };
  const [items, setItems] = useState<OrderItemDraft[]>([{
    product: null,
    flavor: null,
    quantity: 1,
    price: 0,
    discount: 0,
  }]);
  const [paid, setPaid] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    fetchClients();
    fetchProducts();
  }, [open]);

  async function fetchClients() {
    const { data } = await supabaseBrowser.from("clients").select("id, name, phone, notes");
    setClients(data || []);
  }
  async function fetchProducts() {
    const { data } = await supabaseBrowser.from("products").select("id, name, price, flavors(id, flavor, stock, price)");
    setProducts(data || []);
  }

  function handleClientSelect(client: Client) {
    setSelectedClient(client);
    setNewClient({ name: "", phone: "", notes: "" });
  }
  function handleNewClientChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNewClient({ ...newClient, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setSelectedClient(null);
    setClientSearch("");
    setNewClient({ name: "", phone: "", notes: "" });
    setItems([{ product: null, flavor: null, quantity: 1, price: 0, discount: 0 }]);
    setPaid(false);
    setDelivered(false);
    setDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (loading) return; // Evita envíos múltiples
  setError("");
  setLoading(true);
    let clientId = selectedClient?.id;
    if (!clientId && !newClient.name) {
      setError("Selecciona o crea un cliente");
      setLoading(false);
      return;
    }
    // Validar items
    if (items.length === 0 || items.some(item => !item.product || !item.flavor || item.quantity <= 0 || item.price <= 0)) {
      setError("Completa todos los productos correctamente");
      setLoading(false);
      return;
    }
    // Crear cliente si es nuevo
    if (!clientId) {
      const { data, error } = await supabaseBrowser.from("clients").insert([newClient]).select();
      if (error || !data || !data[0]) {
        setError("Error creando cliente");
        setLoading(false);
        return;
      }
      clientId = data[0].id;
    }
  // Calcular total final y descuento final
  const discountFinal = items.reduce((acc, item) => acc + (item.discount || 0), 0);
  const totalFinal = items.reduce((acc, item) => acc + (item.price * item.quantity - (item.discount || 0)), 0);
    // Crear pedido
    const { data: orderData, error: orderError } = await supabaseBrowser.from("orders").insert([
      {
        client_id: clientId,
        total: totalFinal,
        discount: discountFinal,
        notes,
        created_at: date ? date : new Date().toISOString().slice(0, 10),
        paid,
        delivered,
        status: "nuevo",
      },
    ]).select();
    if (orderError || !orderData || !orderData[0]) {
      setError("Error creando pedido");
      setLoading(false);
      return;
    }
    const orderId = orderData[0].id;
    // Crear items del pedido
    const itemsToInsert = items
      .filter(item => item.product && item.flavor)
      .map(item => ({
        order_id: orderId,
        product_id: item.product!.id,
        product_name: item.product!.name,
        flavor_id: item.flavor!.id,
        flavor: item.flavor!.flavor,
        price: item.price,
        quantity: item.quantity,
      }));
    const { error: itemError } = await supabaseBrowser.from("order_items").insert(itemsToInsert);
    if (itemError) {
      setError("Error creando items del pedido");
      setLoading(false);
      return;
    }
    // Si el pedido se crea como entregado, actualizar stock de sabores
    if (delivered) {
      for (const item of items) {
        if (!item.flavor) continue;
        // Obtener stock actual
        const { data: flavorData, error: flavorError } = await supabaseBrowser.from("flavors").select("stock").eq("id", item.flavor.id).single();
        if (!flavorError && flavorData) {
          const newStock = (flavorData.stock || 0) - (item.quantity || 0);
          await supabaseBrowser.from("flavors").update({ stock: newStock }).eq("id", item.flavor.id);
        }
      }
    }
    setLoading(false);
    resetForm();
    onClose();
    if (onCreated) onCreated();
  }

  if (!open) return null;

  // --- UI ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
          onClick={() => { resetForm(); onClose(); }}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="font-semibold mb-4 text-lg">Nuevo pedido rápido</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Sección Cliente */}
          <div className="border-b pb-4 mb-2">
            <h3 className="font-semibold mb-2 text-base">Cliente</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs mb-1">Buscar cliente</label>
                <Input
                  type="text"
                  placeholder="Buscar por nombre"
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                />
                <div className="max-h-24 overflow-y-auto border rounded mt-1 bg-white">
                  {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).slice(0, 5).map(c => (
                    <div
                      key={c.id}
                      className={`px-2 py-1 cursor-pointer hover:bg-gray-100 ${selectedClient?.id === c.id ? "bg-blue-100" : ""}`}
                      onClick={() => handleClientSelect(c)}
                    >
                      {c.name} {c.phone && <span className="text-xs text-gray-500 ml-2">{c.phone}</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs mb-1">O crear nuevo cliente</label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  value={newClient.name}
                  onChange={handleNewClientChange}
                  required={!selectedClient}
                />
                <Input
                  type="text"
                  name="phone"
                  placeholder="Teléfono"
                  value={newClient.phone}
                  onChange={handleNewClientChange}
                />
                <Input
                  type="text"
                  name="notes"
                  placeholder="Notas"
                  value={newClient.notes}
                  onChange={handleNewClientChange}
                />
              </div>
            </div>
          </div>
          {/* Sección Productos */}
          <div className="border-b pb-4 mb-2">
            <h3 className="font-semibold mb-2 text-base">Productos</h3>
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-wrap gap-2 items-end mb-2 border rounded p-2">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs mb-1">Producto</label>
                  <select
                    className="border rounded p-1 w-full"
                    value={item.product?.id || ''}
                    onChange={e => {
                      const prod = products.find(p => p.id === Number(e.target.value));
                      setItems(items => items.map((it, i) => i === idx ? {
                        ...it,
                        product: prod || null,
                        flavor: null,
                        price: prod?.price || 0,
                      } : it));
                    }}
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs mb-1">Sabor</label>
                  <select
                    className="border rounded p-1 w-full"
                    value={item.flavor?.id || ''}
                    onChange={e => {
                      const flav = item.product?.flavors.find((f: Flavor) => f.id === Number(e.target.value));
                      setItems(items => items.map((it, i) => i === idx ? { ...it, flavor: flav || null } : it));
                    }}
                    required
                    disabled={!item.product}
                  >
                    <option value="">Seleccionar sabor</option>
                    {item.product?.flavors.map((f: Flavor) => (
                      <option key={f.id} value={f.id}>{f.flavor} (Stock: {f.stock})</option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <label className="block text-xs mb-1">Cantidad</label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => setItems(items => items.map((it, i) => i === idx ? { ...it, quantity: Number(e.target.value) } : it))}
                    required
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs mb-1">Precio unitario</label>
                  <Input
                    type="number"
                    min={1}
                    value={item.price}
                    onChange={e => setItems(items => items.map((it, i) => i === idx ? { ...it, price: Number(e.target.value) } : it))}
                    required
                  />
                </div>
                <div className="w-20">
                  <label className="block text-xs mb-1">Descuento</label>
                  <Input
                    type="number"
                    min={0}
                    value={item.discount || 0}
                    onChange={e => setItems(items => items.map((it, i) => i === idx ? { ...it, discount: Number(e.target.value) } : it))}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs mb-1">Total</label>
                  <div className="border rounded p-1 bg-gray-50 text-right">
                    ${(item.price * item.quantity - (item.discount || 0)).toLocaleString()}
                  </div>
                </div>
                <div>
                  {items.length > 1 && (
                    <Button type="button" size="sm" variant="destructive" onClick={() => setItems(items => items.filter((_, i) => i !== idx))}>Quitar</Button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" size="sm" className="mt-2" onClick={() => setItems(items => [...items, { product: null, flavor: null, quantity: 1, price: 0, discount: 0 }])}>
              + Agregar producto
            </Button>
          </div>
          {/* Sección datos generales */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs mb-1">Fecha</label>
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs mb-1">Notas</label>
              <Input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={paid} onChange={e => setPaid(e.target.checked)} /> Pagado
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={delivered} onChange={e => setDelivered(e.target.checked)} /> Entregado
              </label>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs mb-1">Total final</label>
              <div className="border rounded p-1 bg-gray-50 text-right font-bold">
                ${items.reduce((acc, item) => acc + (item.price * item.quantity - (item.discount || 0)), 0).toLocaleString()}
              </div>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs mb-1">Descuento final</label>
              <div className="border rounded p-1 bg-gray-50 text-right font-bold">
                ${items.reduce((acc, item) => acc + (item.discount || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando..." : "Crear pedido"}
          </Button>
        </form>
      </div>
    </div>
  );
}
