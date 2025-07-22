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
          <div key={item.id} className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="font-medium">{item.name}</span>
              <span className="text-sm text-gray-600">
                ${item.price} x {item.quantity}
              </span>
              <span className="text-sm font-semibold text-black">
                Subtotal: ${item.price * item.quantity}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="bg-gray-200 px-2 rounded text-lg"
                onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
              >
                +
              </button>
              <button
                className="bg-red-200 px-2 rounded text-lg"
                onClick={() => removeFromCart(item.id)}
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
