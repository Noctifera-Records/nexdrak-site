import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return "postgresql://placeholder:placeholder@localhost:5432/placeholder";
  }
  return connectionString;
}

const isEdgeRuntime = () => process.env.NEXT_RUNTIME === 'edge' || process.env.VERCEL_ENV === 'production';

let cachedDb: any = null;
let cachedPool: Pool | null = null;

export function getDb() {
  if (cachedDb) return cachedDb;

  const connectionString = getConnectionString();

  // For Supabase on Cloudflare/Edge, we use pg Pool with nodejs_compat
  // This is the most reliable way to connect to Supabase from Cloudflare Pages
  try {
    if (!cachedPool) {
      cachedPool = new Pool({
        connectionString,
        // Cloudflare requires SSL for external connections
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
        // Optimal settings for serverless
        max: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }
    cachedDb = drizzle(cachedPool);
    return cachedDb;
  } catch (error) {
    console.error("Database connection failed, falling back to Neon HTTP:", error);
    // Fallback only if necessary, though neon won't work with supabase URLs
    const sql = neon(connectionString);
    cachedDb = drizzleNeon(sql);
    return cachedDb;
  }
}

export const db = {
  query: async (sqlText: string, params?: unknown[]) => {
    try {
      const dbInstance = getDb();
      // Detect if it's drizzle-orm/node-postgres or drizzle-orm/neon-http
      if (dbInstance.session && 'execute' in dbInstance.session) {
        // Standard Drizzle execute
        const result = await cachedPool?.query(sqlText, params || []);
        return { rows: result?.rows || [] };
      } else {
        // Neon Fallback
        const sql = neon(getConnectionString());
        const result = await sql.query(sqlText, params || []);
        return { rows: result.rows || [] };
      }
    } catch (e) {
      console.error("Database Query Error:", e);
      return { rows: [] };
    }
  },
};
