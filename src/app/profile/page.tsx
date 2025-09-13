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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]); // Correct type for order items
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
  const orderIds = orders.map((o: Compra) => o.id);
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
  const comprasToShow = compras.slice(
    (comprasPage - 1) * comprasPerPage,
    comprasPage * comprasPerPage
  );
  
  const MIN_COMMENT_LENGTH = 10; // Minimum characters for a comment

  // Filtros para valoraciones
const [filterFlavor, setFilterFlavor] = useState('');
const [filterDate, setFilterDate] = useState('');
const [filterRating, setFilterRating] = useState('');

const filteredReviews = valoracionesReal.filter((review) => {
  const matchesFlavor = filterFlavor ? review.flavor?.name.includes(filterFlavor) : true;
  const matchesDate = filterDate ? new Date(review.created_at).toLocaleDateString() === filterDate : true;
  const matchesRating = filterRating ? review.rating === parseInt(filterRating) : true;
  return matchesFlavor && matchesDate && matchesRating;
});

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
        const mapped = (data as (Valoracion & { flavor: { id: string; name: string }[] })[]).map((v) => ({
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

  const averageRating = valoracionesReal.length > 0
  ? valoracionesReal.reduce((sum, v) => sum + v.rating, 0) / valoracionesReal.length
  : null;

  const [purchaseDetailModalOpen, setPurchaseDetailModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Compra | null>(null);

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
        role="tablist"
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
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 px-2">Fecha</th>
                      <th className="py-2 px-2">Producto</th>
                      <th className="py-2 px-2">Cantidad</th>
                      <th className="py-2 px-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprasToShow.map((compra) => {
                      const items = orderItems.filter((item) => item.order_id === compra.id);
                      return (
                        <tr key={compra.id} className="border-b last:border-0">
                          <td className="py-2 px-2">{new Date(compra.created_at).toLocaleDateString()}</td>
                          <td className="py-2 px-2">
                            {items.map((item) => (
                              <div key={item.id}>{item.product_name} ({item.flavor})</div>
                            ))}
                          </td>
                          <td className="py-2 px-2">{items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                          <td className="py-2 px-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedPurchase(compra);
                                setPurchaseDetailModalOpen(true);
                              }}
                              aria-label={`Ver detalles de la compra ${compra.id}`}
                            >
                              Ver Detalle
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <PaginationSimple
  page={comprasPage}
  pageCount={comprasPageCount}
  setPage={setComprasPage}
/>
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
                  {ratingComment.length > 0 && ratingComment.length < MIN_COMMENT_LENGTH && (
                    <p className="text-red-500 text-sm">El comentario debe tener al menos {MIN_COMMENT_LENGTH} caracteres.</p>
                  )}
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
            <div className="mb-4 flex gap-4">
      <input
        type="text"
        placeholder="Filtrar por sabor"
        value={filterFlavor}
        onChange={(e) => setFilterFlavor(e.target.value)}
        className="border p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
      />
      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
        className="border p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
      />
      <select
        value={filterRating}
        onChange={(e) => setFilterRating(e.target.value)}
        className="border p-2 rounded bg-gray-100 text-gray-900 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
      >
        <option value="">Filtrar por calificación</option>
        {[1, 2, 3, 4, 5].map((rating) => (
          <option key={rating} value={rating}>{rating} estrellas</option>
        ))}
      </select>
    </div>
            {valoracionesLoading ? (
              <div className="text-center text-gray-500 py-8">Cargando valoraciones...</div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No hay valoraciones que coincidan con los filtros.</div>
            ) : (
              <>
                <div className="space-y-3">
                  {filteredReviews.map((v) => (
                    <div key={v.id} className="border rounded-lg p-3 bg-white">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">{v.flavor?.name || 'Sabor desconocido'}</span>
                        <span className="text-yellow-500">{'★'.repeat(v.rating)}{'☆'.repeat(5 - v.rating)}</span>
                        <span className="text-xs text-gray-400 ml-2">{new Date(v.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-sm text-gray-700">{v.comment}</span>
                    </div>
                  ))}
                </div>
                <PaginationSimple page={valoracionesPage} pageCount={valoracionesPageCount} setPage={setValoracionesPage} />
              </>
            )}
          </section>
        )}
        {/* Modal detalle de compra */}
        <Dialog open={purchaseDetailModalOpen} onOpenChange={setPurchaseDetailModalOpen}>
          <DialogContent role="dialog" aria-labelledby="purchase-detail-title">
            <DialogHeader>
              <DialogTitle id="purchase-detail-title">Detalle de la Compra</DialogTitle>
            </DialogHeader>
            {selectedPurchase && (
              <div>
                <p><strong>ID:</strong> {selectedPurchase.id}</p>
                <p><strong>Total:</strong> ${selectedPurchase.total.toFixed(2)}</p>
                <p><strong>Fecha:</strong> {new Date(selectedPurchase.created_at).toLocaleDateString()}</p>
                <p><strong>Estado:</strong> {selectedPurchase.status}</p>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setPurchaseDetailModalOpen(false)} variant="secondary" autoFocus>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
