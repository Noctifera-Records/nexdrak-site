"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ThemeToggle } from "./theme-toggle";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
  const [hasTokenCookie, setHasTokenCookie] = useState(false);
  
  const { data: session, isPending } = authClient.useSession();
  const { settings } = useSiteSettings();

  useEffect(() => {
    setMounted(true);
    // Verificación segura de cookie solo en el cliente
    const hasToken = document.cookie.includes('better-auth.session_token') || 
                     document.cookie.includes('__Secure-better-auth.session_token');
    setHasTokenCookie(hasToken);
  }, []);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Successfully logged out");
          window.location.href = "/login";
        },
      },
    });
  };

  const navItems = [
    { name: "HOME", href: "/" },
    { name: "EVENTS", href: "/events" },
    { name: "MERCH", href: "/merch" },
    { name: "MUSIC", href: "/music" },
    { name: "DOWNLOADS", href: "/downloads" },
    { name: "BIO", href: "/about" },
  ];

  const user = session?.user;
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

          {/* Desktop Nav */}
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
              
              {!mounted ? (
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/account">My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (isPending && hasTokenCookie) ? (
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
              ) : (
                <Button asChild size="sm">
                  <Link href="/login">LOGIN</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-4 z-20">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMainMenuOpen(true)}>
              <Menu className="h-7 w-7" />
            </Button>
          </div>
        </div>
      </header>

      <div className="h-20" />

      {/* Mobile Menu */}
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
                {!mounted ? (
                  <div className="h-16 w-16 rounded-full bg-muted animate-pulse mx-auto" />
                ) : user ? (
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.image || ""} />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <p className="font-bold">{user.name}</p>
                    <Button variant="destructive" onClick={handleLogout} className="w-full max-w-xs">Log out</Button>
                  </div>
                ) : (isPending && hasTokenCookie) ? (
                  <div className="h-16 w-16 rounded-full bg-muted animate-pulse mx-auto" />
                ) : (
                  <Button size="lg" className="w-full max-w-xs mx-auto" asChild onClick={() => setIsMainMenuOpen(false)}>
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
