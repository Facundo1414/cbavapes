'use client'
import FlavorQuickCreateModal from "@/components/dashboard/FlavorQuickCreateModal";
import ProductQuickCreateModal from "@/components/dashboard/ProductQuickCreateModal";

import { useEffect, useState } from "react";

interface RecentOrder {
  id: number;
  client_id: number;
  total: number;
  created_at: string;
  status: string;
  clients?: { name?: string };
  cliente_nombre: string;
}

interface FlavorStock {
  stock: number;
}

interface OrderTotal {
  total: number;
}
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OrderQuickCreateModal from "@/components/dashboard/OrderQuickCreateModal";


import { useRouter } from "next/navigation";

function QuickActions({ onNuevoPedido, onNuevoProducto, onNuevoSabor }: { onNuevoPedido: () => void, onNuevoProducto: () => void, onNuevoSabor: () => void }) {
  const router = useRouter();
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Acciones rápidas</h2>
      <div className="flex flex-wrap gap-2">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onNuevoPedido}
        >
          Nuevo pedido
        </Button>
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={onNuevoProducto}
        >
          Agregar producto
        </Button>
        <Button
          className="bg-pink-600 hover:bg-pink-700 text-white"
          onClick={onNuevoSabor}
        >
          Agregar sabor
        </Button>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => router.push("/admin/stock")}
        >
          Nuevo stock
        </Button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [ventas, setVentas] = useState(0);
  const [stock, setStock] = useState(0);
  const [clientes, setClientes] = useState(0);
  const [pedidos, setPedidos] = useState(0);
  const [recientes, setRecientes] = useState<RecentOrder[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modalPedidoOpen, setModalPedidoOpen] = useState(false);
  const [modalProductoOpen, setModalProductoOpen] = useState(false);
  const [modalSaborOpen, setModalSaborOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [flavorsRes, cliRes, pedRes, ventasRes, pedidosRes] = await Promise.all([
        supabaseBrowser.from("flavors").select("stock"),
        supabaseBrowser.from("clients").select("id", { count: "exact", head: true }),
        supabaseBrowser.from("orders").select("id", { count: "exact", head: true }),
        supabaseBrowser.from("orders").select("total"),
        supabaseBrowser.from("orders").select("id, client_id, total, created_at, status, clients(name)").order("created_at", { ascending: false }).limit(5),
      ]);
      if (flavorsRes.error || cliRes.error || pedRes.error || ventasRes.error || pedidosRes.error) {
        setErrorMsg(
          [flavorsRes.error, cliRes.error, pedRes.error, ventasRes.error, pedidosRes.error]
            .filter(Boolean)
            .map(e => e ? e.message : "")
            .join(" | ")
        );
      }
      // Calcular el stock total sumando el stock de todos los flavors
      const totalStock = (flavorsRes.data as FlavorStock[] || []).reduce((acc: number, f: FlavorStock) => acc + (f.stock ? Number(f.stock) : 0), 0);
      setStock(totalStock);
      setClientes(cliRes.count || 0);
      setPedidos(pedRes.count || 0);
      setVentas((ventasRes.data as OrderTotal[] || []).reduce((acc: number, o: OrderTotal) => acc + (o.total ? Number(o.total) : 0), 0));
      setRecientes((pedidosRes.data as Omit<RecentOrder, 'cliente_nombre'>[] || []).map((p) => ({
        ...p,
        cliente_nombre: p.clients?.name || "-"
      })));
    } catch (err) {
      setErrorMsg((err instanceof Error ? err.message : String(err)));
    }
  }

  return (
    <div className="space-y-8">
      {errorMsg && <div className="bg-red-100 text-red-700 p-2 rounded">Error: {errorMsg}</div>}
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      <QuickActions 
        onNuevoPedido={() => setModalPedidoOpen(true)}
        onNuevoProducto={() => setModalProductoOpen(true)}
        onNuevoSabor={() => setModalSaborOpen(true)}
      />
  <OrderQuickCreateModal open={modalPedidoOpen} onClose={() => setModalPedidoOpen(false)} onCreated={fetchStats} />
  {/* Modal para agregar producto */}
  <ProductQuickCreateModal open={modalProductoOpen} onClose={() => setModalProductoOpen(false)} onCreated={fetchStats} />
  {/* Modal para agregar sabor */}
  <FlavorQuickCreateModal open={modalSaborOpen} onClose={() => setModalSaborOpen(false)} onCreated={fetchStats} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-xs text-gray-500">Ventas</div>
          <div className="text-2xl font-bold">${ventas.toLocaleString()}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xs text-gray-500">Stock</div>
          <div className="text-2xl font-bold">{stock}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xs text-gray-500">Clientes</div>
          <div className="text-2xl font-bold">{clientes}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xs text-gray-500">Pedidos</div>
          <div className="text-2xl font-bold">{pedidos}</div>
        </Card>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Pedidos recientes</h2>
        {recientes.length === 0 ? (
          <div className="text-gray-500">Sin datos aún.</div>
        ) : (
          <table className="min-w-full border text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-center">ID</th>
                <th className="border px-2 py-1 text-center">Cliente</th>
                <th className="border px-2 py-1 text-center">Total</th>
                <th className="border px-2 py-1 text-center">Fecha</th>
                <th className="border px-2 py-1 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recientes.map((p) => (
                <tr key={p.id}>
                  <td className="border px-2 py-1 text-center">{p.id}</td>
                  <td className="border px-2 py-1 text-center">{p.cliente_nombre}</td>
                  <td className="border px-2 py-1 text-center">${p.total?.toLocaleString()}</td>
                  <td className="border px-2 py-1 text-center">{p.created_at?.slice(0, 10)}</td>
                  <td className="border px-2 py-1 text-center">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
