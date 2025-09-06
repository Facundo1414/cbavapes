"use client";
import { useState } from "react";
import useCategories from "./useCategories";
import { Button } from "@/components/ui/button";

export type ProductFormValues = {
  id?: number;
  name: string;
  price: number;
  brand?: string;
  category_key?: string;
  image1?: string;
  image2?: string;
  image3?: string;
};

export function ProductForm({ initial, onSave, onCancel }: {
  initial?: ProductFormValues;
  onSave: (values: ProductFormValues) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<ProductFormValues>(
    initial || { name: "", price: 0, brand: "", category_key: "", image1: "", image2: "", image3: "" }
  );
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: name === "price" || name === "stock" ? Number(value) : value }));
  }

  const { categories, loading: loadingCategories } = useCategories();

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  // Eliminar id y d antes de enviar
  const { id, ...cleanValues } = values;
  await onSave(cleanValues);
  setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Nombre</label>
  <input name="name" value={values.name} onChange={handleChange} required className="w-full border-2 border-primary focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-lg p-2 rounded bg-gray-300 text-gray-900 transition" />
      </div>
      <div>
        <label className="block font-medium mb-1">Marca</label>
  <input name="brand" value={values.brand || ""} onChange={handleChange} className="w-full border-2 border-primary focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-lg p-2 rounded bg-gray-300 text-gray-900 transition" />
      </div>
      <div>
        <label className="block font-medium mb-1">Categoría</label>
        <select
          name="category_key"
          value={values.category_key || ""}
          onChange={handleChange}
          required
          className="w-full border-2 border-primary focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-lg p-2 rounded bg-gray-300 text-gray-900 transition"
        >
          <option value="" disabled>
            {loadingCategories ? "Cargando..." : "Selecciona una categoría"}
          </option>
          {categories.map((cat: any) => (
            <option key={cat.key} value={cat.key}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Precio</label>
  <input name="price" type="number" value={values.price} onChange={handleChange} required className="w-full border-2 border-primary focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-lg p-2 rounded bg-gray-300 text-gray-900 transition" />
      </div>
      <div>
        <label className="block font-medium mb-1">Imagen 1</label>
        <input name="image1" value={values.image1 || ""} onChange={handleChange} className="w-full border-2 border-primary focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-lg p-2 rounded bg-gray-300 text-gray-900 transition" />
      </div>
      <div>
        <label className="block font-medium mb-1">Imagen 2</label>
        <input name="image2" value={values.image2 || ""} onChange={handleChange} className="w-full border-2 border-primary focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-lg p-2 rounded bg-gray-300 text-gray-900 transition" />
      </div>
      <div>
        <label className="block font-medium mb-1">Imagen 3</label>
        <input name="image3" value={values.image3 || ""} onChange={handleChange} className="w-full border-2 border-primary focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-lg p-2 rounded bg-gray-300 text-gray-900 transition" />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
      </div>
    </form>
  );
}
