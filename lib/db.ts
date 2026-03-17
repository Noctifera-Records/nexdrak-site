import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

// Configure Neon to use WebSockets correctly in serverless environments
if (typeof window === 'undefined') {
  // Cloudflare Workers provide a global WebSocket constructor
  // If it's not available (e.g. in some local Node environments), we can use undici
  if (!globalThis.WebSocket) {
    // Dynamic import to avoid bundling undici if not needed
    import('undici').then(ws => {
      neonConfig.webSocketConstructor = ws.WebSocket;
    });
  }
}

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return "postgresql://placeholder:placeholder@localhost:5432/placeholder";
  }
  return connectionString;
}

let cachedDb: any = null;
let cachedPool: Pool | null = null;

export function getDb() {
  if (cachedDb) return cachedDb;

  const connectionString = getConnectionString();

  try {
    if (!cachedPool) {
      cachedPool = new Pool({
        connectionString,
        // Optimal settings for serverless
        max: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }
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
