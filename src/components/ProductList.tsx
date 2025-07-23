import ProductCard from './ProductCard';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  available?: boolean;
  options?: string[];
  nicotineLevel?: string;
};

type ProductListProps = {
  products: Product[];
  selectedCategory: string;
  dataAttribute?: (category: string) => { [key: string]: string };
};

export default function ProductList({ products, selectedCategory, dataAttribute }: ProductListProps) {
  if (products.length === 0)
    return <p className="text-center text-gray-500">No se encontraron productos.</p>;

  // Agrupar productos por categoría (incluso categorías sin productos filtrados)
  // Para eso, obtenemos todas las categorías del array original o del filtro
  const allCategories = Array.from(new Set(products.map(p => p.category)));

  // Creamos mapa de categoría -> productos (filtrados)
  const categoriesMap = allCategories.reduce<Record<string, Product[]>>((acc, category) => {
    acc[category] = products.filter((p) => p.category === category);
    return acc;
  }, {});

  return (
    <section className="flex flex-col gap-8">
      {allCategories.map((category) => (
        <div
          key={category}
          {...(dataAttribute ? dataAttribute(category) : {})}
          className="scroll-mt-[72px]"
        >
          <h2 className="text-xl font-semibold mb-4">{category}</h2>

          {categoriesMap[category].length === 0 ? (
            <p className="text-gray-500 italic">No hay productos en esta categoría</p>
          ) : (
            <div className="flex flex-col gap-4">
              {categoriesMap[category].map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
