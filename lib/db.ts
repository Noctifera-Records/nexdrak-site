import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// For Cloudflare Workers compatibility, we use Neon's HTTP driver
// This works with any Postgres database (including Supabase) via HTTP

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return connectionString;
}

export function getDb() {
  const sql = neon(getConnectionString());
  return drizzle(sql);
}

// Legacy compatibility for existing code that uses db.query(sql, params)
type DbQueryResult<Row = any> = { rows: Row[] };
type DbLike = { query: (sql: string, params?: unknown[]) => Promise<DbQueryResult> };

export const db: DbLike = {
  query: async (sqlText: string, params?: unknown[]) => {
    try {
      const sql = neon(getConnectionString(), { fullResults: true });
      // Use neon's .query() method for parameterized queries ($1, $2, etc.)
      const result = await sql.query(sqlText, params || []);
      return { rows: (result.rows as any[]) || [] };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
};
