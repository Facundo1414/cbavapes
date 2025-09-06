import { OrdersTable } from "./OrdersTableV2";

export default function AdminPedidos() {
  return (
  <div>
  <h1 className="text-2xl font-bold mb-4 text-left">Gestión de Pedidos</h1>
      <div className="w-full">
        <OrdersTable />
      </div>
    </div>
  );
}
