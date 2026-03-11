import { Pool } from "pg";

const globalForDb = global as unknown as { db: Pool };

export const db = globalForDb.db || (process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  max: process.env.NODE_ENV === "production" ? 1 : 10, // Limit connections in serverless environment
  connectionTimeoutMillis: 5000,
}) : {
  query: async () => {
    console.warn("WARN: DATABASE_URL is not set. Returning empty result.");
    return { rows: [] };
  },
} as unknown as Pool);

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
