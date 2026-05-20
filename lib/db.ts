import { Client, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

if (typeof window === 'undefined') {
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = "password";
}

function getConnectionString() {
  let connectionString = process.env.DATABASE_URL || "";
  if (connectionString.includes(':6543')) {
    connectionString = connectionString.replace(':6543', ':5432');
  }
  if (!connectionString.includes('sslmode')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    connectionString += `${separator}sslmode=require`;
  }
  return connectionString;
}

// Eliminamos cache() de React para evitar errores en entornos no-React (Edge Runtime)
export async function getRequestContextDb() {
  // En Cloudflare Workers, crear un Client es muy ligero
  const client = new Client(getConnectionString());
  await client.connect();
  return {
    db: drizzle(client),
    client
  };
}

// Helper para compatibilidad
export const getDb = async () => {
  const { db } = await getRequestContextDb();
  return db;
};
