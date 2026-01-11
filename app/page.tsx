import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamicImport from "next/dynamic";
import {
  CalendarDays,
  ShoppingBag,
  Music,
} from "lucide-react";

import LatestReleases from "@/components/latest-releases";
import UpcomingEvents from "@/components/upcoming-events";
import HeroSection from "@/components/hero-section";

const Newsletter = dynamicImport(() => import("@/components/newsletter"));
const SocialLinks = dynamicImport(() => import("@/components/social-links"));
import CookieBanner from "@/components/cookie-banner";

export const dynamic = 'force-static';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero section with logo fix */}
      <CookieBanner />

      {/* Hero Section with New Single */}
      <HeroSection />

      {/* Content Below Red Line */}
      <div className="bg-black">
        {/* Latest Releases Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 tracking-wider">
              LATEST RELEASES
            </h2>
            <LatestReleases />
            <div className="text-center mt-12">
              <Link href="/music">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-black tracking-widest"
                >
                  VIEW ALL MUSIC
                </Button>
              </Link>
            </div>
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
