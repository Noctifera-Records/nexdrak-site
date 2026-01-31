 "use client";
 
 import { usePathname } from "next/navigation";
 
 export default function FooterBar() {
   const pathname = usePathname();
   if (pathname.startsWith("/admin")) return null;
   return (
    <footer className="w-full border-t border-white/10 py-3 text-center text-xs text-white/60">
       Designed by AISKOA © 2026
     </footer>
   );
 }
