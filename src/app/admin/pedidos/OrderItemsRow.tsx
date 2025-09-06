
import { useOrderItems } from "./useOrderItems";
import { useProducts } from "@/app/api/products/useProducts";

type Props = {
  orderId: number;
};

export default function OrderItemsRow({ orderId }: Props) {
  const { items, loading, error } = useOrderItems(orderId);
  const { products, loading: loadingProducts } = useProducts();

  if (loading || loadingProducts) {
    return (
      <tr>
        <td colSpan={7} className="p-2 text-center text-gray-400">Cargando productos...</td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td colSpan={7} className="p-2 text-center text-red-500">Error: {error}</td>
      </tr>
    );
  }

  if (!items.length) {
    return (
      <tr>
        <td colSpan={7} className="p-2 text-center text-gray-400">Sin productos en este pedido.</td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={12} className="bg-gray-50 p-4">
        <div className="w-full">
          <table className="w-full min-w-full">
            <thead>
              <tr>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-left">Sabor</th>
                <th className="p-2 text-left">Precio</th>
                <th className="p-2 text-left">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const prod = products.find(p => p.id === item.product_id);
                const flavor = prod?.flavors?.find(f => f.id === item.flavor_id);
                return (
                  <tr key={item.id}>
                    <td className="p-2">{prod ? prod.name : item.product_name}</td>
                    <td className="p-2">{flavor ? flavor.flavor : item.flavor}</td>
                    <td className="p-2">${item.price}</td>
                    <td className="p-2">{item.quantity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}