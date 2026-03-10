"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { useSiteSettings } from "@/hooks/use-site-settings";
import LogoutButton from "./logout-button";
import { ThemeToggle } from "./theme-toggle";

export default function Navbar() {
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const { settings } = useSiteSettings();
  const supabase = createClient();

  useEffect(() => {
    // Obtener usuario actual y su perfil
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (user) {
        // Obtener el perfil del usuario para verificar su rol
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setProfile(profile);
      }
      
      setUser(user);
    };

    getUser();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setProfile(null);
      } else {
        // Obtener perfil del nuevo usuario
        getUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Cerrar menús cuando se hace clic fuera o se presiona Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMainMenuOpen(false);
        setIsAdminMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Verificar si el usuario es admin
  const isAdmin = profile?.role === 'admin';

  const showPlaceholder = false;

  const navItems = [
    { name: "HOME", href: "/" },
    { name: "EVENTS", href: "/events" },
    { name: "MERCH", href: "/merch" },
    { name: "MUSIC", href: "/music" },
    { name: "DOWNLOADS", href: "/downloads" },
    { name: "BIO", href: "/about" },
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-black/70 backdrop-blur-md transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
          <Link href="/" aria-label="Go to homepage">
              <img
                src={settings.navbar_logo}
                alt={`${settings.site_title} logo`}
                className="h-8 w-auto dark:invert-0 invert transition-all duration-300"
              />
          </Link>
          <span className="h-6 w-px bg-black/20 dark:bg-white/20" aria-hidden="true" />
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/nexdrak"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-black/60 dark:text-white/60 hover:text-black/80 dark:hover:text-white/80 transition-colors"
              suppressHydrationWarning
            >
              <i className="fa-brands fa-instagram text-[14px]" />
            </a>
            <a
              href="https://x.com/nexdrak"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="text-black/60 dark:text-white/60 hover:text-black/80 dark:hover:text-white/80 transition-colors"
              suppressHydrationWarning
            >
              <i className="fa-brands fa-x-twitter text-[14px]" />
            </a>
            <a
              href="https://www.youtube.com/@nexdrak"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-black/60 dark:text-white/60 hover:text-black/80 dark:hover:text-white/80 transition-colors"
              suppressHydrationWarning
            >
              <i className="fa-brands fa-youtube text-[14px]" />
            </a>
            <a
              href="https://open.spotify.com/artist/1DRRpAYf6HmdFkLLPXeMEx"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Spotify"
              className="text-black/60 dark:text-white/60 hover:text-black/80 dark:hover:text-white/80 transition-colors"
              suppressHydrationWarning
            >
              <i className="fa-brands fa-spotify text-[14px]" />
            </a>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm tracking-widest text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all duration-300 hover:scale-105 relative group"
              suppressHydrationWarning
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-black dark:bg-white transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}

          {user ? (
            <div className="flex items-center space-x-4">
              {!isAdmin && (
                <Link
                  href="/account"
                  className="text-sm tracking-widest text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all duration-300 hover:scale-105 relative group"
                  suppressHydrationWarning
                >
                  ACCOUNT
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-black dark:bg-white transition-all duration-300 group-hover:w-full" />
                </Link>
              )}
            
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm tracking-widest text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all duration-300 hover:scale-105 relative group"
                  suppressHydrationWarning
                >
                  ADMIN
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-black dark:bg-white transition-all duration-300 group-hover:w-full" />
                </Link>
              )}
              
              <LogoutButton
                variant="outline"
                size="sm"
                className="border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20"
              />
              <ThemeToggle />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                variant="outline"
                className="border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20 rounded-md px-6"
                asChild
                suppressHydrationWarning
              >
                <Link href="/login">LOGIN</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          {user && isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
              aria-label="Toggle admin menu"
              className={`transition-colors ${
                isAdminMenuOpen
                  ? "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50"
                  : "text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              }`}
              suppressHydrationWarning
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}

          {/* Main Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMainMenuOpen(!isMainMenuOpen)}
            aria-label="Toggle navigation menu"
            className="text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
          >
            {isMainMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </header>

        {/* Main Navigation Menu Overlay - Rendered OUTSIDE header */}
        {isMainMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <div 
              className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-md transition-colors duration-300" 
            />
            <div className="relative h-full w-full flex flex-col p-6 animate-in slide-in-from-right-10 fade-in duration-300">
              <div className="flex justify-end items-center mb-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMainMenuOpen(false)}
                  className="text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X className="h-8 w-8" />
                </Button>
              </div>
              <nav className="flex flex-col items-center justify-center space-y-8 flex-grow">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-2xl font-bold tracking-widest text-black dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    onClick={() => setIsMainMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {user ? (
                  <div className="border-t border-black/10 dark:border-white/10 pt-8 mt-4 flex flex-col items-center gap-6 w-full max-w-xs">
                    {!isAdmin && (
                      <Link
                        href="/account"
                        className="text-xl tracking-widest text-black dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        onClick={() => setIsMainMenuOpen(false)}
                      >
                        ACCOUNT
                      </Link>
                    )}
                    
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="text-xl tracking-widest text-black dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        onClick={() => setIsMainMenuOpen(false)}
                      >
                        ADMIN
                      </Link>
                    )}
                    
                    <LogoutButton
                      variant="outline"
                      className="w-full border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 text-lg py-6"
                    />
                  </div>
                ) : (
                  <div className="pt-8 mt-4 w-full max-w-xs">
                    <Button
                      variant="outline"
                      className="w-full border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20 text-lg py-6 rounded-none"
                      asChild
                      onClick={() => setIsMainMenuOpen(false)}
                    >
                      <Link href="/login">LOGIN</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}

        {/* Admin Menu Overlay */}
        {isAdminMenuOpen && user && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsAdminMenuOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full w-[280px] bg-blue-900 border-r border-blue-500/30 p-6 shadow-2xl z-[70]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-blue-100">Admin Panel</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAdminMenuOpen(false)}
                  className="text-blue-100 hover:bg-blue-800/50"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors p-3 rounded-lg hover:bg-blue-800/50"
                  onClick={() => setIsAdminMenuOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/music"
                  className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors p-3 rounded-lg hover:bg-blue-800/50"
                  onClick={() => setIsAdminMenuOpen(false)}
                >
                  <span className="text-lg">🎵</span>
                  Music
                </Link>
                <Link
                  href="/admin/merch"
                  className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors p-3 rounded-lg hover:bg-blue-800/50"
                  onClick={() => setIsAdminMenuOpen(false)}
                >
                  <span className="text-lg">🛍️</span>
                  Merchandise
                </Link>
                <Link
                  href="/admin/events"
                  className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors p-3 rounded-lg hover:bg-blue-800/50"
                  onClick={() => setIsAdminMenuOpen(false)}
                >
                  <span className="text-lg">📅</span>
                  Events
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors p-3 rounded-lg hover:bg-blue-800/50"
                  onClick={() => setIsAdminMenuOpen(false)}
                >
                  <span className="text-lg">👥</span>
                  Users
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors p-3 rounded-lg hover:bg-blue-800/50"
                  onClick={() => setIsAdminMenuOpen(false)}
                >
                  <span className="text-lg">⚙️</span>
                  Settings
                </Link>
                <Link
                  href="/admin/account"
                  className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors p-3 rounded-lg hover:bg-blue-800/50"
                  onClick={() => setIsAdminMenuOpen(false)}
                >
                  <span className="text-lg">👤</span>
                  Account
                </Link>

                <div className="border-t border-blue-500/30 pt-4 mt-4">
                  <LogoutButton
                    variant="outline"
                    className="w-full border-blue-300 text-blue-100 hover:bg-blue-800/50 rounded-md"
                  />
                </div>
              </nav>
            </div>
          </div>
        )}
    </>
  );
}
