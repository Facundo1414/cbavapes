"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryForm, CategoryFormValues } from "./CategoryForm";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";

export type Category = {
  key: string;
  name: string;
  image: string;
  description: string;
};


export function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);



  async function fetchCategories() {
    setLoading(true);
  const { data, error } = await supabaseBrowser.from("categories").select();
    if (error) setError(error.message);
    else setCategories(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  async function handleSave(values: CategoryFormValues) {
    if (editCategory) {
      // Editar
  await supabaseBrowser.from("categories").update(values).eq("key", editCategory.key);
    } else {
      // Alta
  await supabaseBrowser.from("categories").insert([values]);
    }
    setShowForm(false);
    setEditCategory(null);
    fetchCategories();
  }

  async function handleDelete(key: string) {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
  await supabaseBrowser.from("categories").delete().eq("key", key);
    fetchCategories();
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded" />
        ))}
      </div>
    );
  }

  if (error) return <p className="text-red-500">Error: {error}</p>;

  if (showForm) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">{editCategory ? "Editar categoría" : "Agregar categoría"}</h2>
        <CategoryForm
          initial={editCategory || undefined}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditCategory(null); }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setShowForm(true); setEditCategory(null); }}>Agregar categoría</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Descripción</th>
              <th className="p-2 text-left">Imagen</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.key} className="border-t">
                <td className="p-2 font-semibold">{cat.name}</td>
                <td className="p-2">{cat.description}</td>
                <td className="p-2"><img src={cat.image} alt={cat.name} className="h-10 w-10 object-contain" /></td>
                <td className="p-2">
                  <Button size="sm" variant="outline" className="mr-2" onClick={() => { setEditCategory(cat); setShowForm(true); }}>Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(cat.key)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
