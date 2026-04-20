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
    
    // CRITICAL: On Cloudflare, ensure we use the production URL if not explicitly set
    if (!baseURL || (baseURL.includes("localhost") && process.env.NODE_ENV === "production")) {
      baseURL = "https://nexdrak.com";
      console.log("Better Auth: Falling back to production baseURL:", baseURL);
    }
    
    // If multiple URLs are provided (common mistake), take the production one
    if (baseURL.includes(" ")) {
      baseURL = baseURL.split(" ").find(u => u.includes("nexdrak.com")) || baseURL.split(" ")[0];
    }

    const secret = process.env.BETTER_AUTH_SECRET || "development-secret-key-min-32-chars-long-placeholder";

    const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!spotifyClientId || !spotifyClientSecret) {
      console.warn("Better Auth: SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is missing. Spotify login will fail.");
    }

    const authInstance = betterAuth({
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
        spotify: {
          clientId: spotifyClientId || "placeholder",
          clientSecret: spotifyClientSecret || "placeholder",
        },
      },
      rateLimit: {
        enabled: false,
      },
      plugins: [
      ],
    });

    return authInstance;
  } catch (error) {
    console.error("CRITICAL: Better Auth initialization failed:", error);
    // Return a dummy handler that returns 500 with the error message for debugging
    // This object MUST match the expected interface enough to not throw TypeErrors
    return {
      api: { getSession: async () => null },
      handler: async (req: Request) => {
        console.error("Auth handler called but Better Auth failed to initialize", error);
        return new Response(JSON.stringify({ 
          error: "Auth Initialization Failed", 
          message: error instanceof Error ? error.message : 'Unknown' 
        }), { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      },
    } as any;
  }
})();
