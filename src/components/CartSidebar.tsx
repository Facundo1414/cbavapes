'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { IoClose } from 'react-icons/io5';

interface CartSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function CartSidebar({ open, setOpen }: CartSidebarProps) {
  const { cart, cartTotal, removeFromCart, addToCart } = useCart();

  // Solo desktop
  if (!open || typeof window !== 'undefined' && window.innerWidth < 768) return null;

  if (cart.length === 0) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Fondo oscuro para cerrar */}
        <div
          className="hidden md:block fixed inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-label="Cerrar carrito"
        />
        <aside className="hidden md:flex flex-col fixed top-0 right-0 h-full w-96 bg-white shadow-2xl border-l p-6 z-50 animate-slide-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Tu carrito</h2>
            <button onClick={() => setOpen(false)} aria-label="Cerrar carrito" className="text-2xl text-gray-500 hover:text-black"><IoClose /></button>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-full pr-2">
            {cart.map((item) => (
              <div
                key={`${item.product_id}-${item.flavor_id ?? 'default'}`}
                className="flex justify-between items-center gap-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-grow">
                  <p className="font-medium">{item.name}</p>
                  {item.flavor && (
                    <p className="text-sm text-gray-600">Sabor: {item.flavor}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Precio unitario: ${item.price.toLocaleString('es-ES')}
                  </p>
                  <p className="text-sm font-semibold text-black">
                    Subtotal: ${(item.price * item.quantity).toLocaleString('es-ES')}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button
                    className="bg-gray-200 px-2 rounded text-lg"
                    onClick={() =>
                      addToCart({
                        id: item.id,
                        product_id: item.product_id,
                        flavor_id: item.flavor_id,
                        name: item.name,
                        flavor: item.flavor,
                        price: item.price,
                        image: item.image,
                      })
                    }
                  >
                    +
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="bg-red-200 px-2 rounded text-lg"
                    onClick={() => removeFromCart(item.product_id, item.flavor_id)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
      </div>

          <div className="mt-6 border-t pt-4">
            <p className="font-bold text-xl">Total: ${cartTotal}</p>
            <Link
              href="/checkout"
              className="mt-3 block bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 text-lg"
              onClick={() => setOpen(false)}
            >
              Finalizar pedido
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

