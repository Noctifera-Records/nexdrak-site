import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db";
import { schema as authSchema } from "./db/schema";
import { resetPasswordTemplate, verifyEmailTemplate } from "./email-templates";

const fromEmail = process.env.EMAIL_FROM || "noreply@nexdrak.com";

async function sendResendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend API error:", error);
    }
  } catch (e) {
    console.error("Failed to send email via Resend API", e);
  }
}

export const auth = (() => {
  try {
    const db = getDb();
    
    // Parse and clean BETTER_AUTH_URL
    let baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
    
    // Default to localhost in dev, production otherwise
    // CRITICAL: On Cloudflare, ensure we use the production URL if not explicitly set
    if (!baseURL || (baseURL.includes("localhost") && process.env.NODE_ENV === "production")) {
      baseURL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://nexdrak.com";
    }
    
    // If multiple URLs are provided (common mistake), take the production one
    if (baseURL.includes(" ")) {
      baseURL = baseURL.split(" ").find(u => u.includes("nexdrak.com")) || baseURL.split(" ")[0];
    }

    const secret = process.env.BETTER_AUTH_SECRET || "development-secret-key-min-32-chars-long-placeholder";

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!googleClientId || !googleClientSecret) {
      console.warn("Better Auth: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Google login will fail.");
    }

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
          await sendResendEmail({
            to: data.user.email,
            subject: "Reset your password",
            html: resetPasswordTemplate(data.url),
          });
        },
      },
      emailVerification: {
        async sendVerificationEmail(data) {
          await sendResendEmail({
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
    // Return a dummy handler that returns 500 with the error message for debugging
    return {
      api: { getSession: async () => null },
      handler: async () => new Response(`Auth Error: ${error instanceof Error ? error.message : 'Unknown'}`, { status: 500 }),
    } as any;
  }
})();
