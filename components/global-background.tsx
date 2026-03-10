"use client";

import { useSiteSettings } from "@/hooks/use-site-settings";
import { usePathname } from "next/navigation";

export default function GlobalBackground() {
  const { settings } = useSiteSettings();
  const pathname = usePathname();

  // Don't show global background on home page (it has its own hero)
  // or admin pages (they have their own layout)
  if (pathname === "/" || pathname.startsWith("/admin")) {
    return null;
  }

  if (!settings.hero_background_image) {
    return (
      <div 
        className="fixed inset-0 -z-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:via-black dark:to-black opacity-100 dark:opacity-40 pointer-events-none transition-colors duration-500" 
        aria-hidden="true" 
      />
    );
  }

  return (
    <>
      {/* Background Image - Only visible in dark mode or with reduced opacity in light mode */}
      <div 
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat bg-fixed transition-all duration-1000 blur-sm opacity-20 dark:opacity-100"
        style={{
          backgroundImage: `url(${settings.hero_background_image})`,
        }}
        aria-hidden="true"
      />
      {/* Overlay with darkening for dark mode, lightening for light mode */}
      <div 
        className="fixed inset-0 -z-10 bg-white/80 dark:bg-black/70 transition-all duration-500"
        aria-hidden="true"
      />
    </>
  );
}