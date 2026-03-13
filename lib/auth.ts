import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { getDb } from "./db";
import { schema as authSchema } from "./db/schema";
import { resetPasswordTemplate, verifyEmailTemplate } from "./email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || "noreply@nexdrak.com";

export const auth = (() => {
  try {
    const db = getDb();
    
    // Better Auth requires a secret in production. 
    // If BETTER_AUTH_SECRET is missing, we use a fallback only to prevent crash, 
    // but production SHOULD have it set in Cloudflare dashboard.
    const secret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "development-secret-key-min-32-chars-long-placeholder";
    const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://nexdrak.com";

    return betterAuth({
      database: drizzleAdapter(db, {
        provider: "pg",
        schema: authSchema,
      }),
      baseURL,
      secret,
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        async sendResetPassword(data) {
          await resend.emails.send({
            from: fromEmail,
            to: data.user.email,
            subject: "Reset your password",
            html: resetPasswordTemplate(data.url),
          });
        },
      },
      emailVerification: {
        async sendVerificationEmail(data) {
          await resend.emails.send({
            from: fromEmail,
            to: data.user.email,
            subject: "Verify your email address",
            html: verifyEmailTemplate(data.url),
          });
        },
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID || "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
      },
      rateLimit: {
        enabled: false,
      },
      plugins: [
      ],
    });
  } catch (error) {
    console.error("CRITICAL: Better Auth initialization failed:", error);
    return {
      api: { getSession: async () => null },
      handler: async () => new Response("Auth Configuration Error", { status: 500 }),
    } as any;
  }
})();
