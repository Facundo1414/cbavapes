'use client'
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Client {
  id: number;
  name: string;
  phone: string;
  notes: string | null;
}

export default function ClientsTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Client>>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
  const { data, error } = await supabaseBrowser.from("clients").select("*").order('id', { ascending: false });
    if (!error && data) setClients(data);
    setLoading(false);
  }

  function handleEdit(client: Client) {
    setEditing(client.id);
    setForm(client);
    setOpen(true);
  }

  function handleAdd() {
    setEditing(null);
    setForm({});
    setOpen(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar cliente?")) return;
  const { error } = await supabaseBrowser.from("clients").delete().eq("id", id);
    if (error && error.code === "23503") {
      toast("No se puede eliminar el cliente porque tiene pedidos vinculados.", { description: "Elimina primero los pedidos asociados." });
    } else if (error) {
      toast("Error al eliminar cliente", { description: error.message });
    } else {
      fetchClients();
    }
  }

  async function handleSave() {
    if (editing) {
  await supabaseBrowser.from("clients").update(form).eq("id", editing);
    } else {
  await supabaseBrowser.from("clients").insert([form]);
    }
    setOpen(false);
    fetchClients();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-left">Gestión de Clientes</h1>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd}>Nuevo cliente</Button>
      </div>
      <table className="min-w-full border bg-white rounded shadow text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Nombre</th>
            <th className="border px-2 py-1">Teléfono</th>
            <th className="border px-2 py-1">Notas</th>
            <th className="border px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="text-center">Cargando...</td></tr>
          ) : clients.length === 0 ? (
            <tr><td colSpan={7} className="text-center">Sin clientes</td></tr>
          ) : clients.map(c => (
            <tr key={c.id}>
              <td className="border px-2 py-1">{c.id}</td>
              <td className="border px-2 py-1">{c.name}</td>
              <td className="border px-2 py-1">{c.phone}</td>
              <td className="border px-2 py-1">{c.notes}</td>
              <td className="border px-2 py-1">
                <Button size="sm" variant="outline" onClick={() => handleEdit(c)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)} className="ml-2">Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>{editing ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          <div className="grid gap-2 py-2">
            <Input placeholder="Nombre" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Teléfono" value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Input placeholder="Notas" value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? "Guardar" : "Crear"}</Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    );
  }

