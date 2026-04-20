import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

// Configuración global
if (typeof window === 'undefined') {
  neonConfig.pipelineTLS = false;
}

function getConnectionString() {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return "postgresql://placeholder:placeholder@localhost:5432/placeholder";
  }
  
  // Forzamos puerto 5432 para WebSockets directos
  if (connectionString.includes(':6543')) {
    connectionString = connectionString.replace(':6543', ':5432');
  }
  if (!connectionString.includes('sslmode')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    connectionString += `${separator}sslmode=require`;
  }
  
  return connectionString;
}

// ELIMINAMOS cachedDb PARA EVITAR ERRORES DE I/O CONTEXT

export function getDb() {
  const connectionString = getConnectionString();
  
  // Creamos el pool directamente. Cloudflare manejará la limpieza al terminar la petición.
  const pool = new Pool({ 
    connectionString,
    max: 1, 
    connectionTimeoutMillis: 10000,
  });
  
  return drizzle(pool);
}

export const db = {
  query: async (sqlText: string, params?: unknown[]) => {
    const connectionString = getConnectionString();
    const pool = new Pool({ connectionString, max: 1 });
    try {
      const result = await pool.query(sqlText, params || []);
      return { rows: result.rows || [] };
    } finally {
      // Importante: En el helper manual cerramos el pool inmediatamente
      await pool.end();
    }
  },
};
