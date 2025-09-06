import { ProductsTable } from "./ProductsTable";

export default function AdminProductos() {
  return (
    <div>
  <h1 className="text-2xl font-bold mb-4 text-left">Gestión de Productos</h1>
      <ProductsTable />
    </div>
  );
}
