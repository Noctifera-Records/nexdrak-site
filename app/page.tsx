import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamicImport from "next/dynamic";
import {
  CalendarDays,
  ShoppingBag,
  Music,
} from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { getPublicSongs } from "@/app/music/actions";
import HeroSection from "@/components/hero-section";

const LatestReleases = dynamicImport(() => import("@/components/latest-releases"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-gray-900 rounded-lg" />,
});
const UpcomingEvents = dynamicImport(() => import("@/components/upcoming-events"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-gray-900 rounded-lg" />,
});
const Newsletter = dynamicImport(() => import("@/components/newsletter"));

export const runtime = 'edge';

export default async function Home() {
  const settings = await getSiteSettings();
  const { songs = [] } = await getPublicSongs();
  
  // Show only featured or latest 3 songs
  const featuredSongs = songs.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSection settings={settings} />

      {/* Quick Links Section */}
      <section className="py-12 bg-black border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link 
              href="/music" 
              className="group p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300 flex items-center space-x-4"
            >
              <div className="p-3 bg-white/10 rounded-full group-hover:scale-110 transition-transform">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Music</h3>
                <p className="text-white/60 text-sm">Latest releases & tracks</p>
              </div>
            </Link>
            
            <Link 
              href="/events" 
              className="group p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300 flex items-center space-x-4"
            >
              <div className="p-3 bg-white/10 rounded-full group-hover:scale-110 transition-transform">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Events</h3>
                <p className="text-white/60 text-sm">Shows & performances</p>
              </div>
            </Link>
            
            <Link 
              href="/merch" 
              className="group p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300 flex items-center space-x-4"
            >
              <div className="p-3 bg-white/10 rounded-full group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Merch</h3>
                <p className="text-white/60 text-sm">Exclusive artist gear</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Releases Section */}
      <section id="music" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tighter">
                Latest <span className="text-white/40">Releases</span>
              </h2>
              <p className="text-white/60 max-w-xl">
                Explore the latest sounds from NexDrak. From high-energy techno to immersive house beats.
              </p>
            </div>
            <Link href="/music">
              <Button variant="outline" className="border-white/20 hover:bg-white/10 hover:text-white uppercase tracking-widest text-xs h-12 px-8">
                View All Tracks
              </Button>
            </Link>
          </div>
          <LatestReleases initialSongs={featuredSongs} />
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section id="events" className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tighter">
                Tour <span className="text-white/40">Dates</span>
              </h2>
              <p className="text-white/60 max-w-xl">
                Catch NexDrak live at festivals and clubs near you. Secure your tickets for the next experience.
              </p>
            </div>
            <Link href="/events">
              <Button variant="outline" className="border-white/20 hover:bg-white/10 hover:text-white uppercase tracking-widest text-xs h-12 px-8">
                See Full Schedule
              </Button>
            </Link>
          </div>
          <UpcomingEvents />
        </div>
      </section>

      {/* Connect Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        {/* Abstract background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 blur-[120px] rounded-full -z-10" />
        
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter">
            Stay in <span className="text-white/40">The Loop</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-12 text-lg">
            Join the community for early access to new music, exclusive tour announcements, and limited merchandise drops.
          </p>
          <div className="max-w-xl mx-auto">
            <Newsletter />
          </div>
        </div>
      </section>
    </div>
  );
}
