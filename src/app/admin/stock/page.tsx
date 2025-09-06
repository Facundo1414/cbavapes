import { StockTable } from "./StockTable";

export default function AdminStock() {
  return (
  <div>
  <h1 className="text-2xl font-bold mb-4 text-left">Gestión de Stock</h1>
      <div className="w-full">
        <StockTable />
      </div>
    </div>
  );
}
