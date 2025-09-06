"use client";




import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/lib/supabaseClient";




export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");

  function isNumeric(str: string) {
    return /^\d*$/.test(str);
  }
  const [registerAddress, setRegisterAddress] = useState("");
  const [registerNeighborhood, setRegisterNeighborhood] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) {
      toast.error("Login failed: " + error.message);
    } else {
      toast.success("Login successful!");
      router.push("/");
    }
    setLoading(false);
  }

  function hasNumbers(str: string) {
    return /\d/.test(str);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!registerName.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (hasNumbers(registerName)) {
      toast.error("El nombre no puede contener números");
      return;
    }
    if (!registerEmail.trim()) {
      toast.error("El email es obligatorio");
      return;
    }
    if (!isValidEmail(registerEmail)) {
      toast.error("El email no es válido");
      return;
    }
    if (!registerPassword.trim()) {
      toast.error("La contraseña es obligatoria");
      return;
    }
    if (!registerPhone.trim()) {
      toast.error("El teléfono es obligatorio");
      return;
    }
    if (!registerAddress.trim()) {
      toast.error("La dirección es obligatoria");
      return;
    }
    if (!registerNeighborhood.trim()) {
      toast.error("El barrio es obligatorio");
      return;
    }
    if (hasNumbers(registerNeighborhood)) {
      toast.error("El barrio no puede contener números");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: registerEmail,
      password: registerPassword,
      options: {
        data: {
          name: registerName,
          phone: registerPhone,
          address: registerAddress,
          neighborhood: registerNeighborhood
        }
      },
    });
    if (error) {
      let msg = "Registro fallido: " + error.message;
      if (error.message.toLowerCase().includes("email")) {
        msg = "El email no es válido o ya existe una cuenta con ese email.\n" + error.message;
      }
      toast.error(msg);
      setLoading(false);
      return;
    }
    toast.success("¡Registro exitoso! Debes verificar tu email para continuar.");
    setTab('login');
    setLoading(false);
  }


    function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

  return (
  <div className="min-h-screen max-w-4xl mx-auto px-4 py-2">
      <div className="w-full">
        <PageHeader title={tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'} />
      </div>
  <div className="flex-1 flex flex-col items-center justify-start pt-8 w-full">
        <p className="text-gray-800 text-center max-w-md mb-6 text-base">
          Registrate para acceder a tu historial de compras, recibir cupones de descuentos exclusivos, calificar productos y recibir novedades personalizadas.
        </p>
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${tab === 'login' ? 'border-violet-600 text-violet-600 bg-white' : 'border-transparent text-gray-500 bg-gray-100'}`}
            onClick={() => setTab('login')}
          >
            Iniciar sesión
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${tab === 'register' ? 'border-violet-600 text-violet-600 bg-white' : 'border-transparent text-gray-500 bg-gray-100'}`}
            onClick={() => setTab('register')}
          >
            Crear cuenta
          </button>
        </div>
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="bg-white rounded-lg shadow p-6 w-full max-w-xl flex flex-col gap-4 border border-gray-200">
            <label className="text-sm font-medium text-gray-700" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="Tu email"
              className="border p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              required
            />
            <label className="text-sm font-medium text-gray-700" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              placeholder="Tu contraseña"
              className="border p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
            {/* Botón de login social removido */}
          </form>
        ) : (
          <form onSubmit={handleRegister} className="bg-white rounded-lg shadow p-4 md:p-3 w-full max-w-xl flex flex-col gap-3 border border-gray-200">
            <label className="text-sm font-medium text-gray-700" htmlFor="register-name">Nombre y apellido</label>
            <input
              id="register-name"
              type="text"
              placeholder="Tu nombre completo"
              className="border p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
              value={registerName}
              onChange={e => {
                if (!hasNumbers(e.target.value)) setRegisterName(e.target.value);
              }}
              required
            />
            <label className="text-sm font-medium text-gray-700" htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              placeholder="Tu email"
              className="border p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
              value={registerEmail}
              onChange={e => setRegisterEmail(e.target.value)}
              required
            />
            <label className="text-sm font-medium text-gray-700" htmlFor="register-password">Contraseña</label>
            <input
              id="register-password"
              type="password"
              placeholder="Tu contraseña"
              className="border p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
              value={registerPassword}
              onChange={e => setRegisterPassword(e.target.value)}
              required
            />
            <label className="text-sm font-medium text-gray-700" htmlFor="register-phone">Teléfono</label>
            <input
              id="register-phone"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="351..."
              className="border p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
              value={registerPhone}
              onChange={e => {
                if (isNumeric(e.target.value)) {
                  setRegisterPhone(e.target.value);
                } else {
                  toast.error("Solo se permiten números en el teléfono");
                }
              }}
              required
            />
            <label className="text-sm font-medium text-gray-700" htmlFor="register-address">Dirección</label>
            <input
              id="register-address"
              type="text"
              placeholder="Tu dirección"
              className="border p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
              value={registerAddress}
              onChange={e => setRegisterAddress(e.target.value)}
              required
            />
            <label className="text-sm font-medium text-gray-700" htmlFor="register-neighborhood">Barrio</label>
            <input
              id="register-neighborhood"
              type="text"
              placeholder="Tu barrio"
              className="border p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30"
              value={registerNeighborhood}
              onChange={e => {
                if (!hasNumbers(e.target.value)) setRegisterNeighborhood(e.target.value);
              }}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Registrando..." : "Registrarme"}
            </Button>
            {/* Botón de registro social removido */}
          </form>
        )}
      </div>
      <Toaster></Toaster>
    </div>
  );
}
