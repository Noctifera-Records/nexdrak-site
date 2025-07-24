"use client";

import Link from "next/link";
import OptimizedImage from "@/components/optimized-image";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ShoppingBag,
  Music,
  Play,
  ArrowDown,
} from "lucide-react";
import LatestReleases from "@/components/latest-releases";
import UpcomingEvents from "@/components/upcoming-events";
import Newsletter from "@/components/newsletter";
import SocialLinks from "@/components/social-links";
import CookieBanner from "@/components/cookie-banner";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function Home() {
  const { settings, loading } = useSiteSettings();

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Banner de Cookies */}
      <CookieBanner />

      {/* Hero Section with New Single */}
      <div
        className="h-screen flex flex-col items-center justify-center text-center px-4 relative"
        style={{
          backgroundImage: `url(${settings.hero_background_image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="max-w-4xl mx-auto space-y-8 z-10">
          <div className="hidden md:block select-none pointer-events-none">
            <OptimizedImage
              src={settings.site_logo}
              alt={`${settings.site_title} Logo - Electronic Music Artist`}
              width={800}
              height={400}
              className="w-full h-auto max-w-3xl mx-auto"
              priority={true}
              draggable={false}
            />
          </div>
          <div className="md:hidden select-none pointer-events-none">
            <OptimizedImage
              src={settings.site_logo_mobile}
              alt={`${settings.site_title} Logo Mobile - Electronic Music Artist`}
              width={400}
              height={200}
              className="w-full h-auto max-w-md mx-auto"
              priority={true}
              draggable={false}
            />
          </div>
          <div className="flex items-center justify-center select-none pointer-events-none">
            <OptimizedImage
              src={settings.hero_release_image}
              alt={settings.hero_release_text}
              width={48}
              height={48}
              className="h-12 w-12 mr-4 rounded"
              priority={true}
              draggable={false}
            />
            <p className="text-3xl md:text-3xl font-display font-bold">
              &nbsp;{settings.hero_release_text}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              href={settings.hero_album_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-white hover:bg-gray-200 text-black rounded-md px-8"
              >
                <Play className="h-5 w-5 mr-2" />
                LISTEN NOW
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center animate-bounce">
          <ArrowDown className="h-10 w-10 text-white" />
        </div>
      </div>

      {/* Content Below Red Line */}
      <div className="bg-black">
        {/* Latest Releases */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center">
              LATEST RELEASES
            </h2>
            <LatestReleases />
          </div>
        </section>

        {/* Upcoming Events Preview */}
        <section className="py-20 bg-black/50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center">
              UPCOMING EVENTS
            </h2>
            <UpcomingEvents limit={3} />
            <div className="flex justify-center mt-12">
              <Button
                asChild
                variant="outline"
                className="border-white text-white hover:bg-white/20 rounded-md px-8"
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
                <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-all h-full">
                  <CalendarDays className="h-12 w-12 text-white mb-4" />
                  <h3 className="text-xl font-bold mb-2">TOUR DATES</h3>
                  <p className="text-gray-400">
                    Catch NexDrak live at venues around the world
                  </p>
                </div>
              </Link>

              <Link href="/merch" className="group">
                <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-all h-full">
                  <ShoppingBag className="h-12 w-12 text-white mb-4" />
                  <h3 className="text-xl font-bold mb-2">MERCH STORE</h3>
                  <p className="text-gray-400">
                    Official merchandise and limited edition items
                  </p>
                </div>
              </Link>

              <Link href="/music" className="group">
                <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-all h-full">
                  <Music className="h-12 w-12 text-white mb-4" />
                  <h3 className="text-xl font-bold mb-2">DISCOGRAPHY</h3>
                  <p className="text-gray-400">
                    Stream and download the complete collection
                  </p>
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
