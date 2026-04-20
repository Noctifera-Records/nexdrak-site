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
  const client = new Client(getConnectionString());
  await client.connect();
  return {
    db: drizzle(client),
    client
  };
}
