import { supabaseBrowser } from "@/utils/supabaseClientBrowser";

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
  const { data, error }: { data: { id: number }[] | null; error: any } =
    await supabaseBrowser
      .from("clients")
      .select("id")
      .eq("name", nombre)
      .eq("phone", telefono);

  if (error) {
    throw new Error("Error al buscar el cliente: " + error.message);
  }

  if (data && data.length === 1) {
    return data[0].id;
  } else if (data && data.length > 1) {
    throw new Error("Se encontraron múltiples clientes con los mismos datos.");
  }

  const {
    data: newClient,
    error: insertError,
  }: { data: { id: number } | null; error: any } = await supabaseBrowser
    .from("clients")
    .insert([{ name: nombre, phone: telefono }])
    .select("id")
    .single();

  if (insertError) {
    throw new Error("Error al crear el cliente: " + insertError.message);
  }

  if (newClient && newClient.id) {
    return newClient.id;
  }

  throw new Error("No se pudo crear el cliente");
}

export async function crearPedidoYItems({
  nombre,
  telefono,
  cart,
  total,
  cupon,
  descuentoAplicado,
  aclaraciones,
  clearCart,
  router,
}: {
  nombre: string;
  telefono: string;
  cart: CartItem[];
  total: number;
  cupon: string;
  descuentoAplicado: number;
  aclaraciones: string;
  clearCart: () => void;
  router: { push: (path: string) => void };
}) {
  try {
    if (!nombre.trim() || !telefono.trim() || cart.length === 0) {
      throw new Error("Completa todos los datos y agrega productos.");
    }
    const clientId = await getOrCreateClient(nombre, telefono);
    const pedido = {
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
    };
    const { data: pedidoData } = await supabaseBrowser
      .from("orders")
      .insert([pedido])
      .select("id")
      .single();
    if (!pedidoData?.id) throw new Error("No se pudo crear el pedido");
    const orderId = pedidoData.id;
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
      if (itemsError) throw new Error("No se pudieron guardar los ítems");
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
