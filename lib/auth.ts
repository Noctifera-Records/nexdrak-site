import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as authSchema from "./db/auth.schema";
import { resetPasswordTemplate, verifyEmailTemplate } from "./email-templates";

const fromEmail = process.env.EMAIL_FROM || "noreply@nexdrak.com";

/**
 * Origins allowed to talk to the auth endpoints.
 *
 * Both the public site and the admin panel share the same database and the same
 * `user` / `session` tables, so the public site must accept requests coming from
 * the admin domain (and vice versa) as well as localhost during development.
 * Without this list Better Auth rejects mismatching Origin headers, which shows
 * up as random failed sign-in / sign-out attempts.
 */
const trustedOrigins = [
  "https://nexdrak.com",
  "https://www.nexdrak.com",
  "https://admin.nexdrak.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

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
    trustedOrigins,
    /**
     * The `admin` plugin is required to expose `user.role` in the session.
     * The `user` table (shared with admin-nexdrak-site) already stores
     * role/banned/ban_reason/ban_expires, but without this plugin the public
     * site never receives `role`, so admins were not recognized and the
     * "Admin Dashboard" entry never appeared in the navbar.
     */
    plugins: [admin()],
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
