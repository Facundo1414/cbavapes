"use client";
import { useEffect, useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useSessionContext } from '@supabase/auth-helpers-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PaginationSimple from '@/components/ui/PaginationSimple';

type Compra = {
  id: string;
  total: number;
  created_at: string;
  status: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_name: string;
  flavor: string;
  flavor_id: string;
  quantity: number;
};

type Profile = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  neighborhood?: string;
};

type Valoracion = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  flavor?: { id: string; name: string };
};

type SelectedSabor = {
  compra: Compra;
  sabor: string;
  flavor_id: string;
  product_name: string;
};

export default function ProfilePage() {
  const { session, supabaseClient } = useSessionContext();
  // Estado para modal de valoración
  const [openRatingModal, setOpenRatingModal] = useState(false);
  const [selectedSabor, setSelectedSabor] = useState<SelectedSabor | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  // Compras y productos reales
  const [compras, setCompras] = useState<Compra[]>([]); // [{id, total, created_at, status, ...}]
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]); // [{order_id, product_name, flavor, flavor_id, quantity, ...}]
  const [comprasLoading, setComprasLoading] = useState(false);

  // Traer compras y productos del usuario
  useEffect(() => {
    async function fetchComprasYProductos() {
      if (!session?.user) return;
      setComprasLoading(true);
      // 1. Traer las órdenes del usuario
      const { data: orders, error: ordersError } = await supabaseClient
        .from('orders')
        .select('id, total, created_at, status')
        .eq('client_id', session.user.id)
        .order('created_at', { ascending: false });
      if (ordersError || !orders) {
        setCompras([]);
        setOrderItems([]);
        setComprasLoading(false);
        return;
      }
      setCompras(orders);
      // 2. Traer los order_items de esas órdenes
      const orderIds = orders.map((o: any) => o.id);
      if (orderIds.length === 0) {
        setOrderItems([]);
        setComprasLoading(false);
        return;
      }
      const { data: items, error: itemsError } = await supabaseClient
        .from('order_items')
        .select('id, order_id, product_name, flavor, flavor_id, quantity')
        .in('order_id', orderIds);
      if (itemsError || !items) {
        setOrderItems([]);
      } else {
        setOrderItems(items);
      }
      setComprasLoading(false);
    }
    fetchComprasYProductos();
  }, [session, supabaseClient]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('datos');
  const [valoracionesReal, setValoracionesReal] = useState<Valoracion[]>([]);
  // Para edición de valoraciones
  const [editRatingId, setEditRatingId] = useState<string|null>(null);
  const [editRatingValue, setEditRatingValue] = useState(0);
  const [editRatingComment, setEditRatingComment] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [valoracionesLoading, setValoracionesLoading] = useState(false);
  const [valoracionesPage, setValoracionesPage] = useState(1);
  const valoracionesPerPage = 5;
  const router = useRouter();
  const valoracionesPageCount = Math.ceil(valoracionesReal.length / valoracionesPerPage);
  const valoracionesToShow = valoracionesReal.slice((valoracionesPage - 1) * valoracionesPerPage, valoracionesPage * valoracionesPerPage);
  const [comprasPage, setComprasPage] = useState(1);
  const comprasPerPage = 5;
  const comprasPageCount = Math.ceil(compras.length / comprasPerPage);
  const comprasToShow = compras.slice((comprasPage - 1) * comprasPerPage, comprasPage * comprasPerPage);
  


  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.push('/');
  };

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabaseClient
        .from('user_profile')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (error) {
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [session, supabaseClient]);


  useEffect(() => {
    async function fetchValoraciones() {
      if (!session?.user) return;
      setValoracionesLoading(true);
      const { data, error } = await supabaseClient
        .from('ratings')
        .select('id, rating, comment, created_at, flavor:flavor_id (id, name)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (!error && data) {
        // Map flavor from array to object (Supabase returns as array)
        const mapped = data.map((v: any) => ({
          ...v,
          flavor: Array.isArray(v.flavor) ? v.flavor[0] : v.flavor
        }));
        setValoracionesReal(mapped);
      } else {
        setValoracionesReal([]);
      }
      setValoracionesLoading(false);
    }
    if (tab === 'valoraciones') {
      fetchValoraciones();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, supabaseClient, tab]);

  if (loading) return <div className="p-8">Cargando perfil...</div>;
  if (!profile) return <div className="p-8">No se encontró el perfil.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <Button variant="destructive" onClick={handleLogout} size="sm">
          Cerrar sesión
        </Button>
      </div>
      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          { label: 'Datos personales', value: 'datos' },
          { label: 'Cupones', value: 'cupones' },
          { label: 'Compras', value: 'compras' },
          { label: 'Valoraciones', value: 'valoraciones' },
        ]}
        className="mb-6 flex-wrap"
      />
      <Card className="p-4">
        {tab === 'datos' && (
          <section>
            <div className="space-y-2">
              <div>
                <span className="block text-sm font-medium mb-1">Email</span>
                <span className="block border rounded px-3 py-2 bg-gray-100">{profile.email}</span>
              </div>
              {profile.name && (
                <div>
                  <span className="block text-sm font-medium mb-1">Nombre</span>
                  <span className="block border rounded px-3 py-2 bg-gray-100">{profile.name}</span>
                </div>
              )}
              {profile.phone && (
                <div>
                  <span className="block text-sm font-medium mb-1">Teléfono</span>
                  <span className="block border rounded px-3 py-2 bg-gray-100">{profile.phone}</span>
                </div>
              )}
              {profile.address && (
                <div>
                  <span className="block text-sm font-medium mb-1">Dirección</span>
                  <span className="block border rounded px-3 py-2 bg-gray-100">{profile.address}</span>
                </div>
              )}
              {profile.neighborhood && (
                <div>
                  <span className="block text-sm font-medium mb-1">Barrio</span>
                  <span className="block border rounded px-3 py-2 bg-gray-100">{profile.neighborhood}</span>
                </div>
              )}
            </div>
          </section>
        )}
        {tab === 'cupones' && (
          <section>
            <div className="space-y-3">
              <p className='text-gray-500 '>Proximamente</p>
            </div>
          </section>
        )}
        {tab === 'compras' && (
          <section>
            <div className="overflow-x-auto">
              {comprasLoading ? (
                <div className="text-center text-gray-500 py-8">Cargando compras...</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 px-2">Fecha</th>
                      <th className="py-2 px-2">Producto</th>
                      <th className="py-2 px-2">Sabor</th>
                      <th className="py-2 px-2">Cantidad</th>
                      <th className="py-2 px-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item) => {
                      const compra = compras.find((c) => c.id === item.order_id);
                      if (!compra) return null;
                      // Ver si ya fue valorado
                      const yaValorado = valoracionesReal.some(v => v.flavor?.id === item.flavor_id);
                      return (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2 px-2">{new Date(compra.created_at).toLocaleDateString()}</td>
                          <td className="py-2 px-2">{item.product_name}</td>
                          <td className="py-2 px-2">{item.flavor}</td>
                          <td className="py-2 px-2">{item.quantity}</td>
                          <td className="py-2 px-2">
                            {yaValorado ? (
                              <span className="text-green-600 font-semibold">Valorado</span>
                            ) : (
                              <Button size="sm" onClick={() => {
                                setSelectedSabor({
                                  compra,
                                  sabor: item.flavor,
                                  flavor_id: item.flavor_id,
                                  product_name: item.product_name,
                                });
                                setOpenRatingModal(true);
                                setRatingValue(0);
                                setRatingComment('');
                              }}>
                                Valorar
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            {/* Modal de valoración */}
            <Dialog open={openRatingModal} onOpenChange={setOpenRatingModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Valorar sabor</DialogTitle>
                </DialogHeader>
                {selectedSabor && (
                  <div className="mb-4">
                    <div className="font-semibold">{selectedSabor.sabor}</div>
                    <div className="text-xs text-gray-500">Compra: {selectedSabor.compra.id} - {new Date(selectedSabor.compra.created_at).toLocaleDateString()}</div>
                  </div>
                )}
                <div className="mb-4 flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={star <= ratingValue ? 'text-yellow-500 text-2xl' : 'text-gray-300 text-2xl'}
                      onClick={() => setRatingValue(star)}
                      aria-label={`Dar ${star} estrellas`}
                    >★</button>
                  ))}
                </div>
                <div className="mb-4">
                  <Label htmlFor="comentario">Comentario</Label>
                  <Input
                    id="comentario"
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    placeholder="¿Qué te pareció este sabor?"
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => setOpenRatingModal(false)}
                    variant="secondary"
                  >Cancelar</Button>
                  <Button
                    disabled={ratingValue === 0 || valoracionesLoading || !!(selectedSabor && valoracionesReal.some(v => v.flavor?.id === selectedSabor.flavor_id))}
                    onClick={async () => {
                      if (!selectedSabor || ratingValue === 0 || !session?.user) return;
                      // Evitar duplicados
                      if (valoracionesReal.some(v => v.flavor?.id === selectedSabor.flavor_id)) {
                        toast.error('Ya valoraste este sabor.');
                        return;
                      }
                      setValoracionesLoading(true);
                      const { error } = await supabaseClient
                        .from('ratings')
                        .insert({
                          user_id: session.user.id,
                          flavor_id: selectedSabor.flavor_id,
                          rating: ratingValue,
                          comment: ratingComment,
                          created_at: new Date().toISOString(),
                        });
                      setValoracionesLoading(false);
                      setOpenRatingModal(false);
                      if (error) {
                        toast.error('Error al guardar valoración');
                      } else {
                        toast.success('¡Valoración guardada!');
                      }
                      // Refrescar valoraciones
                      setTimeout(() => {
                        if (tab && tab.toString() === 'valoraciones') {
                          setTab('datos');
                          setTimeout(() => setTab('valoraciones'), 100);
                        }
                      }, 300);
                    }}
                  >{valoracionesLoading ? 'Enviando...' : 'Enviar valoración'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </section>
        )}
        {tab === 'valoraciones' && (
          <section>
            {valoracionesLoading ? (
              <div className="text-center text-gray-500 py-8">Cargando valoraciones...</div>
            ) : valoracionesToShow.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No hay valoraciones aún.</div>
            ) : (
              <>
                <div className="space-y-3">
                  {valoracionesToShow.map((v, i) => (
                    <div key={v.id} className="border rounded-lg p-3 bg-white group relative">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">{v.flavor?.name || 'Sabor desconocido'}</span>
                        <span className="text-yellow-500">{'★'.repeat(v.rating)}{'☆'.repeat(5 - v.rating)}</span>
                        <span className="text-xs text-gray-400 ml-2">{new Date(v.created_at).toLocaleDateString()}</span>
                        <Button size="sm" variant="ghost" className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                          setEditRatingId(v.id);
                          setEditRatingValue(v.rating);
                          setEditRatingComment(v.comment);
                          setEditModalOpen(true);
                        }}>Editar</Button>
                        <Button size="sm" variant="destructive" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={async () => {
                          setValoracionesLoading(true);
                          const { error } = await supabaseClient.from('ratings').delete().eq('id', v.id);
                          setValoracionesLoading(false);
                          if (error) {
                            toast.error('Error al eliminar valoración');
                          } else {
                            toast.success('Valoración eliminada');
                            setTimeout(() => {
                              if (tab && tab.toString() === 'valoraciones') {
                                setTab('datos');
                                setTimeout(() => setTab('valoraciones'), 100);
                              }
                            }, 300);
                          }
                        }}>Eliminar</Button>
                      </div>
                      <span className="text-sm text-gray-700">{v.comment}</span>
                    </div>
                  ))}
                </div>
                <PaginationSimple page={valoracionesPage} pageCount={valoracionesPageCount} setPage={setValoracionesPage} />
                {/* Modal edición */}
                <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar valoración</DialogTitle>
                    </DialogHeader>
                    <div className="mb-4 flex gap-1">
                      {[1,2,3,4,5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={star <= editRatingValue ? 'text-yellow-500 text-2xl' : 'text-gray-300 text-2xl'}
                          onClick={() => setEditRatingValue(star)}
                          aria-label={`Dar ${star} estrellas`}
                        >★</button>
                      ))}
                    </div>
                    <div className="mb-4">
                      <Label htmlFor="edit-comentario">Comentario</Label>
                      <Input
                        id="edit-comentario"
                        value={editRatingComment}
                        onChange={e => setEditRatingComment(e.target.value)}
                        placeholder="Edita tu comentario"
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setEditModalOpen(false)} variant="secondary">Cancelar</Button>
                      <Button
                        disabled={editRatingValue === 0 || valoracionesLoading}
                        onClick={async () => {
                          if (!editRatingId) return;
                          setValoracionesLoading(true);
                          const { error } = await supabaseClient
                            .from('ratings')
                            .update({ rating: editRatingValue, comment: editRatingComment })
                            .eq('id', editRatingId);
                          setValoracionesLoading(false);
                          setEditModalOpen(false);
                          if (error) {
                            toast.error('Error al actualizar valoración');
                          } else {
                            toast.success('Valoración actualizada');
                            setTimeout(() => {
                              if (tab && tab.toString() === 'valoraciones') {
                                setTab('datos');
                                setTimeout(() => setTab('valoraciones'), 100);
                              }
                            }, 300);
                          }
                        }}
                      >{valoracionesLoading ? 'Guardando...' : 'Guardar cambios'}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </section>
        )}
      </Card>
      <Separator className="my-8" />
    </div>
  );
}
