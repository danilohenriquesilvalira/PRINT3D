import { createClient } from "@supabase/supabase-js";

// Cliente com service_role — acesso total, sem cookies
// Usar em API Routes onde não precisas de sessão do utilizador
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Alias para compatibilidade com API routes
export const createServerClient = createAdminClient;

// Cliente anon — para leitura pública em API Routes
export function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
