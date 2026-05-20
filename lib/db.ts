import { Client, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

if (typeof window === 'undefined') {
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = "password";
}

export function getConnectionString() {
  // Prioridad: Variable de entorno directa
  let connectionString = process.env.DATABASE_URL || "";
  
  if (!connectionString) {
    console.error("CRITICAL: DATABASE_URL is missing!");
    return "";
  }

  // Limpieza agresiva de la URL para evitar errores de formato
  connectionString = connectionString.trim().replace(/['"]/g, '');

  // Forzar puerto 5432 para Cloudflare + Supabase
  if (connectionString.includes(':6543')) {
    connectionString = connectionString.replace(':6543', ':5432');
  }

  // Asegurar sslmode=require
  if (!connectionString.includes('sslmode=')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    connectionString += `${separator}sslmode=require`;
  }
  
  return connectionString;
}

export async function getRequestContextDb() {
  const connectionString = getConnectionString();
  
  // Si no hay URL o estamos en build, devolvemos mock seguro
  if (!connectionString || process.env.NODE_ENV === 'test') {
     return {
       db: drizzle({} as any),
       client: { end: async () => {} } as any
     };
  }

  try {
    const client = new Client(connectionString);
    await client.connect();
    return {
      db: drizzle(client),
      client
    };
  } catch (error: any) {
    console.error("DB_CONNECTION_ERROR:", error.message);
    // Devolvemos un objeto que no rompa el tipado pero que falle elegantemente
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

export const getDb = async () => {
  const { db } = await getRequestContextDb();
  return db;
};
