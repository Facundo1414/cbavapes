import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Solo proteger rutas /admin, excepto /admin/login
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // Leer el token de la cookie (ajusta el nombre si usas otro)
  const supabaseAccessToken = request.cookies.get("sb-access-token")?.value;
  if (!supabaseAccessToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Validar el token con Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, error } = await supabase.auth.getUser(supabaseAccessToken);
  if (error || !data.user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Verificar rol admin (en user.user_metadata.role o en user.app_metadata.role)
  const role = data.user.user_metadata?.role || data.user.app_metadata?.role;
  if (role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Si todo OK, dejar pasar
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
