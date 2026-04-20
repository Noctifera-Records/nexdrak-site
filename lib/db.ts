import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

// Configuración global para Cloudflare Workers
if (typeof window === 'undefined') {
  // CRITICAL: Esto arregla el error "SASL: SCRAM-SERVER-FINAL-MESSAGE"
  neonConfig.pipelineTLS = false;
}

function getConnectionString() {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return "postgresql://placeholder:placeholder@localhost:5432/placeholder";
  }
  
  // Forzamos puerto 5432 y sslmode para máxima compatibilidad con el driver de WebSockets
  if (connectionString.includes(':6543')) {
    connectionString = connectionString.replace(':6543', ':5432');
  }
  if (!connectionString.includes('sslmode')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    connectionString += `${separator}sslmode=require`;
  }
  
  return connectionString;
}

// Singleton para evitar múltiples conexiones en el Edge
let cachedDb: any = null;

export function getDb() {
  if (cachedDb) return cachedDb;

  try {
    const connectionString = getConnectionString();
    const pool = new Pool({ 
      connectionString,
      max: 1, // Mantener 1 conexión para no exceder CPU
      connectionTimeoutMillis: 15000,
    });
    
    cachedDb = drizzle(pool);
    return cachedDb;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

export const db = {
  query: async (sqlText: string, params?: unknown[]) => {
    const dbInstance = getDb();
    try {
      // Usamos el cliente interno del pool para consultas directas si es necesario
      // Pero para Better Auth, getDb() es lo principal
      const result = await (dbInstance as any).session.client.query(sqlText, params || []);
      return { rows: result.rows || [] };
    } catch (e) {
      console.error("Database Query Error:", e);
      throw e;
    }
  },
};
