import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamicImport from "next/dynamic";
import {
  CalendarDays,
  ShoppingBag,
  Music,
} from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";

const LatestReleases = dynamicImport(() => import("@/components/latest-releases"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-gray-900 rounded-lg" />,
});
const UpcomingEvents = dynamicImport(() => import("@/components/upcoming-events"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-gray-900 rounded-lg" />,
});
import HeroSection from "@/components/hero-section";

const Newsletter = dynamicImport(() => import("@/components/newsletter"));
const SocialLinks = dynamicImport(() => import("@/components/social-links"));
import CookieBanner from "@/components/cookie-banner";

export const dynamic = 'force-static';

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero section with logo fix */}
      <CookieBanner />

      {/* Hero Section with New Single */}
      <HeroSection settings={settings} />

      {/* Content Below Red Line */}
      <div className="bg-background text-foreground transition-colors duration-300">
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
                  className="border-foreground text-foreground hover:bg-foreground hover:text-background tracking-widest transition-colors"
                >
                  VIEW ALL MUSIC
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Upcoming Events Preview */}
        <section className="py-20 bg-muted/30 dark:bg-black/50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center">
              UPCOMING EVENTS
            </h2>
            <UpcomingEvents limit={3} />
            <div className="flex justify-center mt-12">
              <Button
                asChild
                variant="outline"
                className="border-foreground text-foreground hover:bg-foreground/10 dark:hover:bg-white/20 rounded-md px-8 transition-colors"
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
                <div className="bg-card/50 dark:bg-black/50 backdrop-blur-sm border border-border dark:border-white/20 rounded-xl p-6 flex flex-col items-center text-center hover:bg-muted dark:hover:bg-white/10 transition-all h-full shadow-sm dark:shadow-none">
                  <CalendarDays className="h-12 w-12 text-foreground dark:text-white mb-4" />
                  <h3 className="text-xl font-bold mb-2">TOUR DATES</h3>
                  <p className="text-muted-foreground dark:text-gray-400">
                    Catch NexDrak live at venues around the world
                  </p>
                </div>
              </Link>

              <Link href="/merch" className="group">
                <div className="bg-card/50 dark:bg-black/50 backdrop-blur-sm border border-border dark:border-white/20 rounded-xl p-6 flex flex-col items-center text-center hover:bg-muted dark:hover:bg-white/10 transition-all h-full shadow-sm dark:shadow-none">
                  <ShoppingBag className="h-12 w-12 text-foreground dark:text-white mb-4" />
                  <h3 className="text-xl font-bold mb-2">MERCH STORE</h3>
                  <p className="text-muted-foreground dark:text-gray-400">
                    Official merchandise and limited edition items
                  </p>
                </div>
              </Link>

              <Link href="/music" className="group">
                <div className="bg-card/50 dark:bg-black/50 backdrop-blur-sm border border-border dark:border-white/20 rounded-xl p-6 flex flex-col items-center text-center hover:bg-muted dark:hover:bg-white/10 transition-all h-full shadow-sm dark:shadow-none">
                  <Music className="h-12 w-12 text-foreground dark:text-white mb-4" />
                  <h3 className="text-xl font-bold mb-2">DISCOGRAPHY</h3>
                  <p className="text-muted-foreground dark:text-gray-400">
                    Listen to the latest tracks and albums
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-muted/30 dark:bg-black/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">
              JOIN THE NEWSLETTER
            </h2>
            <div className="max-w-md mx-auto">
              <Newsletter />
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12">FOLLOW NEXDRAK</h2>
            <SocialLinks />
          </div>
        </section>
      </div>
    </div>
  );
}
