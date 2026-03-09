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
        className="fixed inset-0 -z-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-40 pointer-events-none" 
        aria-hidden="true" 
      />
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat bg-fixed transition-opacity duration-1000 blur-sm"
        style={{
          backgroundImage: `url(${settings.hero_background_image})`,
        }}
        aria-hidden="true"
      />
      {/* Overlay with darkening */}
      <div 
        className="fixed inset-0 -z-10 bg-black/70 transition-all duration-1000"
        aria-hidden="true"
      />
    </>
  );
}