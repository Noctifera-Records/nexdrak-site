import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamicImport from "next/dynamic";
import { getSiteSettings } from "@/lib/site-settings";
import { getPublicSongs } from "@/app/music/actions";
import HeroSection from "@/components/hero-section";
import QuickLinks from "@/components/quick-links";
import SocialLinks from "@/components/social-links";

const LatestReleases = dynamicImport(() => import("@/components/latest-releases"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-gray-900 rounded-lg" />,
});
const UpcomingEvents = dynamicImport(() => import("@/components/upcoming-events"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-gray-900 rounded-lg" />,
});
const Newsletter = dynamicImport(() => import("@/components/newsletter"));

export default async function Home() {
  const settings = await getSiteSettings();
  const { songs = [] } = await getPublicSongs();
  
  // Show only latest 3 songs
  const featuredSongs = songs.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSection settings={settings} />

      {/* Quick Links Section */}
      <section className="py-12 bg-background text-foreground dark:bg-black dark:text-white border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto px-4">
          <QuickLinks />
        </div>
      </section>

      {/* Latest Releases Section */}
      <section id="music" className="py-20 bg-white text-black dark:bg-black dark:text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tighter">
                Latest <span className="text-foreground/50 dark:text-white/40">Releases</span>
              </h2>
              <p className="text-foreground/70 dark:text-white/70 max-w-xl">
                Explore the latest sounds from NexDrak. From high-energy techno to immersive house beats.
              </p>
            </div>
            <Link href="/music">
              <Button variant="outline" className="border-gray-300 text-foreground dark:border-white/20 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 dark:hover:text-white uppercase tracking-widest text-xs h-12 px-8">
                View All Tracks
              </Button>
            </Link>
          </div>
          <LatestReleases initialSongs={featuredSongs} />
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section id="events" className="py-20 bg-slate-100 text-slate-900 dark:bg-zinc-950 dark:text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tighter">
                Tour <span className="text-foreground/50 dark:text-white/40">Dates</span>
              </h2>
              <p className="text-foreground/70 dark:text-white/70 max-w-xl">
                Catch NexDrak live at festivals and clubs near you. Secure your tickets for the next experience.
              </p>
            </div>
            <Link href="/events">
              <Button variant="outline" className="border-gray-300 text-foreground dark:border-white/20 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 dark:hover:text-white uppercase tracking-widest text-xs h-12 px-8">
                See Full Schedule
              </Button>
            </Link>
          </div>
          <UpcomingEvents />
        </div>
      </section>

      {/* Connect Section */}
      <section className="py-20 bg-white text-black dark:bg-black dark:text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 blur-[120px] rounded-full -z-10" />
        
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter">
            Stay in <span className="text-foreground/50 dark:text-white/40">The Loop</span>
          </h2>
          
          <p className="text-foreground/70 dark:text-white/70 max-w-2xl mx-auto mb-12 text-lg">
            Join the community for early access to new music, exclusive tour announcements, and limited merchandise drops.
          </p>
          {/* <div className="max-w-xl mx-auto mb-16">
            <Newsletter />
          </div> */}

          <div className="flex flex-col items-center gap-12">
            <div className="w-full max-w-4xl mx-auto">
              <h3 className="text-sm font-bold tracking-[10.3em] uppercase text-foreground/40 dark:text-white/20 mb-8">Follow the journey</h3>
              <SocialLinks />
            </div>

            <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-foreground/40 dark:text-white/20">
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
              <Link href="/press-kit" className="hover:text-primary transition-colors">Press Kit</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/tos" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
