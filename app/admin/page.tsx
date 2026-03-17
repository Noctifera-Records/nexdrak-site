"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminRedirectPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending) {
      if (session?.user?.role === "admin") {
        window.location.href = "https://admin.nexdrak.com";
      } else {
        router.push("/");
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
