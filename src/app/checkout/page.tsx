'use client'

import { useCart } from '@/context/CartContext'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack } from 'react-icons/io5'
import { Button } from '@/components/ui/button'
import { toast, Toaster } from 'sonner'  // <-- Importa Toaster

const CUPONES_USADOS_KEY = 'cuponesUsados'
const SHEET_URL = process.env.SHEET_CUPONES_URL || ""

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const router = useRouter()

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [comentario, setComentario] = useState('')
  const [formaEntrega, setFormaEntrega] = useState('')
  const [retiroLugar, setRetiroLugar] = useState('')
  const [Barrio, setBarrio] = useState('')
  const [formaPago, setFormaPago] = useState('')
  const [cupon, setCupon] = useState('')
  const [cuponValido, setCuponValido] = useState(false)
  const [cuponesDisponibles, setCuponesDisponibles] = useState<Record<string, number>>({})
  const [error, setError] = useState('')

  const totalSinDescuento = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  )

  const descuentoAplicado = cuponValido
    ? cuponesDisponibles[cupon.trim().toUpperCase()] || 0
    : 0

  const total = totalSinDescuento * (1 - descuentoAplicado / 100)

useEffect(() => {
  const fetchCupones = async () => {
    try {
      const res = await fetch(SHEET_URL)
      const data = await res.json()

      // 🛡️ Validación defensiva
      if (!Array.isArray(data)) {
        console.warn('La respuesta del sheet no es un array:', data)
        toast.warning('No se encontraron cupones disponibles.')
        return
      }

      const parsed: Record<string, number> = {}
      data.forEach(({ codigo, descuento }) => {
        parsed[codigo.trim().toUpperCase()] = parseFloat(descuento)
      })

      setCuponesDisponibles(parsed)
    } catch (err) {
      console.error('Error cargando cupones:', err)
      toast.error('Hubo un problema al cargar los cupones.')
    }
  }

  fetchCupones()
}, [])


  const validarCupon = () => {
    if (!process.env.NEXT_PUBLIC_SHEET_CUPONES_URL) {
      console.warn('Falta configurar la URL de cupones en .env');
    }

    const cuponUpper = cupon.trim().toUpperCase()
    const descuento = cuponesDisponibles[cuponUpper]

    if (!descuento) {
      toast.error('Cupón inválido')
      return
    }

    const usadosRaw = localStorage.getItem(CUPONES_USADOS_KEY)
    const usados = usadosRaw ? JSON.parse(usadosRaw) : {}

    if (usados[telefono]) {
      toast.error('Ya usaste este cupón')
      return
    }

    usados[telefono] = true
    localStorage.setItem(CUPONES_USADOS_KEY, JSON.stringify(usados))
    setCuponValido(true)
    setError('')
    toast.success(`¡Cupón aplicado con éxito! ${descuento}% OFF`)
  }

  const mensaje = useMemo(() => {
    if (cart.length === 0) return ''

    const lista = cart
      .map(item => `• ${item.name} x${item.quantity} - $${item.price * item.quantity}`)
      .join('%0A')

    const datosCliente = `%0A%0A📦 Pedido de: ${nombre}%0A📞 Teléfono: ${telefono}%0A🧾 Forma de pago: ${formaPago}${
      comentario ? `%0A📝 Aclaraciones: ${comentario}` : ''
    }${
      formaEntrega === 'retiro'
        ? `%0A📍 Retira en: ${retiroLugar}`
        : `%0A📍 Envío a: ${direccion}, ${Barrio}`
    }`

    const cuponTexto = cuponValido
      ? `%0A🏷️ Cupón aplicado: ${cupon.toUpperCase()} (-${descuentoAplicado}%)`
      : ''

    return `Hola, quiero hacer un pedido:%0A${lista}%0A%0ATotal: $${total.toFixed(
      2
    )}${cuponTexto}${datosCliente}`
  }, [cart, total, nombre, telefono, direccion, Barrio, formaEntrega, retiroLugar, formaPago, comentario, cuponValido, cupon, descuentoAplicado])

  const telefonoWsp = process.env.NEXT_PUBLIC_WSP_NUMBER || '549XXXXXXXXXX'
  const whatsappURL = `https://wa.me/${telefonoWsp}?text=${mensaje}`

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/')
    }
  }, [cart, router])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!nombre.trim() || !telefono.trim() || !formaPago || !formaEntrega) {
      e.preventDefault()
      setError('Por favor completá todos los datos obligatorios.')
      return
    }

    if (
      (formaEntrega === 'retiro' && !retiroLugar) ||
      (formaEntrega === 'envio' && (!direccion || !Barrio))
    ) {
      e.preventDefault()
      setError('Por favor completá la información de entrega.')
      return
    }

    e.preventDefault() // evitar abrir el link antes de confirmar
    confirmarEnvio()
  }

  const confirmarEnvio = () => {
    toast('¿Querés enviar tu pedido por WhatsApp ahora?', {
      action: {
        label: 'Sí, enviar',
        onClick: () => {
          clearCart()
          localStorage.setItem('pedidoEnviado', '1')
          window.open(whatsappURL, '_blank')
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {
          toast.info('Envío cancelado')
        },
      },
    })
  }



  return (
    <>
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <IoArrowBack size={24} />
          </Button>
          <h1 className="text-lg font-semibold">Confirmá tu pedido</h1>
        </header>

        <main className="max-w-lg mx-auto p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-2 text-center">Resumen del carrito</h2>
            <ul className="divide-y border rounded p-4 max-h-60 overflow-y-auto">
              {cart.map(item => (
                <li key={item.id} className="py-2 flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${item.price * item.quantity}</span>
                </li>
              ))}
              {cuponValido && (
                <li className="text-green-700 text-sm pt-2">
                  Cupón aplicado: {cupon.toUpperCase()} (-{descuentoAplicado}%)
                </li>
              )}
              <li className="pt-4 font-bold flex justify-between">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </li>
            </ul>
          </div>

          {/* Datos del cliente */}
          <div className="space-y-3">

            <p className="font-semibold mb-2">Nombre y Apellido</p>
            <input
              type="text"
              className="w-full border p-2 rounded"
              placeholder="Tu nombre completo"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
            <p className="font-semibold mb-2">Telefono</p>
            <input
              type="tel"
              className="w-full border p-2 rounded"
              placeholder="351..."
              value={telefono}
              onChange={(e) => {
                const soloNumeros = e.target.value.replace(/\D/g, '')
                setTelefono(soloNumeros)
              }}
            />
          </div>

          {/* Forma de entrega */}
          <div>
            <p className="font-semibold mb-2">Forma de entrega</p>
            <div className="flex gap-4 mb-2">
              <Button
                variant={formaEntrega === 'retiro' ? 'default' : 'outline'}
                onClick={() => setFormaEntrega('retiro')}
              >
                🏬 Retiro
              </Button>
              <Button
                variant={formaEntrega === 'envio' ? 'default' : 'outline'}
                onClick={() => setFormaEntrega('envio')}
              >
                🚚 Envío
              </Button>
            </div>

            {formaEntrega === 'retiro' && (
              <div className="space-y-2">
                <label className="block">
                  <input
                    type="radio"
                    name="retiro"
                    value="Manir fatala 1593"
                    checked={retiroLugar === 'Manir fatala 1593'}
                    onChange={e => setRetiroLugar(e.target.value)}
                  />
                  <span className="ml-2">Manir fatala 1593 - Barrio Smata</span>
                </label>
                <label className="block">
                  <input
                    type="radio"
                    name="retiro"
                    value="Llao Llao 4476"
                    checked={retiroLugar === 'Llao Llao 4476'}
                    onChange={e => setRetiroLugar(e.target.value)}
                  />
                  <span className="ml-2">Llao Llao 4476 - Barrio Parque Latino</span>
                </label>
              </div>
            )}

          {formaEntrega === 'envio' && (
              <div className="space-y-2">
                  <p className="text-sm text-gray-600 mt-2">
                  * El envío tiene un costo adicional que se coordina por WhatsApp.
                </p>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  placeholder="Dirección"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                />
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  placeholder="Barrio (ej: Nueva Cordoba)"
                  value={Barrio}
                  onChange={e => setBarrio(e.target.value)}
                />
                
              </div>
            )}
          </div>

          {/* Forma de pago */}
          <div>
            <p className="font-semibold mb-2">Forma de pago</p>
            <div className="flex gap-4">
              <Button
                variant={formaPago === 'Efectivo' ? 'default' : 'outline'}
                onClick={() => setFormaPago('Efectivo')}
              >
                Efectivo
              </Button>
              <Button
                variant={formaPago === 'Transferencia' ? 'default' : 'outline'}
                onClick={() => setFormaPago('Transferencia')}
              >
                Transferencia
              </Button>
            </div>
          </div>

          <div>
            <p className="font-semibold mb-2">Cupón de descuento</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Código de cupón"
                className="flex-1 border p-2 rounded"
                value={cupon}
                onChange={e => setCupon(e.target.value)}
              />
              <Button onClick={validarCupon}>Validar</Button>
            </div>
            {cuponValido && (
              <p className="text-green-600 text-sm mt-1">
                Cupón aplicado: {cupon.toUpperCase()} ({descuentoAplicado}% OFF)
              </p>
            )}
          </div>

          {/* Comentario opcional */}
          <textarea
            placeholder="Aclaraciones (opcional)"
            className="w-full border rounded p-2"
            rows={3}
            value={comentario}
            onChange={e => setComentario(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <a
            href={whatsappURL}
            target="_blank"
            rel="noopener noreferrer"
            className={`bg-green-500 text-white px-6 py-3 w-full text-center block rounded-lg font-semibold transition ${
              nombre && telefono && formaPago && formaEntrega
                ? 'hover:bg-green-600'
                : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={handleClick}
          >
            Enviar pedido por WhatsApp
          </a>
        </main>
      </div>

      {/* Agregamos el Toaster aquí para que funcione sonner */}
      <Toaster />
    </>
  )
}
