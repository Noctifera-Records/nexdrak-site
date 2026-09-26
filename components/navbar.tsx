"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ThemeToggle } from "./theme-toggle";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Better Auth resuelve la sesión de forma asíncrona. Mientras no sepamos la
  // respuesta mostramos un placeholder en lugar del botón LOGIN: mostrar LOGIN
  // a un usuario que sí ha iniciado sesión era justo lo que hacía parecer que
  // el login "no funcionaba". Ya no dependemos de leer la cookie con
  // document.cookie (es httpOnly, así que nunca era visible desde el cliente).
  const session = authClient.useSession();
  const { settings } = useSiteSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Successfully logged out");
            // Recarga completa: descarta de una vez la cookie de sesión, el
            // store de sesión del cliente y cualquier HTML/RSC cacheado.
            window.location.href = "/";
          },
          onError: (ctx) => {
            toast.error(ctx.error?.message || "Could not log out. Please try again.");
          },
        },
      });

      // Deja el store compartido en su estado real (útil si el cierre de sesión
      // falló y por tanto no hubo navegación).
      await session.refetch?.();
    } catch (error: any) {
      toast.error(error?.message || "Could not log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const navItems = [
    { name: "HOME", href: "/" },
    { name: "EVENTS", href: "/events" },
    { name: "MERCH", href: "/merch" },
    { name: "MUSIC", href: "/music" },
    { name: "DOWNLOADS", href: "/downloads" },
    { name: "BIO", href: "/about" },
  ];

  // Mientras la sesión se está resolviendo (o aún no estamos montados) hay que
  // mostrar el placeholder, nunca el botón de LOGIN.
  const isResolving = !mounted || Boolean(session.isPending);
  const user = isResolving ? null : session.data?.user ?? null;
  const isAdmin = user?.role === "admin";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] bg-background/70 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <Link href="/" className="flex-shrink-0 flex items-center z-20">
              {settings?.navbar_logo ? (
                <img src={settings.navbar_logo} alt="Logo" className="h-10 w-auto object-contain" />
              ) : (
                <span className="text-2xl font-bold tracking-tighter">NEXDRAK</span>
              )}
            </Link>
          </div>

          <div className="hidden lg:flex items-center justify-end gap-8">
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} className="text-sm font-medium tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              {isResolving ? (
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer">My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} disabled={loggingOut} className="text-destructive cursor-pointer">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild size="sm" className="px-6 font-semibold">
                  <Link href="/login">LOGIN</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="lg:hidden flex items-center gap-4 z-20">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMainMenuOpen(true)}>
              <Menu className="h-7 w-7" />
            </Button>
          </div>
        </div>
      </header>

      <div className="h-20" />

      {isMainMenuOpen && (
        <div className="fixed inset-0 z-[150] lg:hidden bg-background/95 backdrop-blur-md">
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-end mb-8">
              <Button variant="ghost" size="icon" onClick={() => setIsMainMenuOpen(false)}>
                <X className="h-8 w-8" />
              </Button>
            </div>
            
            <nav className="flex flex-col space-y-6 text-center">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} className="text-2xl font-bold tracking-widest" onClick={() => setIsMainMenuOpen(false)}>
                  {item.name}
                </Link>
              ))}

              <div className="pt-8">
                {isResolving ? (
                  <div className="h-16 w-16 rounded-full bg-muted animate-pulse mx-auto" />
                ) : user ? (
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-bold text-xl">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Button variant="destructive" onClick={handleLogout} disabled={loggingOut} className="w-full max-w-xs mt-4">Log out</Button>
                  </div>
                ) : (
                  <Button size="lg" className="w-full max-w-xs mx-auto text-xl py-6" asChild onClick={() => setIsMainMenuOpen(false)}>
                    <Link href="/login">LOGIN</Link>
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
