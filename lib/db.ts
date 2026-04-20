import { Client, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

if (typeof window === 'undefined') {
  neonConfig.pipelineTLS = false;
}

export function getConnectionString() {
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

export async function createRequestContextDb() {
  const connectionString = getConnectionString();
  
  // Si estamos en fase de build (fase de construcción) y no hay URL real, devolvemos un objeto mock
  // para que el compilador de Next.js no se quede colgado.
  if (!process.env.DATABASE_URL || process.env.NEXT_PHASE === 'phase-production-build') {
     // Mock objects for the build phase
     return {
       db: drizzle({} as any),
       client: { end: async () => {} } as any
     };
  }

  const client = new Client(connectionString);
  await client.connect();
  return {
    db: drizzle(client),
    client
  };
}
