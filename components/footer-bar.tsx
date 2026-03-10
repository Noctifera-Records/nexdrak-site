 "use client";
 
 import { usePathname } from "next/navigation";
 
 export default function FooterBar() {
   const pathname = usePathname();
   if (pathname.startsWith("/admin")) return null;
   return (
    <footer className="w-full border-t border-black/10 dark:border-white/10 py-3 text-center text-xs text-black/60 dark:text-white/60 bg-white dark:bg-black transition-colors duration-300">
      Designed by AISKOA © 2026
    </footer>
   );
 }
