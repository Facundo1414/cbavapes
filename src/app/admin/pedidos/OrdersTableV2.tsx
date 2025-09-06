// IMPORTANTE: Todas las peticiones a Supabase en este archivo requieren que el usuario esté logueado.
// El JWT debe tener el claim "role": "authenticated".
// Si se usa el token anónimo ("role": "anon"), las policies de Supabase NO permitirán acceso a los datos.
// ---
// IMPORTANTE: Para que la gestión de pedidos funcione correctamente con RLS en Supabase,
// debes tener políticas de SELECT para las tablas orders, clients y order_items.
// Ejemplo de política temporal para debug (ver todos los datos):
//
// create policy "Debug SELECT all" on public.orders for select to public using (true);
// create policy "Debug SELECT all" on public.clients for select to public using (true);
// create policy "Debug SELECT all" on public.order_items for select to public using (true);
//
// Para producción, usa una función is_admin() que lea el claim correcto del JWT:
//
// create or replace function public.is_admin() returns boolean language sql stable as $$
//   select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
// $$;
//
// Y una política:
// create policy "Admin full access" on public.orders for all to public using (is_admin());
// (Repetir para clients y order_items si quieres acceso admin global)
// ---

"use client";
import React, { useEffect, useState, useRef } from "react";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/app/api/products/useProducts";
import OrderItemsRow from "./OrderItemsRow";


import OrderCreateForm from "./OrderCreateForm";
import OrdersTableFilters from "./OrdersTableFilters";
import OrdersTablePagination from "./OrdersTablePagination";
import OrdersTableList from "./OrdersTableList";




export function OrdersTable() {
  // Log de sesión y JWT para depuración
  React.useEffect(() => {
    (async () => {
      if (typeof window !== 'undefined' && 'supabase' in window) {
        // @ts-ignore
        const { data } = await window.supabase.auth.getSession();
        console.log('Supabase session:', data?.session);
        if (data?.session) {
          const jwt = data.session.access_token;
          try {
            const payload = JSON.parse(atob(jwt.split('.')[1]));
            console.log('JWT payload:', payload);
          } catch (e) {
            console.log('No se pudo decodificar el JWT');
          }
        } else {
          console.log('No hay sesión activa de Supabase');
        }
      }
    })();
  }, []);
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
  // Estado para los items del pedido
  const [orderItems, setOrderItems] = useState<any[]>([]);
  // Estado para el item en edición
  const [selectedProductId, setSelectedProductId] = useState<number|null>(null);
  const [selectedFlavorId, setSelectedFlavorId] = useState<number|null>(null);
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);

  // Cambiar estado pagado/entregado
  async function togglePaid(orderId: number, current: boolean) {
  await supabaseBrowser.from("orders").update({ paid: !current }).eq("id", orderId);
  // Actualizar stock al marcar/desmarcar pagado
  const { data: items, error } = await supabaseBrowser.from("order_items").select("flavor_id, quantity").eq("order_id", orderId);
  if (!error && items) {
    for (const item of items) {
      // Obtener stock actual
      const { data: flavorData, error: flavorError } = await supabaseBrowser.from("flavors").select("stock").eq("id", item.flavor_id).single();
      if (!flavorError && flavorData) {
        let newStock;
        if (!current) {
          // Se marca como pagado: restar
          newStock = (flavorData.stock || 0) - (item.quantity || 0);
        } else {
          // Se desmarca: sumar
          newStock = (flavorData.stock || 0) + (item.quantity || 0);
        }
        await supabaseBrowser.from("flavors").update({ stock: newStock }).eq("id", item.flavor_id);
      }
    }
  }
  await fetchAll();
  }
  async function toggleDelivered(orderId: number, current: boolean) {
  await supabaseBrowser.from("orders").update({ delivered: !current }).eq("id", orderId);
  // Si se marca como entregado, restar stock. Si se desmarca, restaurar stock.
  const { data: items, error } = await supabaseBrowser.from("order_items").select("flavor_id, quantity").eq("order_id", orderId);
  if (!error && items) {
    for (const item of items) {
      // Obtener stock actual
      const { data: flavorData, error: flavorError } = await supabaseBrowser.from("flavors").select("stock").eq("id", item.flavor_id).single();
      if (!flavorError && flavorData) {
        let newStock;
        if (!current) {
          // Se marca como entregado: restar
          newStock = (flavorData.stock || 0) - (item.quantity || 0);
        } else {
          // Se desmarca: sumar
          newStock = (flavorData.stock || 0) + (item.quantity || 0);
        }
        await supabaseBrowser.from("flavors").update({ stock: newStock }).eq("id", item.flavor_id);
      }
    }
  }
  await fetchAll();
  }
  const pageSize = 15;
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
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

    // LOG para depuración
    console.log("ordersData", ordersData);
    console.log("ordersError", ordersError);
    console.log("clientsData", clientsData);
    console.log("clientsError", clientsError);

    if (ordersError || clientsError) setError(ordersError?.message || clientsError?.message || null);
    else {
      setOrders(ordersData || []);
      setClients(clientsData || []);
    }
    setLoading(false);
  };

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
                        product_name: prod?.name,
                        brand: prod?.brand,
                        flavor_id: selectedFlavorId,
                        flavor: flav?.flavor,
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
  );
}
