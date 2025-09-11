import { createClient } from "@supabase/supabase-js";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

console.log(
  "Service Role Key:",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "No se encontró la clave"
);

export async function POST(req: Request) {
  const body = await req.json();
  const {
    client_id,
    status = "Nuevo", // Default value for status
    total,
    created_at,
    paid,
    delivered,
    coupon,
    followup_done,
    notes,
    discount,
  } = body;

  try {
    console.log("Intentando insertar en la tabla orders...");
    const { data, error } = await supabaseServer
      .from("orders")
      .insert([
        {
          client_id,
          status,
          total,
          created_at,
          paid,
          delivered,
          coupon,
          followup_done,
          notes,
          discount,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Error al insertar en la tabla orders:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Inserción exitosa en la tabla orders:", data);
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
    },
  });
}
