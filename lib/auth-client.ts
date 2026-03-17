import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // Important: Client needs the same baseURL as the server
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || (typeof window !== 'undefined' ? window.location.origin : "https://nexdrak.com"),
    plugins: [
    ],
});
