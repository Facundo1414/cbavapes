"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useState } from "react";
import { useVentas, useCantidadOrdenes, useProductosMasVendidos, useSaboresMasVendidos } from "./hooks";

export default function AdminIntegraciones() {
  const [periodo, setPeriodo] = useState<'mes' | 'semana'>('mes');
  const { data: ventas, loading: loadingVentas } = useVentas(periodo);
  const { data: ordenes, loading: loadingOrdenes } = useCantidadOrdenes(periodo);
  const { data: productos, loading: loadingProductos } = useProductosMasVendidos();
  const { data: sabores, loading: loadingSabores } = useSaboresMasVendidos();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Integraciones</h1>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-xl font-semibold">Ventas ({periodo === 'mes' ? 'mensual' : 'semanal'})</h2>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={periodo}
            onChange={e => setPeriodo(e.target.value as 'mes' | 'semana')}
          >
            <option value="mes">Mensual</option>
            <option value="semana">Semanal</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Total vendido ($)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ventas} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis tickFormatter={value => value.toLocaleString('es-AR')} />
                <Tooltip formatter={value => value.toLocaleString('es-AR')} />
                <Legend />
                <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {loadingVentas && <p className="text-gray-500 mt-2">Cargando ventas...</p>}
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Cantidad de órdenes</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ordenes} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis tickFormatter={value => value.toLocaleString('es-AR')} />
                <Tooltip formatter={value => value.toLocaleString('es-AR')} />
                <Legend />
                <Bar dataKey="cantidad" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {loadingOrdenes && <p className="text-gray-500 mt-2">Cargando órdenes...</p>}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Productos más vendidos</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productos} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ventas" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {loadingProductos && <p className="text-gray-500 mt-2">Cargando productos...</p>}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sabores más vendidos</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sabores} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ventas" fill="#f59e42" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {loadingSabores && <p className="text-gray-500 mt-2">Cargando sabores...</p>}
        </div>
      </div>

      {/* Aquí irá la configuración de integraciones externas */}
      <p className="text-gray-500">Próximamente: WhatsApp, Analytics, y más.</p>
    </div>
  );
}
