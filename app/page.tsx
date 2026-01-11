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
import dynamic from "next/dynamic";
import { createPublicClient } from "@/lib/supabase/server";

import LatestReleases from "@/components/latest-releases";
import UpcomingEvents from "@/components/upcoming-events";
const Newsletter = dynamic(() => import("@/components/newsletter"));
const SocialLinks = dynamic(() => import("@/components/social-links"));
import CookieBanner from "@/components/cookie-banner";

interface SiteSettings {
  hero_album_link: string;
  hero_background_image: string;
  hero_release_image: string;
  hero_release_text: string;
  site_logo: string;
  site_logo_mobile: string;
  navbar_logo: string;
  site_title: string;
  site_description: string;
  contact_email: string;
  booking_email: string;
}

const defaultSettings: SiteSettings = {
  hero_album_link: "https://album.link/thequietone",
  hero_background_image: "/placeholder.png",
  hero_release_image: "/red.png",
  hero_release_text: "NEW RELEASE",
  site_logo: "/placeholder.png",
  site_logo_mobile: "/placeholder.png",
  navbar_logo: "/nav-logo.webp",
  site_title: "NexDrak",
  site_description: "Official website of NexDrak - Electronic Music Artist",
  contact_email: "contact@nexdrak.com",
  booking_email: "mgmt@nexdrak.com",
};

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const supabase = createPublicClient();
  
  // Parallel fetch for better performance
  const [settingsResult, songsResult, eventsResult] = await Promise.all([
    supabase
      .from("site_settings")
      .select("key, value"),
    supabase
      .from('songs')
      .select('id, title, artist, stream_url, cover_image_url, type, album_name, track_number, release_date, created_at')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from("events")
      .select("id, title, date, location, ticket_url, created_at")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(3)
  ]);

  // Process settings
  let settings = { ...defaultSettings };
  if (!settingsResult.error && settingsResult.data) {
    const settingsMap: Partial<SiteSettings> = {};
    settingsResult.data.forEach((item) => {
      if (item.key in defaultSettings) {
        (settingsMap as any)[item.key] =
          item.value || (defaultSettings as any)[item.key];
      }
    });
    settings = { ...defaultSettings, ...settingsMap };
  }

  // Process data
  const latestSongs = songsResult.data || [];
  const upcomingEvents = eventsResult.data || [];

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero section with logo fix */}
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
            {settings.site_logo.startsWith('data:') ? (
              <img
                src={settings.site_logo}
                alt={`${settings.site_title} Logo - Electronic Music Artist`}
                width={800}
                height={400}
                className="w-full h-auto max-w-3xl mx-auto"
                draggable={false}
                decoding="async"
              />
            ) : (
              <OptimizedImage
                src={settings.site_logo}
                alt={`${settings.site_title} Logo - Electronic Music Artist`}
                width={800}
                height={400}
                className="w-full h-auto max-w-3xl mx-auto"
                priority={true}
                draggable={false}
              />
            )}
          </div>
          <div className="md:hidden select-none pointer-events-none">
            {settings.site_logo_mobile.startsWith('data:') ? (
              <img
                src={settings.site_logo_mobile}
                alt={`${settings.site_title} Logo Mobile - Electronic Music Artist`}
                width={400}
                height={200}
                className="w-full h-auto max-w-md mx-auto"
                draggable={false}
                decoding="async"
              />
            ) : (
              <OptimizedImage
                src={settings.site_logo_mobile}
                alt={`${settings.site_title} Logo Mobile - Electronic Music Artist`}
                width={400}
                height={200}
                className="w-full h-auto max-w-md mx-auto"
                priority={true}
                draggable={false}
              />
            )}
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
            <LatestReleases initialSongs={latestSongs} />
          </div>
        </section>

        {/* Upcoming Events Preview */}
        <section className="py-20 bg-black/50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center">
              UPCOMING EVENTS
            </h2>
            <UpcomingEvents limit={3} initialEvents={upcomingEvents} />
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
