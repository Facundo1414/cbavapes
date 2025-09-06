'use client';

import { useState, useEffect  } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MdShoppingCart } from 'react-icons/md';
import { usePathname } from 'next/navigation';

export default function CartBarMobile() {
  const { cart, cartTotal, removeFromCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // 👈
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      setIsOpen(false);
    }
  }, [cart.length]);

  if (cart.length === 0 || pathname === '/checkout') return null;

  const handleClose = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <SheetTrigger
        aria-label="Abrir carrito"
        className="fixed bottom-5 right-4 z-50 bg-violet-600 text-white p-3 rounded-full shadow-lg hover:bg-violet-700 sm:hidden flex items-center justify-center gap-1"
        onClick={() => setIsOpen(true)} 
      >
        <MdShoppingCart size={24} />
        {cart.length}
      </SheetTrigger>

      <SheetContent side="left" className="w-72 pt-16 px-4 pb-6 flex flex-col">
        <SheetTitle className="sr-only">Carrito de compras</SheetTitle>

        <div className="flex-grow overflow-auto space-y-4">
          {cart.map((item) => (
            <div
              key={`${item.product_id}-${item.flavor_id ?? 'default'}`}
              className="flex justify-between items-center border-b border-gray-300 last:border-b-0 pb-3 mb-3"
            >
              <div className="flex flex-col">
                <span className="font-medium">
                  {item.name}
                </span>
                <span className="text-sm text-gray-600">
                  ${item.price.toLocaleString('es-ES')} x {item.quantity}
                </span>
                <span className="text-sm font-semibold text-black">
                  Subtotal: {(item.price * item.quantity).toLocaleString('es-ES')}
                </span>
              </div>
              <button
                onClick={() => removeFromCart(item.product_id, item.flavor_id)}
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
