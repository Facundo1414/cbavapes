"use client";
import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/app/api/products/useProducts";
import { toast, Toaster } from "sonner";
// import OrderItemsRow from "./OrderItemsRow";


import OrderCreateForm from "./OrderCreateForm";
import OrdersTableFilters from "./OrdersTableFilters";
import OrdersTablePagination from "./OrdersTablePagination";
import OrdersTableList from "./OrdersTableList";

interface NewClient {
  name: string;
  phone?: string;
  notes?: string;
}

interface Product {
  id: number;
  name: string;
  brand?: string;
  flavors: {
    id: number;
    flavor: string;
    price: number;
    stock: number;
  }[];
}

interface Flavor {
  id: number;
  flavor: string;
  price: number;
  stock: number;
}

interface OrderItemDraft {
  product: Product;
  flavor: Flavor;
  quantity: number;
  price: number;
  discount: number;
}

// Estado para los items del pedido
type OrderItemDraft2 = {
    product_id: number;
    product_name: string;
    brand: string;
    flavor_id: number;
    flavor: string;
    qty: number;
    price: number;
  };
  type Order = {
    id: number;
    client_id: number;
    created_at: string;
    paid: boolean;
    delivered: boolean;
    total: number;
    notes?: string;
    coupon?: string;
    discount?: number;
  status: string;
  };
  type Client = {
    id: number;
    name: string;
    phone?: string;
    notes?: string;
  };

