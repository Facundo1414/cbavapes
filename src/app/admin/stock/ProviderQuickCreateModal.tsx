import React, { useState } from "react";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProviderQuickCreateModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: insertError } = await supabaseBrowser.from("providers").insert([{ name }]);
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setName("");
    if (onCreated) onCreated();
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl" onClick={onClose} aria-label="Cerrar">×</button>
        <h2 className="font-bold mb-4 text-lg">Agregar proveedor</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input type="text" name="name" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del proveedor" required />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Guardando..." : "Guardar proveedor"}</Button>
        </form>
      </div>
    </div>
  );
}
