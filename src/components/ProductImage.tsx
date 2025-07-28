// components/ProductImage.tsx
import React from 'react';

type Props = {
  src: string;
  alt?: string;
  className?: string;
};

function ProductImage({ src, alt = 'Imagen de producto', className }: Props) {
  return <img src={src} alt={alt} className={className} loading="lazy" crossOrigin="anonymous" />;
}


// Evita rerenders innecesarios si `src` no cambia
export default React.memo(ProductImage, (prevProps, nextProps) => prevProps.src === nextProps.src);
