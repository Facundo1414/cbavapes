// components/ProductImage.tsx
import React from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
};

function ProductImage({ src, alt = 'Imagen de producto', ...rest }: Props) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      crossOrigin="anonymous"
      {...rest}
    />
  );
}

export default React.memo(ProductImage, (prev, next) => prev.src === next.src);
