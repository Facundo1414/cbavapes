'use client'

  import { useCart } from '@/context/CartContext'
  import { generarMensajeWhatsapp, getOrCreateClient, crearPedidoYItems } from '@/app/utils/orderUtils'
  import { useEffect, useMemo, useState } from 'react'
  import { useRouter } from 'next/navigation'
  import { Button } from '@/components/ui/button'
  import { toast, Toaster } from 'sonner'
  import { Separator } from '@/components/ui/separator';
  import PageHeader from '@/components/PageHeader';
  import ModalConfirmationCheckoutPage from '@/components/ModalConfirmationCheckoutPage';
  import { useSupabaseUser } from '@/components/hook/useSupabaseUser';

  export default function CheckoutPage() {
  // Confirmación antes de enviar por WhatsApp
  const [confirmando, setConfirmando] = useState(false);
  const whatsappNumber = '5493513479404';
  // Forma de entrega y pago
  const [formaEntrega, setFormaEntrega] = useState<'retiro' | 'envio'>('retiro');
  const [retiroLugar, setRetiroLugar] = useState('Manir fatala 1593 - Barrio Smata');
  const [direccion, setDireccion] = useState('');
  const [barrio, setBarrio] = useState('');
  const [formaPago, setFormaPago] = useState<'Efectivo' | 'Transferencia'>('Efectivo');
  const [cupon, setCupon] = useState('');
  const [cuponValido, setCuponValido] = useState(false);
  const [descuentoAplicado, setDescuentoAplicado] = useState(0);
  const [aclaraciones, setAclaraciones] = useState('');
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [isLoadingPedido, setIsLoadingPedido] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const user = useSupabaseUser();
  const { userMetadata } = user || {};

  useEffect(() => {
    if (cart.length === 0) router.push('/');
  }, [cart, router]);

  // Ajustar para usar userMetadata del hook actualizado
  useEffect(() => {
    if (userMetadata) {
      // Priorizar datos del usuario autenticado
      setNombre(userMetadata.full_name || '');
      setTelefono(userMetadata.phone || '');
    } else {
      // Usar datos de localStorage como respaldo
      const savedNombre = localStorage.getItem('checkout_nombre');
      const savedTelefono = localStorage.getItem('checkout_telefono');
      if (savedNombre) setNombre(savedNombre);
      if (savedTelefono) setTelefono(savedTelefono);
    }
  }, [userMetadata]);

  // Autocompletar dirección y barrio desde localStorage
  useEffect(() => {
    const savedDireccion = localStorage.getItem('checkout_direccion');
    const savedBarrio = localStorage.getItem('checkout_barrio');
    if (savedDireccion) setDireccion(savedDireccion);
    if (savedBarrio) setBarrio(savedBarrio);
  }, []);



  
  async function enviarPorWhatsapp() {
    // Validaciones antes de confirmar
    if (!nombre.trim() || !telefono.trim() || cart.length === 0 || (formaEntrega === 'envio' && (!direccion.trim() || !barrio.trim()))) {
      toast.error('Completa todos los datos obligatorios antes de confirmar.');
      return;
    }
    setIsModalOpen(true);
  }

  const handleConfirm = async () => {
    setIsModalOpen(false);
    toast.loading('Generando pedido...');
    setIsLoadingPedido(true);
    try {
      await crearPedidoYItems({
        nombre,
        telefono,
        cart,
        total,
        cupon,
        descuentoAplicado,
        aclaraciones,
        clearCart,
        router,
      });
      const mensaje = generarMensajeWhatsapp({
        cart,
        formaEntrega,
        retiroLugar,
        direccion,
        barrio,
        total,
        nombre,
        telefono,
        formaPago,
      });
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingPedido(false);
      router.push('/');
    }
  };
  
    return (
      <>
  <div className="min-h-screen max-w-5xl mx-auto pt-5 px-4 sm:px-6 lg:px-8 bg-white-100">
          <PageHeader title="Checkout" />
          <main className="w-full max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-10 bg-white rounded-xl shadow-lg mt-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-neutral-900 text-center">Resumen del carrito</h2>
            <ul className="divide-y border rounded p-4 max-h-60 overflow-y-auto bg-white">
              {cart.map(item => (
                <li key={`${item.id}-${item.flavor_id || 'default'}`} className="py-2 flex items-center justify-between gap-2">
                  <img src={item.image || '/images/placeholder.png'} alt={item.name} className="w-10 h-10 object-cover rounded mr-2 border" />
                  <span className="font-medium text-gray-800 flex-1">{item.name} x{item.quantity}</span>
                  <span className="text-gray-700">${(item.price * item.quantity).toLocaleString('es-ES', { minimumFractionDigits: 0 })}</span>
                </li>
              ))}
              <Separator className="my-2" />
              <li className="pt-4 font-bold flex justify-between text-lg">
                <span>Total:</span>
                <span>${total.toLocaleString('es-ES', { minimumFractionDigits: 0 })}</span>
              </li>
              {cuponValido && descuentoAplicado > 0 && (
                <li className="pt-2 flex justify-between text-green-700 text-lg font-semibold">
                  <span>Total con descuento:</span>
                  <span>${(total * (1 - descuentoAplicado / 100)).toLocaleString('es-ES', { minimumFractionDigits: 0 })}</span>
                </li>
              )}
            </ul>
            <Separator className="my-8" />

                  {/* Datos del cliente */}
                  <h2 className="text-xl font-bold mb-2 text-neutral-900">Datos del cliente</h2>
                  <div className="space-y-4 mb-8">
                    <div>
                      <label htmlFor="nombre" className="block font-medium mb-1">Nombre y Apellido</label>
                      <input
                        id="nombre"
                        type="text"
                            className="w-full border  p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
                        placeholder="Tu nombre completo"
                        value={nombre}
                        onChange={e => {
                          setNombre(e.target.value);
                          localStorage.setItem('checkout_nombre', e.target.value);
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor="telefono" className="block font-medium mb-1">Teléfono</label>
                      <input
                        id="telefono"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full border p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
                        placeholder="351..."
                        value={telefono}
                        aria-label="Teléfono solo números"
                        onChange={e => {
                          // Solo números
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setTelefono(val);
                          localStorage.setItem('checkout_telefono', val);
                        }}
                      />
                    </div>
                  </div>
                  <Separator className="my-8" />
                  {/* Forma de entrega */}
                  <div>
                    <p className="font-semibold mb-2">Forma de entrega</p>
                    <div className="flex gap-4 mb-4">
                      <Button
                        type="button"
                        variant={formaEntrega === 'retiro' ? 'default' : 'outline'}
                        onClick={() => setFormaEntrega('retiro')}
                      >
                        <span role="img" aria-label="Casa">🏠</span> Retiro
                      </Button>
                      <Button
                        type="button"
                        variant={formaEntrega === 'envio' ? 'default' : 'outline'}
                        onClick={() => setFormaEntrega('envio')}
                      >
                        <span role="img" aria-label="Moto">🏍️</span> Envío
                      </Button>
                    </div>
                    {formaEntrega === 'retiro' && (
                      <div className="space-y-2">
                        <label className="block cursor-pointer">
                          <input
                            type="radio"
                            name="retiro"
                            value="Manir fatala 1593 - Barrio Smata"
                            checked={retiroLugar === 'Manir fatala 1593 - Barrio Smata'}
                            onChange={e => setRetiroLugar(e.target.value)}
                          />
                          <span className="ml-2">Manir fatala 1593 - Barrio Smata</span>
                        </label>
                        <label className="block cursor-pointer">
                          <input
                            type="radio"
                            name="retiro"
                            value="Llao Llao 4476 - Barrio Parque Latino"
                            checked={retiroLugar === 'Llao Llao 4476 - Barrio Parque Latino'}
                            onChange={e => setRetiroLugar(e.target.value)}
                          />
                          <span className="ml-2">Llao Llao 4476 - Barrio Parque Latino</span>
                        </label>
                      </div>
                    )}
                    {formaEntrega === 'envio' && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 mt-2">
                          El envío se hace por Uber y tiene un costo adicional que se coordina por WhatsApp.
                        </p>
                        <input
                          type="text"
                            className="w-full border  p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
                          placeholder="Dirección"
                          value={direccion}
                          onChange={e => {
                            setDireccion(e.target.value);
                            localStorage.setItem('checkout_direccion', e.target.value);
                          }}
                        />
                        <input
                          type="text"
                            className="w-full border  p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
                          placeholder="Barrio (ej: Nueva Cordoba)"
                          value={barrio}
                          onChange={e => {
                            setBarrio(e.target.value);
                            localStorage.setItem('checkout_barrio', e.target.value);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <Separator className="my-8" />
                  {/* Forma de pago */}
                  <div>
                    <p className="font-semibold mb-2">Forma de pago</p>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={formaPago === 'Efectivo' ? 'default' : 'outline'}
                        onClick={() => {
                          if (formaEntrega === 'retiro') {
                            setFormaPago('Efectivo');
                          } else {
                            toast.error('El pago en efectivo solo está disponible si retirás el pedido.');
                          }
                        }}
                        disabled={formaEntrega !== 'retiro'}
                      >
                        Efectivo
                      </Button>
                      <Button
                        type="button"
                        variant={formaPago === 'Transferencia' ? 'default' : 'outline'}
                        onClick={() => setFormaPago('Transferencia')}
                      >
                        Transferencia
                      </Button>
                    </div>
                    {formaEntrega === 'envio' && formaPago === 'Efectivo' && (
                      <p className="text-sm text-gray-600 mt-2">
                        ⚠️ El pago en efectivo solo está disponible para pedidos con retiro.
                      </p>
                    )}
                  </div>
                  <Separator className="my-8" />
                  {/* Cupón de descuento */}
                  <div>
                    <p className="font-semibold mb-2">Cupón de descuento</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Código de cupón"
                        className="flex-1 border p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
                        value={cupon}
                        onChange={e => setCupon(e.target.value)}
                      />
                      <Button type="button" onClick={() => {
                        // Simulación de validación de cupón
                        if (cupon.toLowerCase() === 'descuento10') {
                          setCuponValido(true);
                          setDescuentoAplicado(10);
                          toast.success('Cupón aplicado: 10% OFF');
                        } else {
                          setCuponValido(false);
                          setDescuentoAplicado(0);
                          toast.error('Cupón inválido');
                        }
                      }}>Validar</Button>
                    </div>
                    {cuponValido && (
                      <p className="text-green-600 text-sm mt-1">
                        Cupón aplicado: {cupon.toUpperCase()} ({descuentoAplicado}% OFF)
                      </p>
                    )}
                  </div>
                  <Separator className="my-8" />
                  {/* Aclaraciones/Notas */}
                  <div>
                    <label htmlFor="aclaraciones" className="block font-medium mb-1">Aclaraciones (opcional)</label>
                    <input
                      id="aclaraciones"
                      type="text"
                        className="w-full border  p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
                      placeholder="Aclaraciones o notas para el pedido"
                      value={aclaraciones}
                      onChange={e => setAclaraciones(e.target.value)}
                    />
                  </div>
                  <Separator className="my-8" />
                  {/* Botón para enviar pedido por WhatsApp */}
                  <Button
                    type="button"
                    onClick={enviarPorWhatsapp}
                    disabled={isLoadingPedido || confirmando || !nombre || !telefono || cart.length === 0}
                    className="w-full py-3 text-lg"
                  >
                    {isLoadingPedido ? 'Generando pedido...' : 'Enviar pedido por WhatsApp'}
                  </Button>
                  {/* Eliminado renderizado de error duplicado, solo toast muestra el error */}
          </main>
        </div>
          <Toaster position="bottom-right" />
          <ModalConfirmationCheckoutPage
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
      />
      </>
    );
  }

