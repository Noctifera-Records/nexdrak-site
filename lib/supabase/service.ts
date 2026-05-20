import { createClient } from '@supabase/supabase-js'

export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    // Si faltan variables de entorno, no lanzamos un error que rompa el sitio,
    // sino que devolvemos un log para diagnosticar en Cloudflare.
    console.error("DIAGNOSTIC: Missing Supabase Environment Variables");
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  } catch (e) {
    console.error("DIAGNOSTIC: Failed to initialize Supabase client", e);
    return null;
  }
}