export function OrdersTable() {

  // Eliminar pedido y sus detalles
  async function handleDeleteOrder(orderId: number) {
    if (!window.confirm('¿Seguro que querés eliminar este pedido y sus productos?')) return;
    // Eliminar detalles primero
  await supabaseBrowser.from('order_items').delete().eq('order_id', orderId);
  // Eliminar pedido
  await supabaseBrowser.from('orders').delete().eq('id', orderId);
    await fetchAll();
  }
  // Para el modal de alta de pedido
  const { products, loading: loadingProducts } = useProducts();
  // Estado para el modal
  const [modalOpen, setModalOpen] = useState(false);

  const [orderItems, setOrderItems] = useState<OrderItemDraft2[]>([]);
  // Estado para el item en edición
  const [selectedProductId, setSelectedProductId] = useState<number|null>(null);
  const [selectedFlavorId, setSelectedFlavorId] = useState<number|null>(null);
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);

  // Cambiar estado pagado/entregado
  async function togglePaid(orderId: number, current: boolean) {
    await supabaseBrowser.from("orders").update({ paid: !current }).eq("id", orderId);
    // Actualizar stock y cantidad vendida al marcar/desmarcar pagado
    const { data: items, error } = await supabaseBrowser.from("order_items").select("flavor_id, quantity").eq("order_id", orderId);
    if (!error && items) {
      for (const item of items) {
        // Obtener stock y cantidad vendida actual
        const { data: flavorData, error: flavorError } = await supabaseBrowser.from("flavors").select("stock, quantity_sold, price").eq("id", item.flavor_id).single();
        if (!flavorError && flavorData) {
          let newStock;
          let newSoldQuantity;
          if (!current) {
            // Se marca como pagado: restar stock, aumentar cantidad vendida
            newStock = (flavorData.stock || 0) - (item.quantity || 0);
            newSoldQuantity = (flavorData.quantity_sold || 0) + (item.quantity || 0);
          } else {
            // Se desmarca: sumar stock, restar cantidad vendida
            newStock = (flavorData.stock || 0) + (item.quantity || 0);
            newSoldQuantity = (flavorData.quantity_sold || 0) - (item.quantity || 0);
          }
          if (newStock < 0) {
            console.error('[Error] No hay suficiente stock para completar la operación.');
            return;
          }
          await supabaseBrowser.from("flavors").update({ stock: newStock, quantity_sold: newSoldQuantity }).eq("id", item.flavor_id);
        }
      }
    }
    await updateOrderStatus(orderId);
    await fetchAll();
  }
  async function toggleDelivered(orderId: number, current: boolean) {
    await supabaseBrowser.from("orders").update({ delivered: !current }).eq("id", orderId);
    // Actualizar stock y cantidad vendida al marcar/desmarcar entregado
    const { data: items, error } = await supabaseBrowser.from("order_items").select("flavor_id, quantity").eq("order_id", orderId);
    if (!error && items) {
      for (const item of items) {
        // Obtener stock y cantidad vendida actual
        const { data: flavorData, error: flavorError } = await supabaseBrowser.from("flavors").select("stock, quantity_sold, price").eq("id", item.flavor_id).single();
        if (!flavorError && flavorData) {
          let newStock;
          let newSoldQuantity;
          if (!current) {
            // Se marca como entregado: restar stock, aumentar cantidad vendida
            newStock = (flavorData.stock || 0) - (item.quantity || 0);
            newSoldQuantity = (flavorData.quantity_sold || 0) + (item.quantity || 0);
          } else {
            // Se desmarca: sumar stock, restar cantidad vendida
            newStock = (flavorData.stock || 0) + (item.quantity || 0);
            newSoldQuantity = (flavorData.quantity_sold || 0) - (item.quantity || 0);
          }
          if (newStock < 0) {
            console.error('[Error] No hay suficiente stock para completar la operación.');
            return;
          }
          await supabaseBrowser.from("flavors").update({ stock: newStock, quantity_sold: newSoldQuantity }).eq("id", item.flavor_id);
        }
      }
    }
    await updateOrderStatus(orderId);
    await fetchAll();
  }
  const pageSize = 15;

  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<{ [id: number]: boolean }>({});
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [filterDelivered, setFilterDelivered] = useState<'all' | 'delivered' | 'undelivered'>('all');
  const [page, setPage] = useState(1);
  // Filtros y paginación
  const filteredOrders = orders.filter((order) => {
    let paidOk = true;
    let deliveredOk = true;
    if (filterPaid === 'paid') paidOk = order.paid;
    if (filterPaid === 'unpaid') paidOk = !order.paid;
    if (filterDelivered === 'delivered') deliveredOk = order.delivered;
    if (filterDelivered === 'undelivered') deliveredOk = !order.delivered;
    return paidOk && deliveredOk;
  });
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  // fetchAll debe estar fuera para ser visible en los handlers
  const fetchAll = async () => {
    setLoading(true);
    const { data: ordersData, error: ordersError } = await supabaseBrowser
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: clientsData, error: clientsError } = await supabaseBrowser
      .from("clients")
      .select("*");


    if (ordersError || clientsError) {
      setError(ordersError?.message || clientsError?.message || null);
      toast.error("Ocurrió un error al cargar las órdenes.");
    } else {
      setOrders(ordersData || []);
      setClients(clientsData || []);
      toast.success("Órdenes cargadas exitosamente.");
    }
    setLoading(false);
  };

  // Actualizar el estado a "Completado" si ambos campos están en true
  async function updateOrderStatus(orderId: number) {
    const { data, error } = await supabaseBrowser
      .from("orders")
      .select("paid, delivered")
      .eq("id", orderId)
      .single();

    if (!error && data) {
      if (data.paid && data.delivered) {
        await supabaseBrowser.from("orders").update({ status: "Completado" }).eq("id", orderId);
      }
    }
  }

  // Crear pedido
  async function createOrder({
    clientId,
    newClient,
    items,
    notes,
    date,
    paid,
    delivered,
  }: {
    clientId: number | null;
    newClient: NewClient;
    items: OrderItemDraft[];
    notes: string;
    date: string;
    paid: boolean;
    delivered: boolean;
  }) {
    let finalClientId = clientId;

    if (!finalClientId && newClient.name) {
      const { data, error } = await supabaseBrowser.from("clients").insert([newClient]).select();
      if (error || !data || !data[0]) {
        throw new Error("Error creando cliente");
      }
      finalClientId = data[0].id;
    }

    const discountFinal = items.reduce((acc: number, item: OrderItemDraft) => acc + (item.discount || 0), 0);
    const totalFinal = items.reduce((acc: number, item: OrderItemDraft) => acc + (item.price * item.quantity - (item.discount || 0)), 0);

    const { data: orderData, error: orderError } = await supabaseBrowser.from("orders").insert([
      {
        client_id: finalClientId,
        total: totalFinal,
        discount: discountFinal,
        notes,
        created_at: date || new Date().toISOString().slice(0, 10),
        paid,
        delivered,
        status: "nuevo",
      },
    ]).select();

    if (orderError || !orderData || !orderData[0]) {
      throw new Error("Error creando pedido");
    }

    const orderId = orderData[0].id;
    const itemsToInsert = items.map((item: OrderItemDraft) => ({
      order_id: orderId,
      product_id: item.product.id,
      product_name: item.product.name,
      flavor_id: item.flavor.id,
      flavor: item.flavor.flavor,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemError } = await supabaseBrowser.from("order_items").insert(itemsToInsert);
    if (itemError) {
      throw new Error("Error creando items del pedido");
    }

    if (delivered) {
      for (const item of items) {
        const { data: flavorData, error: flavorError } = await supabaseBrowser.from("flavors").select("stock").eq("id", item.flavor.id).single();
        if (!flavorError && flavorData) {
          const newStock = (flavorData.stock || 0) - item.quantity;
          await supabaseBrowser.from("flavors").update({ stock: newStock }).eq("id", item.flavor.id);
        }
      }
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

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

  // ...existing code...


  return (
    <>
    <div>
      {/* Botón para abrir modal de alta de pedido */}
      <div className="mb-6 flex justify-end">
        <Button size="sm" onClick={() => setModalOpen(true)}>
          Agregar pedido
        </Button>
      </div>
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              onClick={() => setModalOpen(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <div className="font-semibold mb-2 text-lg">Nuevo pedido</div>
            <OrderCreateForm
              clients={clients}
              orderItems={orderItems}
              onCreated={() => {
                setModalOpen(false);
                fetchAll();
                setOrderItems([]);
              }}
            />
            {/* Detalles del pedido: productos, sabores, cantidad, precio */}
            <div className="mt-4">
              <div className="font-semibold mb-1">Detalles del pedido</div>
              <div className="flex flex-wrap gap-2 items-end mb-2">
                {/* Producto */}
                <div>
                  <label className="block text-xs mb-1">Producto</label>
                  <select
                    className="border rounded p-1 min-w-[120px]"
                    value={selectedProductId ?? ''}
                    onChange={e => {
                      setSelectedProductId(Number(e.target.value));
                      setSelectedFlavorId(null);
                    }}
                  >
                    <option value="">Seleccionar</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>
                    ))}
                  </select>
                </div>
                {/* Sabor */}
                <div>
                  <label className="block text-xs mb-1">Sabor</label>
                  <select
                    className="border rounded p-1 min-w-[120px]"
                    value={selectedFlavorId ?? ''}
                    onChange={e => {
                      setSelectedFlavorId(Number(e.target.value));
                      const prod = products.find(p => p.id === selectedProductId);
                      const flav = prod?.flavors.find(f => f.id === Number(e.target.value));
                      setItemPrice(flav?.price || 0);
                    }}
                    disabled={!selectedProductId}
                  >
                    <option value="">Seleccionar</option>
                    {selectedProductId && products.find(p => p.id === selectedProductId)?.flavors.map(f => (
                      <option key={f.id} value={f.id}>{f.flavor}</option>
                    ))}
                  </select>
                </div>
                {/* Cantidad */}
                <div>
                  <label className="block text-xs mb-1">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    className="border rounded p-1 w-16"
                    value={itemQty}
                    onChange={e => setItemQty(Number(e.target.value))}
                    disabled={!selectedFlavorId}
                  />
                </div>
                {/* Precio */}
                <div>
                  <label className="block text-xs mb-1">Precio</label>
                  <input
                    type="number"
                    className="border rounded p-1 w-20"
                    value={itemPrice}
                    onChange={e => setItemPrice(Number(e.target.value))}
                    disabled={!selectedFlavorId}
                  />
                </div>
                {/* Agregar item */}
                <Button
                  size="sm"
                  className="h-8"
                  disabled={!selectedProductId || !selectedFlavorId || itemQty < 1}
                  onClick={e => {
                    e.preventDefault();
                    if (!selectedProductId || !selectedFlavorId) return;
                    const prod = products.find(p => p.id === selectedProductId);
                    const flav = prod?.flavors.find(f => f.id === selectedFlavorId);
                    setOrderItems(items => [
                      ...items,
                      {
                        product_id: selectedProductId,
                        product_name: prod?.name || "",
                        brand: prod?.brand || "",
                        flavor_id: selectedFlavorId,
                        flavor: flav?.flavor || "",
                        qty: itemQty,
                        price: itemPrice,
                      }
                    ]);
                    setSelectedProductId(null);
                    setSelectedFlavorId(null);
                    setItemQty(1);
                    setItemPrice(0);
                  }}
                >Agregar</Button>
              </div>
              {/* Lista de items agregados */}
              <div className="border rounded p-2 bg-gray-50">
                {orderItems.length === 0 ? (
                  <div className="text-xs text-gray-400">No hay productos agregados.</div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="p-1 text-left">Producto</th>
                        <th className="p-1 text-left">Sabor</th>
                        <th className="p-1 text-right">Cantidad</th>
                        <th className="p-1 text-right">Precio</th>
                        <th className="p-1 text-right">Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-1">{item.brand} - {item.product_name}</td>
                          <td className="p-1">{item.flavor}</td>
                          <td className="p-1 text-right">{item.qty}</td>
                          <td className="p-1 text-right">${item.price}</td>
                          <td className="p-1 text-right">${item.qty * item.price}</td>
                          <td className="p-1 text-right">
                            <button
                              className="text-red-500 hover:underline"
                              onClick={e => {
                                e.preventDefault();
                                setOrderItems(items => items.filter((_, i) => i !== idx));
                              }}
                              title="Quitar"
                            >✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      <OrdersTableFilters
        filterPaid={filterPaid}
        setFilterPaid={setFilterPaid}
        filterDelivered={filterDelivered}
        setFilterDelivered={setFilterDelivered}
      />
      <OrdersTableList
        paginatedOrders={paginatedOrders}
        clients={clients}
        expanded={expanded}
        setExpanded={setExpanded}
        togglePaid={togglePaid}
        toggleDelivered={toggleDelivered}
        handleDeleteOrder={handleDeleteOrder}
      />
      <OrdersTablePagination page={page} pageCount={pageCount} setPage={setPage} />
    </div>
    <Toaster />
    </>
  );
}
