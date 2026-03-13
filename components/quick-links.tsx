"use client";

import Link from "next/link";
import { Music, CalendarDays, ShoppingBag } from "lucide-react";

export default function QuickLinks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Link 
        href="/music" 
        className="group p-6 bg-white/5 text-foreground dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 hover:bg-gray-100 border border-gray-300 dark:border-white/20 rounded-lg transition-all duration-300 flex items-center space-x-4"
      >
        <div className="p-3 bg-white/10 rounded-full group-hover:scale-110 transition-transform">
          <Music className="w-6 h-6 text-foreground dark:text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Music</h3>
          <p className="text-foreground/70 dark:text-white/70 text-sm">Latest releases & tracks</p>
        </div>
      </Link>
      
      <Link 
        href="/events" 
        className="group p-6 bg-white/5 text-foreground dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 hover:bg-gray-100 border border-gray-300 dark:border-white/20 rounded-lg transition-all duration-300 flex items-center space-x-4"
      >
        <div className="p-3 bg-white/10 rounded-full group-hover:scale-110 transition-transform">
          <CalendarDays className="w-6 h-6 text-foreground dark:text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Events</h3>
          <p className="text-foreground/70 dark:text-white/70 text-sm">Shows & performances</p>
        </div>
      </Link>
      
      <Link 
        href="/merch" 
        className="group p-6 bg-white/5 text-foreground dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 hover:bg-gray-100 border border-gray-300 dark:border-white/20 rounded-lg transition-all duration-300 flex items-center space-x-4"
      >
        <div className="p-3 bg-white/10 rounded-full group-hover:scale-110 transition-transform">
          <ShoppingBag className="w-6 h-6 text-foreground dark:text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Merch</h3>
          <p className="text-foreground/70 dark:text-white/70 text-sm">Exclusive artist gear</p>
        </div>
      </Link>
    </div>
  );
}
