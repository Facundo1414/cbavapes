// ...existing code...
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import { useEffect, useState } from "react";

type OrdenesData = { fecha: string; cantidad: number }[];

export function useCantidadOrdenes(periodo: "mes" | "semana") {
  const [data, setData] = useState<OrdenesData>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrdenes() {
      setLoading(true);
      const fromDate = new Date();
      if (periodo === "mes") {
        fromDate.setDate(1);
      } else {
        fromDate.setDate(fromDate.getDate() - 7);
      }
      const { data: orders, error } = await supabaseBrowser
        .from("orders")
        .select("id, created_at")
        .gte("created_at", fromDate.toISOString());
      if (error || !orders) {
        setData([]);
      } else {
        const agrupado: Record<string, number> = {};
        orders.forEach((order: { id: number; created_at: string }) => {
          const fecha =
            periodo === "mes"
              ? order.created_at.slice(0, 7)
              : order.created_at.slice(0, 10);
          agrupado[fecha] = (agrupado[fecha] || 0) + 1;
        });
        setData(
          Object.entries(agrupado).map(([fecha, cantidad]) => ({
            fecha,
            cantidad: Number(cantidad),
          }))
        );
      }
      setLoading(false);
    }
    fetchOrdenes();
  }, [periodo]);

  return { data, loading };
}

type VentasData = { fecha: string; total: number }[];
type ProductoData = { name: string; ventas: number }[];
type SaborData = { name: string; ventas: number }[];

export function useVentas(periodo: "mes" | "semana") {
  const [data, setData] = useState<VentasData>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVentas() {
      setLoading(true);
      const fromDate = new Date();
      if (periodo === "mes") {
        // Últimos 6 meses
        fromDate.setMonth(fromDate.getMonth() - 5);
        fromDate.setDate(1);
      } else {
        fromDate.setDate(fromDate.getDate() - 7);
      }
      const { data: orders, error } = await supabaseBrowser
        .from("orders")
        .select("id, total, created_at")
        .gte("created_at", fromDate.toISOString());
      if (error || !orders) {
        setData([]);
      } else {
        const agrupado: Record<string, number> = {};
        orders.forEach(
          (order: { id: number; total: number; created_at: string }) => {
            const fecha =
              periodo === "mes"
                ? order.created_at.slice(0, 7)
                : order.created_at.slice(0, 10);
            agrupado[fecha] = (agrupado[fecha] || 0) + (order.total || 0);
          }
        );
        let result = Object.entries(agrupado).map(([fecha, total]) => ({
          fecha,
          total: Number(total),
        }));
        if (periodo === "mes") {
          // Ordenar y limitar a los últimos 6 meses
          result = result
            .sort((a, b) => a.fecha.localeCompare(b.fecha))
            .slice(-6);
        }
        setData(result);
      }
      setLoading(false);
    }
    fetchVentas();
  }, [periodo]);

  return { data, loading };
}

export function useProductosMasVendidos() {
  const [data, setData] = useState<ProductoData>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProductos() {
      setLoading(true);
      const { data: items, error } = await supabaseBrowser
        .from("order_items")
        .select("product_id, product_name, quantity");
      if (error || !items) {
        setData([]);
      } else {
        const agrupado: Record<string, number> = {};
        items.forEach(
          (item: {
            product_id: number;
            product_name: string;
            quantity: number;
          }) => {
            agrupado[item.product_name] =
              (agrupado[item.product_name] || 0) + (item.quantity || 0);
          }
        );
        setData(
          Object.entries(agrupado).map(([name, ventas]) => ({
            name,
            ventas: Number(ventas),
          }))
        );
      }
      setLoading(false);
    }
    fetchProductos();
  }, []);

  return { data, loading };
}

export function useSaboresMasVendidos() {
  const [data, setData] = useState<SaborData>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSabores() {
      setLoading(true);
      const { data: items, error } = await supabaseBrowser
        .from("order_items")
        .select("flavor, quantity");
      if (error || !items) {
        setData([]);
      } else {
        const agrupado: Record<string, number> = {};
        items.forEach((item: { flavor: string; quantity: number }) => {
          agrupado[item.flavor] =
            (agrupado[item.flavor] || 0) + (item.quantity || 0);
        });
        setData(
          Object.entries(agrupado).map(([name, ventas]) => ({
            name,
            ventas: Number(ventas),
          }))
        );
      }
      setLoading(false);
    }
    fetchSabores();
  }, []);

  return { data, loading };
}
