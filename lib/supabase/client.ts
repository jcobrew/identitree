import { createBrowserClient } from "@supabase/ssr";
import { getIdentitreeEnv } from "@/lib/identitree/env";

export const createIdentitreeBrowserSupabaseClient = () => {
  const env = getIdentitreeEnv();
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
};
