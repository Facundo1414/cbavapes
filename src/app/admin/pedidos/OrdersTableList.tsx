import React from "react";
import { Button } from "@/components/ui/button";
import OrderItemsRow from "./OrderItemsRow";

type Order = {
  id: number;
  client_id: number;
  total: number;
  status: string;
  paid: boolean;
  delivered: boolean;
  created_at: string;
  coupon?: string;
  notes?: string;
  followup_done?: boolean;
};
type Client = {
  id: number;
  name: string;
};
type OrdersTableListProps = {
  paginatedOrders: Order[];
  clients: Client[];
  expanded: { [id: number]: boolean };
  setExpanded: React.Dispatch<React.SetStateAction<{ [id: number]: boolean }>>;
  togglePaid: (orderId: number, current: boolean) => void;
  toggleDelivered: (orderId: number, current: boolean) => void;
  handleDeleteOrder: (orderId: number) => void;
};

export default function OrdersTableList({ paginatedOrders, clients, expanded, setExpanded, togglePaid, toggleDelivered, handleDeleteOrder }: OrdersTableListProps) {
  return (
  <table className="min-w-full border bg-white rounded shadow text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 text-left">ID</th>
          <th className="p-2 text-left">Cliente</th>
          <th className="p-2 text-left">Total</th>
          <th className="p-2 text-left">Estado</th>
          <th className="p-2 text-left">Pagado</th>
          <th className="p-2 text-left">Entregado</th>
          <th className="p-2 text-left">Fecha</th>
          <th className="p-2 text-left">Cupón</th>
          <th className="p-2 text-left">Notas</th>
          <th className="p-2 text-left">Seguimiento</th>
          <th className="p-2 text-left">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {paginatedOrders.map((order) => {
          const client = clients.find((c) => c.id === order.client_id);
          const isOpen = expanded[order.id];
          return (
            <React.Fragment key={order.id}>
              <tr key={order.id} className="border-t">
                <td className="p-2">{order.id}</td>
                <td className="p-2 font-semibold">{client?.name || '-'}</td>
                <td className="p-2">${order.total}</td>
                <td className="p-2 font-semibold">{order.status}</td>
                <td className={"p-2 font-semibold text-center " + (order.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                  <input
                    type="checkbox"
                    checked={order.paid}
                    onChange={() => togglePaid(order.id, order.paid)}
                    className="w-5 h-5 accent-green-600"
                    title={order.paid ? 'Pagado' : 'No pagado'}
                  />
                </td>
                <td className={"p-2 font-semibold text-center " + (order.delivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')}>
                  <input
                    type="checkbox"
                    checked={order.delivered}
                    onChange={() => toggleDelivered(order.id, order.delivered)}
                    className="w-5 h-5 accent-yellow-600"
                    title={order.delivered ? 'Entregado' : 'No entregado'}
                  />
                </td>
                <td className="p-2">{order.created_at.slice(0, 10).split('-').reverse().join('/')}</td>
                <td className="p-2">{order.coupon ? String(order.coupon) : '-'}</td>
                <td className="p-2">{order.notes ? order.notes : '-'}</td>
                <td className="p-2">{order.followup_done ? 'Sí' : 'No'}</td>
                <td className="p-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setExpanded((prev) => ({ ...prev, [order.id]: !prev[order.id] }))}>
                    {isOpen ? 'Ocultar' : 'Ver detalle'}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteOrder(order.id)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
              {isOpen && <OrderItemsRow orderId={order.id} />}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
