'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartSidebar() {
  const { cart, cartTotal, removeFromCart, addToCart } = useCart();

  if (cart.length === 0) return null;

  return (
    <aside className="hidden sm:block fixed top-0 right-0 h-full w-80 bg-white shadow-lg border-l p-4 z-40">
      <h2 className="text-xl font-bold mb-4">Tu carrito</h2>

      <div className="flex flex-col gap-4 overflow-y-auto max-h-full">
        {cart.map((item) => (
          <div
            key={`${item.id}-${item.flavor || 'default'}`}
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
                onClick={() => removeFromCart(item.id, item.flavor)}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-4">
        <p className="font-bold text-lg">Total: ${cartTotal}</p>
        <Link
          href="/checkout"
          className="mt-3 block bg-green-600 text-white text-center py-2 rounded hover:bg-green-700"
        >
          Finalizar pedido
        </Link>
      </div>
    </aside>
  );
}

