import { createBrowserClient } from "@supabase/ssr";

// Create a singleton client to avoid multiple connections
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // Return existing client if available
  if (supabaseClient) {
    return supabaseClient;
  }

  // Create new client with optimized settings
  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
        },
      },
      // Reduce connection issues
      realtime: {
        params: {
          eventsPerSecond: 2, // Limit real-time events
        },
      },
    }
  );

  return supabaseClient;
}

// Helper function to handle common Supabase errors
export function handleSupabaseError(error: any, operation: string) {
  console.error(`Supabase ${operation} error:`, error);
  
  // Handle specific error types
  if (error?.code === 'PGRST116') {
    return 'No se encontraron registros';
  }
  
  if (error?.code === '23505') {
    return 'Ya existe un registro con estos datos';
  }
  
  if (error?.code === '23514') {
    return 'Los datos no cumplen con las reglas de validación de la base de datos';
  }
  
  if (error?.code === '42501') {
    return 'Error de permisos: verifica que estés autenticado correctamente. Si el problema persiste, contacta al administrador.';
  }
  
  // Check for RLS policy violations
  if (error?.message?.includes('row-level security policy')) {
    return 'Error de permisos de seguridad: verifica que estés autenticado correctamente. Si el problema persiste, contacta al administrador.';
  }
  
  if (error?.message?.includes('JWT')) {
    return 'Sesión expirada. Por favor, inicia sesión nuevamente';
  }
  
  if (error?.message?.includes('QUIC') || error?.message?.includes('protocol')) {
    return 'Error de conexión. Reintentando...';
  }
  
  return error?.message || 'Error desconocido';
}

// Retry mechanism for failed requests
export async function retrySupabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication errors
      if (error?.message?.includes('JWT') || error?.code === '42501') {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
}