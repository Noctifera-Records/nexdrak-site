"use client";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";
import OptimizedImage from "@/components/optimized-image";
import { useState, useEffect } from "react";
import Image from "next/image";
import { SiteSettings } from "@/lib/site-settings";

export default function HeroSection({ settings }: { settings: SiteSettings }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden" suppressHydrationWarning>
      {/* Background Image - Priority for LCP */}
      <div className="absolute inset-0 z-0">
        <Image
          src={settings.hero_background_image}
          alt="Hero Background"
          fill
          priority
          className="object-cover transition-all duration-500"
          sizes="100vw"
        />
        {/* Filtro invertido en modo claro para imágenes oscuras */}
        <div className="absolute inset-0 backdrop-filter dark:backdrop-filter-none invert dark:invert-0 transition-all duration-500" />
      </div>

      {/* Overlay: Oscuro en dark mode, Claro en light mode */}
      <div className="absolute inset-0 bg-white/30 dark:bg-black/60 z-0 transition-colors duration-500" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <div className="mb-8">
          {/* Desktop Logo */}
          <div 
            className={`hidden md:block transition-all duration-1000 ease-out transform ${
              mounted 
                ? 'opacity-100 translate-y-0 scale-100 blur-0' 
                : 'opacity-0 translate-y-12 scale-50 blur-sm'
            }`}
          >
            <OptimizedImage
              src={settings.site_logo}
              alt="Site Logo"
              width={400}
              height={400}
              className="w-auto h-40 mb-8 mx-auto object-contain invert dark:invert-0 transition-all duration-500"
              priority
            />
          </div>

          {/* Mobile Logo */}
          <div 
            className={`block md:hidden transition-all duration-1000 ease-out transform ${
              mounted 
                ? 'opacity-100 translate-y-0 scale-100 blur-0' 
                : 'opacity-0 translate-y-12 scale-50 blur-sm'
            }`}
          >
            <OptimizedImage
              src={settings.site_logo_mobile}
              alt="Site Logo Mobile"
              width={300}
              height={300}
              className="w-auto h-32 mb-6 mx-auto object-contain invert dark:invert-0 transition-all duration-500"
              priority
            />
          </div>

          <h2 
            className={`text-xl md:text-2xl font-light tracking-[0.2em] text-foreground dark:text-gray-300 mb-2 transition-all duration-1000 delay-300 ease-out transform ${
              mounted 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            {settings.hero_release_text}
          </h2>
          <div 
            className={`flex justify-center gap-4 mt-6 transition-all duration-1000 delay-500 ease-out transform ${
              mounted 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <Link
              href={settings.hero_album_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 dark:bg-white dark:text-black dark:hover:bg-gray-200 min-w-[160px] text-lg tracking-wider transition-colors"
              >
                <Play className="mr-2 h-5 w-5" fill="currentColor" />
                LISTEN NOW
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground/30 dark:border-white/30 rounded-full flex justify-center pt-2 transition-colors">
          <div className="w-1 h-2 bg-foreground dark:bg-white rounded-full animate-scroll transition-colors" />
        </div>
      </div>
    </div>
  );
}
