import { useState } from "react";
import { Button } from "@/components/ui/button";

export type CategoryFormValues = {
  key: string;
  name: string;
  image: string;
  description: string;
};

export function CategoryForm({ initial, onSave, onCancel }: {
  initial?: CategoryFormValues;
  onSave: (values: CategoryFormValues) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<CategoryFormValues>(
    initial || { key: "", name: "", image: "", description: "" }
  );
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSave(values);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Clave (key)</label>
        <input name="key" value={values.key} onChange={handleChange} required className="w-full border p-2 rounded" />
      </div>
      <div>
        <label className="block font-medium mb-1">Nombre</label>
        <input name="name" value={values.name} onChange={handleChange} required className="w-full border p-2 rounded" />
      </div>
      <div>
        <label className="block font-medium mb-1">Imagen (URL)</label>
        <input name="image" value={values.image} onChange={handleChange} required className="w-full border p-2 rounded" />
      </div>
      <div>
        <label className="block font-medium mb-1">Descripción</label>
        <textarea name="description" value={values.description} onChange={handleChange} required className="w-full border p-2 rounded" />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
      </div>
    </form>
  );
}
