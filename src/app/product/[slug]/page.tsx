'use client'

import { useCart } from '@/context/CartContext'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { IoArrowBack } from 'react-icons/io5'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ProductCarousel } from '@/components/ui/ProductCarousel'
import { useProducts, ProductFull } from '@/app/api/products/useProducts'
import { toast, Toaster } from 'sonner' 

type Option = {
  id: string
  name: string
  price: number
  stock: number
}

export default function ProductPage() {
const { addToCart, cart } = useCart();
  const router = useRouter()
  const params = useParams()
  const productId = params?.slug

  const { products, loading } = useProducts()
  const [product, setProduct] = useState<ProductFull | null>(null)
  const [productOptions, setProductOptions] = useState<Option[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!loading && productId) {
      const found = products.find(p => p.productId === productId)
      setProduct(found ?? null)

      if (found) {
        const flavorsOptions = found.flavors.map(f => ({
          id: f.flavorId,
          name: f.flavor,
          price: found.price,
          stock: f.stock,
        }))
        setProductOptions(flavorsOptions)
      } else {
        setProductOptions([])
      }
    }
  }, [loading, productId, products])

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities(prev => {
      const currentQty = prev[id] ?? 0
      const maxStock = productOptions.find(o => o.id === id)?.stock ?? 0
      const newQty = Math.min(Math.max(0, currentQty + delta), maxStock)
      return {
        ...prev,
        [id]: newQty,
      }
    })
  }

const handleAddToCart = () => {
  let anyAdded = false;
  const mensajes: string[] = [];

  productOptions.forEach(opt => {
    const quantityToAdd = quantities[opt.id] || 0;
    if (quantityToAdd === 0) return;

    const currentInCart = cart.find(
      (item) => item.id === `${product?.productId}-${opt.id}`
    )?.quantity ?? 0;

    const maxAddable = opt.stock - currentInCart;

    if (maxAddable <= 0) return;

    const finalQtyToAdd = Math.min(quantityToAdd, maxAddable);

    if (finalQtyToAdd <= 0) return;

    mensajes.push(
      `Se ${finalQtyToAdd === 1 ? 'agregó' : 'agregaron'} ${finalQtyToAdd} ${finalQtyToAdd === 1 ? 'unidad' : 'unidades'} de ${opt.name}`
    );
    
    addToCart({
      id: `${product?.productId}-${opt.id}`,
      name: `${product?.name} - ${opt.name}`,
      price: opt.price,
      image: product?.images[0] ?? '/images/placeholder.png',
      quantity: finalQtyToAdd,
    });

    anyAdded = true;
  });

  if (!anyAdded) {
    toast.error('Ya se agregaron al carrito anteriormente.');
  } else {
    toast.success(
      <>
        {mensajes.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </>
    );
        setQuantities({});

  }

};




  const totalPrice = productOptions.reduce((acc, opt) => {
    const qty = quantities[opt.id] || 0
    return acc + qty * opt.price
  }, 0)

  if (loading) return <p>Cargando producto...</p>
  if (!product) return <p>Producto no encontrado</p>

  return (
    <div className="min-h-screen pb-24 pt-20">
      <header className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon"  onClick={() => router.back()}>
          <IoArrowBack size={24} />
        </Button>
        <h1 className="text-lg font-semibold">{product.name}</h1>
      </header>

      <div className="min-h-[400px] py-4 relative z-10">
        <ProductCarousel images={product.images.length > 0 ? product.images : ['/images/placeholder.png']} />
      </div>

      <main className="px-4 max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Seleccioná sabores</h2>

        <div className="max-h-[320px] overflow-y-auto pb-[60px]">
          <Card className="divide-y">
            {productOptions.map(opt => (
              <div
                key={opt.id}
                className="flex items-center justify-between px-4 h-[82px]"
              >
                <div className="flex flex-col justify-center h-full">
                  <p className="font-medium text-lg m-0">{opt.name}</p>
                  <p className="text-sm text-gray-500 m-0">
                    ${opt.price.toLocaleString('es-ES')}
                  </p>
                  <p className="text-sm text-gray-400 m-0">{`Stock: ${opt.stock}`}</p>
                </div>

                <div className="flex items-center gap-2 h-full">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(opt.id, -1)}
                    disabled={(quantities[opt.id] ?? 0) <= 0}
                  >
                    -
                  </Button>
                  <span className="min-w-[24px] text-center text-base font-medium flex items-center justify-center h-full">
                    {quantities[opt.id] || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(opt.id, 1)}
                    disabled={(quantities[opt.id] ?? 0) >= opt.stock}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md px-4 py-3">
        <Button
          className="w-full py-6 text-lg"
          disabled={totalPrice === 0}
          onClick={handleAddToCart}
        >
          Agregar al carrito (${totalPrice.toLocaleString('es-ES')})
        </Button>
      </div>
      <Toaster position="top-center" duration={3000} richColors />
    </div>
  )
}
