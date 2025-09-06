"use client";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabaseBrowser } from '@/utils/supabaseClientBrowser';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionContextProvider supabaseClient={supabaseBrowser}>
      {children}
    </SessionContextProvider>
  );
}
