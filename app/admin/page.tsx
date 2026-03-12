import { redirect } from "next/navigation";

export default function AdminRedirectPage() {
  if (typeof window === "undefined") {
    // Server-side redirect
    redirect("https://admin.nexdrak.com");
  }
  // Client-side fallback
  if (typeof window !== "undefined") {
    window.location.href = "https://admin.nexdrak.com";
  }
  return null;
}
