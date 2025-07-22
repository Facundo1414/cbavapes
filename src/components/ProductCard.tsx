'use client';
import { useState } from 'react';

import Link from 'next/link';
import React from 'react';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  available?: boolean;
  options?: string[]; // ej. ['Uva', 'Melón', 'Menta']
  nicotineLevel?: string; // ej. '5%', '0%'
};


type ProductCardProps = {
  product: Product;
  onAddToCart: (product: { id: number; name: string; price: number }) => void;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="bg-white rounded-lg shadow flex flex-row items-center h-35 w-full overflow-hidden">
      {/* Imagen vertical ocupando un poco más de ancho */}
      <Link
        href={`/product/${product.id}`}
        className="flex-shrink-0 h-full aspect-[8/10] rounded overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </Link>

      {/* Info: título arriba, precio abajo */}
      <Link
        href={`/product/${product.id}`}
        className="flex flex-col justify-between flex-grow h-full pl-4 py-3 cursor-pointer overflow-hidden"
      >
        <h3
          className="text-xl md:text-2xl font-semibold text-gray-900 truncate hover:underline"
          title={product.name}
        >
          {product.name}
        </h3>
        <p className="text-lg md:text-xl font-bold text-gray-800">
          ${product.price.toLocaleString()}
        </p>
      </Link>
    </article>
  );
}







