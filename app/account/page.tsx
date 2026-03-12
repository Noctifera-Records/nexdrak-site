import { redirect } from "next/navigation";

export default function AccountRedirectPage() {
  if (typeof window === "undefined") {
    redirect("https://admin.nexdrak.com/account");
  }
  if (typeof window !== "undefined") {
    window.location.href = "https://admin.nexdrak.com/account";
  }
  return null;
}
