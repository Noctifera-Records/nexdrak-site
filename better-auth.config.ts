/**
 * Better Auth CLI configuration file
 * Used to generate database schema for Better Auth tables
 * 
 * Run: npx @better-auth/cli@latest generate --config ./better-auth.config.ts --output ./lib/db/auth.schema.ts
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { schema as authSchema } from './lib/db/schema';

const { DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required for schema generation');
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  baseURL: BETTER_AUTH_URL || "https://nexdrak.com",
  secret: BETTER_AUTH_SECRET || "development-secret-key",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
    },
  },
  rateLimit: {
    enabled: false,
  },
  plugins: [
  ],
});
