"use client";

import { usePathname } from "next/navigation";
import Link from "next/link"; 

export default function FooterBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="w-full border-t border-black/10 dark:border-white/10 py-12 text-center bg-white dark:bg-black transition-colors duration-300">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <p className="text-[12px] uppercase tracking-[0.4em] text-black/60 dark:text-white/70 font-medium">
          Designed by{" "}
          {/* <Link href="https://aiskoa.vercel.app" target="_blank" rel="noopener noreferrer"> */}
            <span className="text-blue-600 dark:text-blue-400">AISKOA</span>
          {/* </Link> */}
          {/* {" "} & {" "} 
          <Link href="https://aiskoa.com" target="_blank" rel="noopener noreferrer">
            <span className="text-blue-600 dark:text-blue-400">NOCTIFERA</span>
          </Link> */}
          {/* <span className="text-blue-600 dark:text-blue-400">AISKOA</span> © */}
          {" "}2026 ©
        </p>
      </div>
    </footer>
  );
}
