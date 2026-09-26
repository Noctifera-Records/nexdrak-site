import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

/**
 * The auth endpoints always live on the same origin as the page, but the build
 * can bake `NEXT_PUBLIC_BETTER_AUTH_URL` into the bundle. If that value points
 * somewhere else (for example a localhost URL captured during a local build)
 * the browser would call the wrong host and every auth request would fail, so
 * the runtime origin wins whenever it is available.
 */
function resolveBaseURL(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

  if (typeof window === "undefined") {
    return configured || "https://nexdrak.com";
  }

  const origin = window.location.origin;
  if (configured && !configured.includes("localhost") && !configured.includes("127.0.0.1")) {
    return configured;
  }

  return origin;
}

export const authClient = createAuthClient({
    baseURL: resolveBaseURL(),
    /**
     * Needed to read `session.user.role` (the navbar decides whether to show
     * the "Admin Dashboard" link with it).
     */
    plugins: [
      adminClient(),
    ],
});
