export type IdentitreeEnv = {
  hasAnthropic: boolean;
  anthropicApiKey: string | null;
  hasSupabase: boolean;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  supabaseServiceRoleKey: string | null;
};

export const getIdentitreeEnv = (): IdentitreeEnv => {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY ?? null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;

  return {
    hasAnthropic: Boolean(anthropicApiKey),
    anthropicApiKey,
    hasSupabase: Boolean(supabaseUrl && supabaseAnonKey),
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
  };
};
