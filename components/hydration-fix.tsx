"use client";

import { useEffect, useState } from "react";

/**
 * Helper component to delay rendering of children until client-side hydration is complete.
 * This prevents React Hydration Mismatch errors (#418, #423, etc.)
 */
export function HydrationFix({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return null or a non-interactive version during SSR
    return null;
  }

  return <>{children}</>;
}
