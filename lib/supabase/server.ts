import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getIdentitreeEnv } from "@/lib/identitree/env";

export const createIdentitreeServerSupabaseClient = async () => {
  const env = getIdentitreeEnv();
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
};
