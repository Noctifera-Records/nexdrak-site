import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

// Configure Neon for Cloudflare Workers
if (typeof window === 'undefined') {
  // Use the native WebSocket provided by Cloudflare
  if (globalThis.WebSocket) {
    neonConfig.webSocketConstructor = globalThis.WebSocket;
  }
  
  // CRITICAL for SASL errors in some proxies/poolers:
  // Disabling pipelineTLS can fix "server signature is missing" errors
  neonConfig.pipelineTLS = false;
  neonConfig.useSecureWebSocket = true;
}

function getConnectionString() {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return "postgresql://placeholder:placeholder@localhost:5432/placeholder";
  }
  
  // For Supabase Pooler (6543), we must use transaction mode compatible settings
  if (connectionString.includes(':6543')) {
    if (!connectionString.includes('prepareThreshold')) {
      const separator = connectionString.includes('?') ? '&' : '?';
      connectionString += `${separator}prepareThreshold=0`;
    }
    // Force sslmode=require for secure SASL handshake
    if (!connectionString.includes('sslmode')) {
      connectionString += `&sslmode=require`;
    }
  }
  
  return connectionString;
}

let cachedDb: any = null;
let cachedPool: Pool | null = null;

export function getDb() {
  // In serverless, we sometimes want to recreate the pool if it hangs
  // but for now let's use a standard singleton pattern with better timeouts
  if (cachedDb) return cachedDb;

  const connectionString = getConnectionString();

  try {
    cachedPool = new Pool({
      connectionString,
      connectionTimeoutMillis: 10000, // Keep 10s for high latency
      idleTimeoutMillis: 15000,
      max: 1, // REDUCED TO 1 TO SAVE CPU
    });
    
    cachedDb = drizzle(cachedPool);
    return cachedDb;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

export const db = {
  query: async (sqlText: string, params?: unknown[]) => {
    try {
      getDb(); // Ensure cachedPool is initialized
      const result = await cachedPool?.query(sqlText, params || []);
      return { rows: result?.rows || [] };
    } catch (e) {
      console.error("Database Query Error:", e);
      // Re-throw or handle as appropriate for your application
      throw e;
    }
  },
};
