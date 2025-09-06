'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type CartItem = {
  id: number; // id del producto
  product_id: number; // igual a id del producto
  name: string;
  brand?: string;
  image: string;
  price: number;
  quantity: number;
  flavor?: string;
  flavor_id?: number;
  category_key?: string;
};


type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: number, flavor_id?: number) => void;
  clearCart: () => void;
  cartTotal: number;
};


const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
  const qtyToAdd = item.quantity ?? 1;
  setCart((prev) => {
    // Considera todos los atributos relevantes para identificar una línea única
    const found = prev.find(
      (p) =>
        p.product_id === item.product_id &&
        p.flavor_id === item.flavor_id &&
        p.brand === item.brand &&
        p.category_key === item.category_key
    );
    if (found) {
      return prev.map((p) =>
        p.product_id === item.product_id &&
        p.flavor_id === item.flavor_id &&
        p.brand === item.brand &&
        p.category_key === item.category_key
          ? { ...p, quantity: p.quantity + qtyToAdd }
          : p
      );
    }
    return [...prev, { ...item, quantity: qtyToAdd }];
  });
};




  const removeFromCart = (id: number, flavor_id?: number) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product_id === id && item.flavor_id === flavor_id))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
};
