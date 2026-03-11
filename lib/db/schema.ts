/**
 * Combined Drizzle Schema
 * 
 * This file combines:
 * - Better Auth generated schema (auth.schema.ts)
 * - Custom application schemas
 * 
 * To regenerate Better Auth schema:
 * npx @better-auth/cli@latest generate --config ./better-auth.config.ts --output ./lib/db/auth.schema.ts
 */

import * as authSchema from "./auth.schema";

// Export all schemas for Drizzle migrations
export const schema = {
  ...authSchema,
  // Add your custom schemas here if needed
} as const;

// Re-export auth schema for convenience
export * from "./auth.schema";
