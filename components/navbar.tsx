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

  // Verificar si el usuario es admin
  const isAdmin = profile?.role === 'admin';

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

  const navItems = [
    { name: "HOME", href: "/" },
    { name: "EVENTS", href: "/events" },
    { name: "MERCH", href: "/merch" },
    { name: "MUSIC", href: "/music" },
    { name: "DOWNLOADS", href: "/downloads" },
    { name: "BIO", href: "/about" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-black/70 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" aria-label="Go to homepage">
          <img
            src={settings.navbar_logo}
            alt={`${settings.site_title} logo`}
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm tracking-widest hover:text-white transition-colors"
            >
              {item.name}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center space-x-4">
              {/* Solo mostrar ACCOUNT si NO es admin */}
              {!isAdmin && (
                <Link
                  href="/account"
                  className="text-sm tracking-widest hover:text-white transition-colors"
                >
                  ACCOUNT
                </Link>
              )}
              
              {/* Solo mostrar ADMIN si ES admin */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm tracking-widest hover:text-white transition-colors"
                >
                  ADMIN
                </Link>
              )}
              
              <LogoutButton
                variant="outline"
                size="sm"
                className="border-white text-white hover:bg-white/20"
              />
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/20 rounded-md px-6"
              asChild
            >
              <Link href="/login">LOGIN</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          {/* Admin Menu Button (solo si está logueado Y es admin) */}
          {user && isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
              aria-label="Toggle admin menu"
              className={`transition-colors ${
                isAdminMenuOpen
                  ? "text-blue-300 bg-blue-900/50"
                  : "text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
              }`}
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
          >
            {isMainMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Main Navigation Menu Overlay */}
        {isMainMenuOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMainMenuOpen(false)}
            />
            <div className="fixed right-0 top-0 h-full w-[300px] bg-black border-l border-white/10 p-6 shadow-2xl z-[70]">
              <div className="flex justify-end items-center mb-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMainMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex flex-col space-y-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-lg tracking-widest hover:text-white transition-colors"
                    onClick={() => setIsMainMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {user ? (
                  <div className="border-t border-white/20 pt-6 mt-6 space-y-4">
                    {/* Solo mostrar ACCOUNT si NO es admin */}
                    {!isAdmin && (
                      <Link
                        href="/account"
                        className="block text-lg tracking-widest hover:text-white transition-colors"
                        onClick={() => setIsMainMenuOpen(false)}
                      >
                        ACCOUNT
                      </Link>
                    )}
                    
                    {/* Botón de logout para usuarios NO-admin (los admin ya lo tienen en su menú xd) */}
                    {!isAdmin && (
                      <LogoutButton
                        variant="outline"
                        className="w-full border-white text-white hover:bg-white/20 rounded-md"
                      />
                    )}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white/20 rounded-md mt-4"
                    asChild
                  >
                    <Link
                      href="/login"
                      onClick={() => setIsMainMenuOpen(false)}
                    >
                      LOGIN
                    </Link>
                  </Button>
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
      </div>
    </header>
  );
}
