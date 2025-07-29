'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MdShoppingCart } from 'react-icons/md';
import { usePathname } from 'next/navigation';

export default function CartBarMobile() {
  const { cart, cartTotal, removeFromCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // 👈

  if (cart.length === 0 || pathname === '/checkout') return null; // 👈

  const handleClose = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        aria-label="Abrir carrito"
        className="fixed bottom-20 right-4 z-50 bg-violet-600 text-white p-3 rounded-full shadow-lg hover:bg-violet-700 sm:hidden flex items-center justify-center gap-1"
      >
        <MdShoppingCart size={24} />
        {cart.length}
      </SheetTrigger>

      <SheetContent side="left" className="w-72 pt-16 px-4 pb-6 flex flex-col">
        <SheetTitle className="sr-only">Carrito de compras</SheetTitle>

        <div className="flex-grow overflow-auto space-y-4">
          {cart.map((item) => (
            <div
              key={`${item.id}-${item.flavor || 'default'}`}
              className="flex justify-between items-center border-b border-gray-300 last:border-b-0 pb-3 mb-3"
            >
              <div className="flex flex-col">
                <span className="font-medium">
                  {item.name} {item.flavor ? `- ${item.flavor}` : ''}
                </span>
                <span className="text-sm text-gray-600">
                  ${item.price.toLocaleString('es-ES')} x {item.quantity}
                </span>
                <span className="text-sm font-semibold text-black">
                  Subtotal: ${(item.price * item.quantity).toLocaleString('es-ES')}
                </span>
              </div>
              <button
                onClick={() => removeFromCart(item.id, item.flavor)}
                className="ml-4 text-red-600 hover:text-red-800"
                aria-label={`Eliminar ${item.name} ${item.flavor || ''} del carrito`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>


        <div className="mt-6 border-t pt-4 flex justify-between items-center">
          <p className="font-bold text-lg">
            Total: ${cartTotal.toLocaleString('es-ES')}
          </p>
          <Link
            href="/checkout"
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-center"
            onClick={handleClose} // <- cerramos el drawer aquí
          >
            Finalizar Pedido
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
