'use client'

import { useCart } from '@/context/CartContext'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { IoArrowBack } from 'react-icons/io5'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCarousel } from '@/components/ui/ProductCarousel'
import { ProductCarouselDesktop } from '@/components/ui/ProductCarouselDesktop'
import { useProducts, ProductFull } from '@/app/api/products/useProducts'
import { toast, Toaster } from 'sonner' 
import PageHeader from '@/components/PageHeader'

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
      const found = products.find(p => String(p.id) === String(productId));
      setProduct(found ?? null);

      if (found) {
        const flavorsOptions = found.flavors.map(f => ({
          id: String(f.id),
          name: f.flavor,
          price: found.price,
          stock: f.stock,
        }));

        flavorsOptions.sort((a, b) => {
          if (a.stock > 0 && b.stock === 0) return -1;
          if (a.stock === 0 && b.stock > 0) return 1;
          return 0;
        });

        setProductOptions(flavorsOptions);
      } else {
        setProductOptions([]);
      }
    }
  }, [loading, productId, products]);

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

    // Buscar en el carrito la cantidad actual de ese producto/sabor
    const currentInCart = cart.find(
      (item) => item.product_id === product?.id && item.flavor_id === Number(opt.id)
    )?.quantity ?? 0;

    // Si ya está en el carrito y sumar excede el stock, no permitir
    if (currentInCart + quantityToAdd > opt.stock) {
      mensajes.push(`No se puede agregar más de ${opt.stock} unidades de ${opt.name} (stock máximo alcanzado)`);
      return;
    }

    // Si ya está todo el stock en el carrito, no permitir agregar más
    if (currentInCart >= opt.stock) {
      mensajes.push(`Ya tienes el máximo de ${opt.name} en el carrito (stock: ${opt.stock})`);
      return;
    }

    // Generar array de imágenes
    const images = [product?.image1, product?.image2, product?.image3].filter(Boolean);

    addToCart({
      id: product?.id ?? 0,
      product_id: product?.id ?? 0,
      flavor_id: Number(opt.id),
      name: product?.name ? `${product.name} - ${opt.name}` : opt.name,
      brand: product?.brand ?? '',
      image: images[0] ?? '/images/placeholder.png',
      price: opt.price,
      quantity: quantityToAdd,
      flavor: opt.name,
      category_key: product?.category ?? '',
    });

    mensajes.push(
      `Se ${quantityToAdd === 1 ? 'agregó' : 'agregaron'} ${quantityToAdd} ${quantityToAdd === 1 ? 'unidad' : 'unidades'} de ${opt.name}`
    );
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

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <Skeleton className="h-8 w-1/2 mb-6" />
        <Skeleton className="h-80 w-full mb-8 rounded-xl" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
  if (!product) return <p>Producto no encontrado</p>

  return (
    <div className="min-h-screen">

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <PageHeader title={product.name} />
      </div>
      <main className="max-w-5xl mx-auto flex flex-col min-h-screen pt-2 px-4 sm:px-6 lg:px-8">
        <div className="min-h-[400px] py-4 relative z-10">
          {(() => {
            const images = [product.image1, product.image2, product.image3].filter((img): img is string => typeof img === 'string' && !!img);
            return (
              <>
                {/* Mobile: carrusel original */}
                <div className="block md:hidden">
                  <ProductCarousel images={images.length > 0 ? images : ['/images/placeholder.png']} />
                </div>
                {/* Desktop: carrusel adaptado */}
                <div className="hidden md:block">
                  <ProductCarouselDesktop images={images.length > 0 ? images : ['/images/placeholder.png']} />
                </div>
              </>
            );
          })()}
        </div>
        <h2 className="text-xl font-bold mb-4">Seleccioná sabores</h2>
        <div className="max-h-[320px] overflow-y-auto pb-[60px]">
          <Card className="divide-y">
            {productOptions.map(opt => (
              <div
                key={opt.id}
                className="flex items-center justify-between px-4 h-[82px]"
              >
                <div className="flex flex-col justify-center h-full min-w-0">
                  <p className="font-medium text-lg m-0 break-words truncate md:whitespace-normal md:break-words md:truncate-none" style={{ wordBreak: 'break-word' }}>{opt.name}</p>
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
          <div className=" mt-4">
            <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8">
              <Button
                className="w-full py-6 text-lg"
                disabled={totalPrice === 0}
                onClick={handleAddToCart}
              >
                Agregar al carrito (${totalPrice.toLocaleString('es-ES')})
              </Button>
            </div>
          </div>
      </main>
      <Toaster position="top-center" duration={3000} richColors />
    </div>
  )
}
