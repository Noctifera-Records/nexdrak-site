import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';

// For Cloudflare Workers compatibility, we use Neon's HTTP driver by default.
// For local Supabase PostgreSQL + Node, we fallback to pg (TCP) if necessary.

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL variable is not set.');
  }
  return connectionString;
}

const isSupabaseHost = (connectionString: string) => connectionString.includes('.supabase.co');
const isEdgeRuntime = () => process.env.NEXT_RUNTIME === 'edge' || process.env.VERCEL_ENV === 'production';

let cachedDb: ReturnType<typeof drizzleNeon> | null = null;
let cachedPgPool: any = null;

function getPgPool() {
  if (cachedPgPool) return cachedPgPool;
  
  if (process.env.NEXT_RUNTIME === 'edge' || typeof EdgeRuntime !== 'undefined') {
    return null;
  }

  try {
    const req = eval('require');
    const { Pool } = req('pg');
    cachedPgPool = new Pool({
      connectionString: getConnectionString(),
      ssl: { rejectUnauthorized: false },
    });
    return cachedPgPool;
  } catch (error) {
    return null;
  }
}

export function getDb(): ReturnType<typeof drizzleNeon> {
  if (cachedDb) return cachedDb as ReturnType<typeof drizzleNeon>;

  const connectionString = getConnectionString();

  if (isSupabaseHost(connectionString) && !isEdgeRuntime()) {
    try {
      const pool = getPgPool();
      if (pool) {
        const req = eval('require');
        const { drizzle } = req('drizzle-orm/node-postgres');
        cachedDb = drizzle(pool);
        return cachedDb as ReturnType<typeof drizzleNeon>;
      }
    } catch (error) {
      // Fallback to Neon HTTP
    }
  }

  const sql = neon(connectionString);
  cachedDb = drizzleNeon(sql);
  return cachedDb as ReturnType<typeof drizzleNeon>;
}

// Legacy compatibility
export const db = {
  query: async (sqlText: string, params?: unknown[]) => {
    const connectionString = getConnectionString();
    const sql = neon(connectionString, { fullResults: true });
    const result = await sql.query(sqlText, params || []);
    return { rows: (result.rows as any[]) || [] };
  },
};
