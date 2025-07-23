'use client';

import Link from 'next/link';
import { Product } from '@/app/api/products/products';

type ProductCardProps = {
  product: Product;
};


export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="bg-white rounded-lg shadow flex flex-row items-center h-35 w-full overflow-hidden">
      {/* Imagen del producto */}
      <Link
        href={`/product/${product.ID}`}
        className="flex-shrink-0 h-full aspect-[8/10] rounded overflow-hidden cursor-pointer"
      >
        <img
          src={product.image || '/images/palceholder.png'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </Link>

      {/* Info del producto */}
      <Link
        href={`/product/${product.ID}`}
        className="flex flex-col justify-between flex-grow h-full pl-4 py-3 cursor-pointer overflow-hidden"
      >
        <h3
          className="text-xl md:text-2xl font-semibold text-gray-900 truncate hover:underline"
          title={product.name}
        >
          {product.name}
        </h3>
        <p className="text-lg md:text-xl font-bold text-gray-800">
          ${Number(product.price).toLocaleString()}
        </p>
      </Link>
    </article>
  );
}
