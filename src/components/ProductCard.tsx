'use client';

import Link from 'next/link';
import { ProductFull } from '@/app/api/products/useProducts';
import ProductImage from './ProductImage';

type ProductCardProps = {
  product: ProductFull;
};

function hasStock(product: ProductFull): boolean {
  return (
    product.flavors &&
    product.flavors.reduce((sum, f) => sum + f.stock, 0) > 0
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const inStock = hasStock(product);

  return (
    <article
      className={`bg-white rounded-lg shadow flex flex-row items-center h-35 w-full overflow-hidden relative ${
        !inStock ? 'opacity-60' : ''
      }`}
    >
      {/* Imagen del producto */}
      <Link
        href={`/product/${product.id}`}
        className="flex-shrink-0 h-full aspect-[8/10] rounded overflow-hidden cursor-pointer"
      >
        <ProductImage
          src={([product.image1, product.image2, product.image3].filter(Boolean)[0]) ?? '/images/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </Link>

      {/* Info del producto */}
      <Link
        href={`/product/${product.id}`}
        className="flex flex-col justify-between flex-grow h-full pl-4 py-3 cursor-pointer overflow-hidden"
      >
        <h3
          className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug break-words pr-4"
          title={product.name}
        >
          {product.name}
        </h3>
        <p className="text-lg md:text-xl font-bold text-gray-800">
          ${product.price.toLocaleString('es-ES')}
        </p>


      </Link>

      {/* Etiqueta Sin stock */}
      {!inStock && (
        <span className="absolute bottom-2 right-2 text-sm bg-red-500 text-white px-2 py-1 rounded-full shadow-md">
          Sin stock
        </span>
      )}

    </article>
  );
}
