import { CategoriesTable } from "./CategoriesTable";

export default function AdminCategorias() {
  return (
  <div>
  <h1 className="text-2xl font-bold mb-4 text-left">Gestión de Categorías</h1>
      <div className="w-full">
        <CategoriesTable />
      </div>
    </div>
  );
}
