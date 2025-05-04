"use client"; // 🔥 Esta línea es obligatoria en componentes que usan hooks

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays, ShoppingBag, Music, Play, ArrowDown } from "lucide-react";
import LatestReleases from "@/components/latest-releases";
import UpcomingEvents from "@/components/upcoming-events";
import Newsletter from "@/components/newsletter";
import SocialLinks from "@/components/social-links";
import { useState, useEffect } from "react";

export default function Home() {
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    // Parsear cookies con tipado explícito
    const cookies: Record<string, string> = document.cookie
      .split("; ")
      .reduce((acc: Record<string, string>, cookie) => {
        const [key, value] = cookie.split("=").map(decodeURIComponent);
        acc[key] = value;
        return acc;
      }, {});

    // Verificar si la cookie existe
    if (!cookies.cookieConsentDismissed) {
      setShowCookieBanner(true);
    }
  }, []);

  const handleCloseBanner = () => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 3);
    
    document.cookie = `cookieConsentDismissed=true; expires=${expirationDate.toUTCString()}; path=/`;
    setShowCookieBanner(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Banner de Cookies */}
      {showCookieBanner && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/90 border border-green-500/30 rounded-lg p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom flex items-center gap-4 max-w-md w-full md:hidden">
          <p className="text-sm text-gray-300 flex-1">
            We use cookies to improve your website experience. By continuing to browse the site, you agree to our use of cookies.
          </p>
          <button 
            onClick={handleCloseBanner}
            className="text-green-400 hover:text-green-300 transition-colors p-1 rounded-full hover:bg-green-500/10"
            aria-label="Close cookies banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      {/* Hero Section with New Single */}
      <div className="h-screen flex flex-col items-center justify-center text-center px-4 relative">
        <div className="max-w-4xl mx-auto space-y-8 z-10">
          <div className="hidden md:block select-none pointer-events-none">
            <img
              src="/img/logo.png"
              alt="NexDrak Logo"
              className="w-full h-auto max-w-3xl mx-auto"
              draggable="false"
            />
          </div>
          <div className="md:hidden select-none pointer-events-none">
            <img
              src="/img/logo.png"
              alt="NexDrak Logo Mobile"
              className="w-full h-auto max-w-md mx-auto"
              draggable="false"
            />
          </div>
          <div className="flex items-center justify-center select-none pointer-events-none">
            <img
              src="/img/red.png"
              alt="Red Eye Flight"
              className="h-12 w-12 mr-4"
              draggable="false"
            />
            <p className="text-3xl md:text-3xl font-display font-bold">&nbsp;RED EYE FLIGHT [OUT NOW]</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="https://open.spotify.com/track/3bwbsBeKcSTxjSC03MtHtR" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black rounded-md px-8">
                <Play className="h-5 w-5 mr-2" />
                LISTEN NOW
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center animate-bounce">
          <ArrowDown className="h-10 w-10 text-green-500" />
        </div>
      </div>

      {/* Content Below Red Line */}
      <div className="bg-black">
        {/* Latest Releases */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center">LATEST RELEASES</h2>
            <LatestReleases />
          </div>
        </section>

        {/* Upcoming Events Preview */}
        <section className="py-20 bg-black/50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center">UPCOMING EVENTS</h2>
            <UpcomingEvents limit={3} />
            <div className="flex justify-center mt-12">
              <Button
                asChild
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-500/20 rounded-md px-8"
              >
                <Link href="/events">VIEW ALL EVENTS</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Content */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center">EXPLORE</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link href="/events" className="group">
                <div className="bg-black/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 flex flex-col items-center text-center hover:bg-green-900/20 transition-all h-full">
                  <CalendarDays className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">TOUR DATES</h3>
                  <p className="text-gray-400">Catch PULSE live at venues around the world</p>
                </div>
              </Link>

              <Link href="/merch" className="group">
                <div className="bg-black/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 flex flex-col items-center text-center hover:bg-green-900/20 transition-all h-full">
                  <ShoppingBag className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">MERCH STORE</h3>
                  <p className="text-gray-400">Official merchandise and limited edition items</p>
                </div>
              </Link>

              <Link href="/music" className="group">
                <div className="bg-black/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 flex flex-col items-center text-center hover:bg-green-900/20 transition-all h-full">
                  <Music className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">DISCOGRAPHY</h3>
                  <p className="text-gray-400">Stream and download the complete collection</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="py-20 bg-black/50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center">CONNECT</h2>
            <SocialLinks />
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Newsletter />
          </div>
        </section>
      </div>
    </div>
  );
}