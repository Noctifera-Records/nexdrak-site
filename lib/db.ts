import { Client, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { cache } from 'react';

if (typeof window === 'undefined') {
  neonConfig.pipelineTLS = false;
  // Acelera la conexión enviando la contraseña inmediatamente
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

// Esta función se asegura de que solo haya una conexión por petición HTTP
export const getRequestContextDb = cache(async () => {
  const client = new Client(getConnectionString());
  await client.connect();
  return {
    db: drizzle(client),
    client
  };
});

// Helper para compatibilidad
export const getDb = async () => {
  const { db } = await getRequestContextDb();
  return db;
};
