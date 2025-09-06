import ProductImage from '../ProductImage';
import clsx from 'clsx';

interface DesktopCarouselProps {
  images: string[];
}

export const ProductCarouselDesktop = ({ images }: DesktopCarouselProps) => {
  // Simple desktop carousel: muestra todas las imágenes en fila, grandes, con hover zoom
  return (
    <div className="hidden md:flex gap-8 justify-center items-center w-full py-6">
      {images.map((src, idx) => (
        <div
          key={idx}
          className={clsx(
            'relative rounded-xl overflow-hidden shadow-lg transition-transform duration-300',
            'w-[340px] h-[340px] hover:scale-105 cursor-pointer'
          )}
        >
          <ProductImage
            src={src}
            alt={`Producto ${idx + 1}`}
            className="object-cover w-full h-full"
          />
        </div>
      ))}
    </div>
  );
};
