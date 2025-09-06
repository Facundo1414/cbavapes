import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/utils/supabaseClientBrowser";
import type { User } from "@supabase/supabase-js";

export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function getUser() {
      setLoading(true);
      const { data } = await supabaseBrowser.auth.getUser();
      if (!ignore) {
        setUser(data?.user || null);
        setLoading(false);
      }
    }
    getUser();
    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );
    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
