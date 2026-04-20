import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

function getConnectionString() {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return "postgresql://placeholder:placeholder@localhost:5432/placeholder";
  }
  
  // For HTTP driver, we want the standard port 5432 or the direct connection
  // Ensure sslmode is set
  if (!connectionString.includes('sslmode')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    connectionString += `${separator}sslmode=require`;
  }
  
  return connectionString;
}

// We use a simplified singleton for the HTTP client
let cachedDb: any = null;

export function getDb() {
  if (cachedDb) return cachedDb;

  const connectionString = getConnectionString();

  try {
    // The HTTP client is much more stable in Cloudflare Workers
    const sql = neon(connectionString);
    cachedDb = drizzle(sql);
    return cachedDb;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

export const db = {
  query: async (sqlText: string, params?: unknown[]) => {
    try {
      const connectionString = getConnectionString();
      const sql = neon(connectionString);
      const rows = await sql(sqlText, (params || []) as any);
      return { rows: rows || [] };
    } catch (e) {
      console.error("Database Query Error:", e);
      throw e;
    }
  },
};
