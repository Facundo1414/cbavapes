'use client'

import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { IoArrowBack } from 'react-icons/io5'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ProductCarousel } from '@/components/ui/ProductCarousel'

type Option = {
  id: number
  name: string
  price: number
}

const productOptions: Option[] = [
  { id: 1, name: 'Frutilla', price: 100 },
  { id: 2, name: 'Menta', price: 150 },
  { id: 3, name: 'Sandía', price: 200 },
  { id: 4, name: 'Frutilla', price: 100 },
  { id: 5, name: 'Menta', price: 150 },
  { id: 6, name: 'Sandía', price: 200 },
  { id: 7, name: 'Frutilla', price: 100 },
  { id: 8, name: 'Menta', price: 150 },
  { id: 9, name: 'Sandía', price: 200 },
]

const productImages = [
  '/images/product1.jpg',
  '/images/product2.jpg',
  '/images/product3.jpg',
]

export default function ProductPage() {
  const { addToCart } = useCart()
  const router = useRouter()

  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const handleQuantityChange = (id: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id.toString()]: Math.max(0, (prev[id.toString()] || 0) + delta),
    }))
  }

  const handleAddToCart = () => {
    productOptions.forEach(opt => {
      const quantity = quantities[opt.id.toString()] || 0
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: opt.id,
          name: opt.name,
          price: opt.price,
        })
      }
    })
    // No redirigimos para que el cliente siga navegando
  }

  const totalPrice = productOptions.reduce((acc, opt) => {
    const qty = quantities[opt.id.toString()] || 0
    return acc + qty * opt.price
  }, 0)

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <IoArrowBack size={24} />
        </Button>
        <h1 className="text-lg font-semibold">Detalles del Producto</h1>
      </header>

      {/* Carrusel de imágenes */}
      <div className="min-h-[400px] py-4 relative z-10">
        <ProductCarousel images={productImages} />
      </div>

      {/* Lista de sabores */}
      <main className="px-4 max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Seleccioná sabores</h2>

        <div className="max-h-[320px] overflow-y-auto pb-[60px]">
          <Card className="divide-y">
            {productOptions.map(opt => (
              <div
                key={opt.id}
                className="flex items-center justify-between px-4 h-[58px]"
              >
                <div className="flex flex-col justify-center h-full">
                  <p className="font-medium text-base m-0">{opt.name}</p>
                  <p className="text-xs text-gray-500 m-0">{`$${opt.price}`}</p>
                </div>

                <div className="flex items-center gap-2 h-full">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(opt.id, -1)}
                  >
                    -
                  </Button>
                  <span className="min-w-[24px] text-center text-base font-medium flex items-center justify-center h-full">
                    {quantities[opt.id.toString()] || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(opt.id, 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        </div>


      </main>

      {/* Botón fijo al fondo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md px-4 py-3">
        <Button
          className="w-full py-6 text-lg"
          disabled={totalPrice === 0}
          onClick={handleAddToCart}
        >
          Agregar al carrito (${totalPrice})
        </Button>
      </div>
    </div>
  )
}
