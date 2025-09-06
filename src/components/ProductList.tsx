import { ProductFull } from '@/app/api/products/useProducts';
import ProductCard from './ProductCard';

type ProductListProps = {
  products: ProductFull[];
  selectedCategory: string;
  dataAttribute?: (category: string) => { [key: string]: string };
};

export default function ProductList({ products, selectedCategory, dataAttribute }: ProductListProps) {
  if (!products || products.length === 0)
    return <p className="text-center text-gray-500">No se encontraron productos.</p>;

  // Mostrar productos agrupados por marca y filtro de marcas para todas las categorías
  const brands = Array.from(new Set(products.map(p => p.brand || 'Sin marca')));
  return (
    <section className="flex flex-col gap-8">
      {brands.map((brand) => {
        const brandProducts = products.filter(p => (p.brand || 'Sin marca') === brand);
        return (
          <div key={brand} className="scroll-mt-[72px]">
            <h3 className="text-xl font-semibold mb-4">{brand}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brandProducts.map((product, idx) => (
                <div key={`${product.id}-${product.brand}`} className={brandProducts.length === 1 ? 'md:col-span-2' : ''}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
