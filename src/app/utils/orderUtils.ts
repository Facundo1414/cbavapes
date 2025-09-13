import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import { PostgrestError } from "@supabase/supabase-js";

export interface Client {
  id: number;
  name: string;
  phone: string;
  notes?: string;
}

export interface GetOrCreateClientResponse {
  data: Client | null;
  error: unknown;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  flavor?: string;
  flavor_id?: number | null;
}

export async function getOrCreateClient(
  nombre: string,
  telefono: string
): Promise<number> {
  const {
    data: newClient,
    error: insertError,
  }: { data: { id: number } | null; error: PostgrestError | null } =
    await supabaseBrowser
      .from("clients")
      .insert([{ name: nombre, phone: telefono }])
      .select("id")
      .single();

  if (insertError && insertError.message.includes("duplicate key")) {
    // Manejar el caso en el que el cliente ya existe
    const { data, error } = await supabaseBrowser
      .from("clients")
      .select("id")
      .eq("name", nombre)
      .eq("phone", telefono)
      .single();

    if (error) {
      throw new Error("Error al buscar el cliente: " + error.message);
    }

    return data.id;
  }

  if (insertError) {
    throw new Error("Error al crear el cliente: " + insertError.message);
  }

  if (!newClient || !newClient.id) {
    throw new Error("No se pudo crear el cliente");
  }

  return newClient.id;
}

export async function crearPedidoYItems({
  cart,
  total,
  cupon,
  descuentoAplicado,
  aclaraciones,
  clearCart,
  router,
  clientId
}: {
  cart: CartItem[];
  total: number;
  cupon: string;
  descuentoAplicado: number;
  aclaraciones: string;
  clearCart: () => void;
  router: { push: (path: string) => void };
  clientId: number;
}) {
  try {

    // Insertar el pedido
    const { error: pedidoError } = await supabaseBrowser
      .from("orders")
      .insert([
        {
          client_id: clientId,
          status: "pendiente",
          total,
          created_at: new Date().toISOString(),
          paid: false,
          delivered: false,
          coupon: cupon,
          followup_done: false,
          notes: aclaraciones,
          discount: descuentoAplicado,
        },
      ]);

    if (pedidoError) {
      throw new Error("No se pudo crear el pedido: " + pedidoError.message);
    }

    // Obtener el ID del último pedido creado para el cliente
    const { data: lastOrder, error: selectError } = await supabaseBrowser
      .from("orders")
      .select("id")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (selectError || !lastOrder?.id) {
      throw new Error("No se pudo obtener el ID del pedido: " + selectError?.message);
    }

    const orderId = lastOrder.id;

    // Insertar los ítems del pedido
    const items = cart.map((item) => ({
      order_id: orderId,
      product_id: item.id,
      product_name: item.name,
      price: item.price,
      quantity: item.quantity,
      flavor: item.flavor || "",
      flavor_id: item.flavor_id || null,
    }));

    if (items.length) {
      const { error: itemsError } = await supabaseBrowser
        .from("order_items")
        .insert(items);
      if (itemsError) {
        throw new Error(
          "No se pudieron guardar los ítems: " + itemsError.message
        );
      }
    }

    clearCart();
    router.push("/");
    return true;
  } catch (err) {
    throw err;
  }
}

export function generarMensajeWhatsapp({
  cart,
  formaEntrega,
  retiroLugar,
  direccion,
  barrio,
  total,
  nombre,
  telefono,
  formaPago,
}: {
  cart: CartItem[];
  formaEntrega: "retiro" | "envio";
  retiroLugar: string;
  direccion: string;
  barrio: string;
  total: number;
  nombre: string;
  telefono: string;
  formaPago: string;
}) {
  const productos = cart
    .map(
      (item) =>
        `• ${item.name} x${item.quantity} - $${(
          item.price * item.quantity
        ).toLocaleString("es-ES", { minimumFractionDigits: 0 })}`
    )
    .join("\n");
  const envio =
    formaEntrega === "retiro"
      ? `- Retiro en: ${retiroLugar}`
      : `- Envío a: ${direccion}, ${barrio}`;
  return `Hola, quiero hacer un pedido:\n${productos}\n\nTotal: $${total.toLocaleString(
    "es-ES",
    { minimumFractionDigits: 0 }
  )}\n\n- Pedido de: ${nombre}\n- Teléfono: ${telefono}\n- Forma de pago: ${formaPago}\n${envio}`;
}
