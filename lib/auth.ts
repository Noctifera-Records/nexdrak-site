import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as authSchema from "./db/auth.schema";
import { resetPasswordTemplate, verifyEmailTemplate } from "./email-templates";

const fromEmail = process.env.EMAIL_FROM || "noreply@nexdrak.com";

async function sendResendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: fromEmail, to, subject, html }),
    });
  } catch (e) {
    console.error("Failed to send email", e);
  }
}

export const getAuth = (db: any) => {
  let baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  if (!baseURL || (baseURL.includes("localhost") && process.env.NODE_ENV === "production")) {
    baseURL = "https://nexdrak.com";
  }
  baseURL = baseURL.split(" ")[0].replace(/\/$/, "");

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: authSchema,
    }),
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET || "development-secret-key-placeholder",
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
      spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID || "placeholder",
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "placeholder",
      },
    },
    rateLimit: { enabled: false },
  });
};

// Objeto de compatibilidad para evitar errores de importación en otros archivos
export const auth = {
  api: {
    // Este es un hack temporal, deberías actualizar los otros archivos para usar getAuth(db)
    getSession: async () => null 
  }
} as any;
