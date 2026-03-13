import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';

// For Cloudflare Workers compatibility, we use Neon's HTTP driver by default.
// For local Supabase PostgreSQL + Node, we fallback to pg (TCP) if necessary.

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set. Please configure it with your PostgreSQL connection string.');
  }

  try {
    const url = new URL(connectionString);
    if (!url.hostname) {
      throw new Error('DATABASE_URL has no host.');
    }
  } catch (error) {
    throw new Error(`DATABASE_URL is invalid: ${error instanceof Error ? error.message : String(error)}`);
  }

  return connectionString;
}

const isSupabaseHost = (connectionString: string) => connectionString.includes('.supabase.co');
const isEdgeRuntime = () => process.env.NEXT_RUNTIME === 'edge' || process.env.VERCEL_ENV === 'production';

let cachedDb: ReturnType<typeof drizzleNeon> | null = null;
let cachedPgPool: any = null;

function getPgPool() {
  if (cachedPgPool) return cachedPgPool;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool } = require('pg');
    cachedPgPool = new Pool({
      connectionString: getConnectionString(),
      ssl: { rejectUnauthorized: false },
    });
    return cachedPgPool;
  } catch (error) {
    console.error('pg Pool initialization failed', error);
    throw error;
  }
}

async function queryWithFallback(sqlText: string, params?: unknown[]) {
  const connectionString = getConnectionString();

  try {
    const sql = neon(connectionString, { fullResults: true });
    const result = await sql.query(sqlText, params || []);
    return { rows: (result.rows as any[]) || [] };
  } catch (error) {
    if (isSupabaseHost(connectionString) && !isEdgeRuntime()) {
      try {
        const pool = getPgPool();
        const result = await pool.query(sqlText, params || []);
        return { rows: result.rows || [] };
      } catch (pgError) {
        console.error('PG fallback query failed', pgError);
        throw pgError;
      }
    }

    console.error('Database query error:', error);
    throw error;
  }
}

async function ensureTableCamelCaseColumns(tableName: string, mapping: Record<string, string>) {
  const columns = await queryWithFallback(`SELECT column_name FROM information_schema.columns WHERE table_name='${tableName}'`);
  const columnNames = (columns.rows as Array<{ column_name: string }>).map((row) => row.column_name);

  for (const [legacy, snake] of Object.entries(mapping)) {
    if (columnNames.includes(legacy) && !columnNames.includes(snake)) {
      await queryWithFallback(`ALTER TABLE "${tableName}" RENAME COLUMN "${legacy}" TO "${snake}"`);
    }
  }
}

async function ensureVerificationSchema() {
  try {
    const tableExists = await queryWithFallback("SELECT to_regclass('public.verification') as exists");
    if (!tableExists.rows?.[0]?.exists) {
      console.warn('verification table does not exist yet, skipping verification schema enforcement');
      return;
    }

    await ensureTableCamelCaseColumns('verification', {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });

    await queryWithFallback(`ALTER TABLE verification ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;`);
    await queryWithFallback(`ALTER TABLE verification ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;`);
    await queryWithFallback(`ALTER TABLE verification ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;`);

    await ensureTableCamelCaseColumns('user', {
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      banReason: 'ban_reason',
      banExpires: 'ban_expires',
      twoFactorEnabled: 'two_factor_enabled',
    });

    await ensureTableCamelCaseColumns('session', {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      userId: 'user_id',
      impersonatedBy: 'impersonated_by',
    });

    // Ensure the new Better Auth column exists for impersonation feature
    await queryWithFallback(`ALTER TABLE session ADD COLUMN IF NOT EXISTS impersonated_by text`);

    await ensureTableCamelCaseColumns('account', {
      accountId: 'account_id',
      providerId: 'provider_id',
      userId: 'user_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });

    await ensureTableCamelCaseColumns('two_factor', {
      backupCodes: 'backup_codes',
      userId: 'user_id',
    });
  } catch (error) {
    console.warn('Could not enforce verification schema automatically:', error);
  }
}

export function getDb(): ReturnType<typeof drizzleNeon> {
  if (cachedDb) return cachedDb as ReturnType<typeof drizzleNeon>;

  const connectionString = getConnectionString();

  if (isSupabaseHost(connectionString) && !isEdgeRuntime()) {
    try {
      const pool = getPgPool();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { drizzle } = require('drizzle-orm/node-postgres');
      cachedDb = drizzle(pool);
      ensureVerificationSchema().catch((err) => console.warn('ensureVerificationSchema failed', err));
      return cachedDb as ReturnType<typeof drizzleNeon>;
    } catch (error) {
      console.warn('Supabase pg fallback failed, using Neon HTTP in fallback mode', error);
    }
  }

  const sql = neon(connectionString);
  cachedDb = drizzleNeon(sql);
  ensureVerificationSchema().catch((err) => console.warn('ensureVerificationSchema failed', err));
  return cachedDb as ReturnType<typeof drizzleNeon>;
}

// Legacy compatibility for existing code that uses db.query(sql, params)
type DbQueryResult<Row = any> = { rows: Row[] };
type DbLike = { query: (sql: string, params?: unknown[]) => Promise<DbQueryResult> };

export const db: DbLike = {
  query: (sqlText: string, params?: unknown[]) => queryWithFallback(sqlText, params),
};
