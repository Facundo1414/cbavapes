'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<p className="text-center mt-8">Cargando...</p>}>
      <ResetPasswordContent />
    </Suspense>
  );
};

const ResetPasswordContent = () => {
  const searchParams = useSearchParams(); // Para obtener los parámetros de la URL
  const router = useRouter(); // Para redirigir después de restablecer la contraseña
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchParams) {
      setMessage('Error al obtener los parámetros de la URL.');
      setLoading(false);
      return;
    }

    const access_token = searchParams.get('access_token');
    const type = searchParams.get('type');

    if (type !== 'recovery' || !access_token) {
      setMessage('Token inválido o faltante.');
      setLoading(false);
      return;
    }

    // Autenticar al usuario temporalmente con el access_token
    const authenticateUser = async () => {
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token: '', // No es necesario el refresh_token aquí
      });

      if (error) {
        setMessage('Error al autenticar el token.');
      }

      setLoading(false);
    };

    authenticateUser();
  }, [searchParams]);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage('Por favor, completa ambos campos de contraseña.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMessage('Error al restablecer la contraseña.');
    } else {
      setMessage('Contraseña restablecida con éxito.');
      router.push('/login'); // Redirige al login
    }
  };

  if (loading) {
    return <p className="text-center mt-8">Cargando...</p>;
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-2">
      <div className="w-full">
        <PageHeader title="Restablecer contraseña" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-start pt-8 w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleResetPassword();
          }}
          className="bg-white rounded-lg shadow p-6 w-full max-w-xl flex flex-col gap-4 border border-gray-200"
        >
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="new-password"
          >
            Nueva contraseña
          </label>
          <div className="relative w-full">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingresa tu nueva contraseña"
              className="border p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30 w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-sm text-yellow-600 hover:underline"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="confirm-password"
          >
            Confirmar contraseña
          </label>
          <input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirma tu nueva contraseña"
            className="border p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-600 focus:ring-2 focus:ring-primary/30 w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-green-600"
          >
            {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
          </Button>
          {message && (
            <p className="mt-4 text-center text-red-500">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;