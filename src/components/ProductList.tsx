import { ProductFull } from '@/app/api/products/useProducts';
import ProductCard from './ProductCard';

type ProductListProps = {
  products: ProductFull[];
  selectedCategory: string;
  dataAttribute?: (category: string) => { [key: string]: string };
};

export default function ProductList({ products, selectedCategory, dataAttribute }: ProductListProps) {
  if (products.length === 0)
    return <p className="text-center text-gray-500">No se encontraron productos.</p>;

  // Obtener categorías únicas (brands)
  const allCategories = Array.from(new Set(products.map(p => p.brand || 'Sin marca')));

  // Agrupar productos por categoría (marca)
  const categoriesMap = allCategories.reduce<Record<string, ProductFull[]>>((acc, brand) => {
    acc[brand] = products.filter((p) => (p.brand || 'Sin marca') === brand);
    return acc;
  }, {});

  return (
    <section className="flex flex-col gap-8">
      {allCategories.map((brand) => (
        <div
          key={brand}
          {...(dataAttribute ? dataAttribute(brand) : {})}
          className="scroll-mt-[72px]"
        >
          <h2 className="text-xl font-semibold mb-4">{brand}</h2>

          {categoriesMap[brand].length === 0 ? (
            <p className="text-gray-500 italic">No hay productos en esta categoría</p>
          ) : (
            <div className="flex flex-col gap-4">
              {categoriesMap[brand].map((product) => (
                <ProductCard key={`${product.productId}-${product.brand}`} product={product} />
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
