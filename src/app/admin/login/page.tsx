"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from 'sonner'

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, complete todos los campos.");
      return;
    }
    setLoading(true);
    setError("");

    const MAX_ATTEMPTS = 5;
    const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutos en milisegundos
    const lastAttemptTime = parseInt(localStorage.getItem("lastAttemptTime") || "0", 10);
    const currentTime = Date.now();

    if (currentTime - lastAttemptTime < LOCKOUT_TIME) {
      toast.error("Demasiados intentos fallidos. Intente nuevamente más tarde.");
      setLoading(false);
      return;
    }

    let attempts = parseInt(localStorage.getItem("loginAttempts") || "0", 10);
    if (attempts >= MAX_ATTEMPTS) {
      localStorage.setItem("lastAttemptTime", currentTime.toString());
      toast.error("Demasiados intentos fallidos. Intente nuevamente en 5 minutos.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      attempts += 1;
      localStorage.setItem("loginAttempts", attempts.toString());
      if (error.message.includes("email")) {
        toast.error("Correo no registrado.");
      } else if (error.message.includes("password")) {
        toast.error("Contraseña incorrecta.");
      } else {
        toast.error("Error al iniciar sesión. Intente nuevamente.");
      }
    } else if (data.session) {
      toast.success("Inicio de sesión exitoso. Redirigiendo...");
      localStorage.setItem("loginAttempts", "0"); // Reiniciar intentos
      await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      });
      await supabaseBrowser.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      window.location.href = "/admin";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-xs md:max-w-md flex flex-col gap-4"
      >
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-center text-gray-800">Panel de Administrador de Cuenta</h1>
        <p className="text-sm md:text-base text-center text-gray-600 mb-4">Necesitas permisos para acceder</p>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          aria-label="Correo electrónico"
          className="text-sm md:text-base"
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          aria-label="Contraseña"
          className="text-sm md:text-base"
        />
        {error && <p className="text-red-500 text-xs md:text-sm text-center">{error}</p>}
        <Button
          type="submit"
          className="w-full py-2 md:py-3 text-sm md:text-base bg-black hover:bg-gray-800 text-white rounded"
          disabled={loading}
          aria-label="Botón de inicio de sesión"
        >
          {loading ? "Verificando..." : "Ingresar"}
        </Button>
      </form>
      <Toaster />
    </div>
  );
}
