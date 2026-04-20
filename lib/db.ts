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

  // CRITICAL: When using @neondatabase/serverless (WebSockets) in Cloudflare,
  // we MUST use port 5432. Port 6543 is for TCP pooling and causes SASL errors
  // when wrapped in WebSockets.
  if (connectionString.includes(':6543')) {
    connectionString = connectionString.replace(':6543', ':5432');
  }

  // Ensure sslmode is set for secure handshake
  if (!connectionString.includes('sslmode')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    connectionString += `${separator}sslmode=require`;
  }

  return connectionString;
}

let cachedDb: any = null;
let cachedPool: Pool | null = null;

export function getDb() {
  if (cachedDb) return cachedDb;

  const connectionString = getConnectionString();

  try {
    // For Cloudflare Workers, a single-connection pool is most CPU-efficient
    cachedPool = new Pool({
      connectionString,
      connectionTimeoutMillis: 15000, 
      max: 1, 
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
