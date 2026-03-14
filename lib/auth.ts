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
    
    // Parse and clean BETTER_AUTH_URL
    let baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://nexdrak.com";
    // If multiple URLs are provided (common mistake), take the production one
    if (baseURL.includes(" ")) {
      baseURL = baseURL.split(" ").find(u => u.includes("nexdrak.com")) || baseURL.split(" ")[0];
    }

    const secret = process.env.BETTER_AUTH_SECRET || "development-secret-key-min-32-chars-long-placeholder";

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
          try {
            await resend.emails.send({
              from: fromEmail,
              to: data.user.email,
              subject: "Reset your password",
              html: resetPasswordTemplate(data.url),
            });
          } catch (e) {
            console.error("Failed to send reset email", e);
          }
        },
      },
      emailVerification: {
        async sendVerificationEmail(data) {
          try {
            await resend.emails.send({
              from: fromEmail,
              to: data.user.email,
              subject: "Verify your email address",
              html: verifyEmailTemplate(data.url),
            });
          } catch (e) {
            console.error("Failed to send verification email", e);
          }
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
    // Return a dummy handler that returns 500 with the error message for debugging
    return {
      api: { getSession: async () => null },
      handler: async () => new Response(`Auth Error: ${error instanceof Error ? error.message : 'Unknown'}`, { status: 500 }),
    } as any;
  }
})();
