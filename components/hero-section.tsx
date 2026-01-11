"use client";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";
import OptimizedImage from "@/components/optimized-image";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function HeroSection() {
  const { settings, loading } = useSiteSettings();

  return (
    <div
      className="h-screen flex flex-col items-center justify-center text-center px-4 relative"
      style={{
        backgroundImage: `url(${settings.hero_background_image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <div className="mb-8 animate-in fade-in zoom-in duration-1000">
          <OptimizedImage
            src={settings.hero_release_image}
            alt="New Release Cover"
            width={300}
            height={300}
            className="w-64 h-64 md:w-80 md:h-80 rounded-lg shadow-[0_0_50px_rgba(255,255,255,0.2)] mb-6 mx-auto"
            priority
          />
          <h2 className="text-xl md:text-2xl font-light tracking-[0.2em] text-gray-300 mb-2">
            {settings.hero_release_text}
          </h2>
          <div className="flex justify-center gap-4 mt-6">
            <Link
              href={settings.hero_album_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 min-w-[160px] text-lg tracking-wider"
              >
                <Play className="mr-2 h-5 w-5" fill="currentColor" />
                LISTEN NOW
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white rounded-full animate-scroll" />
        </div>
      </div>
    </div>
  );
}
