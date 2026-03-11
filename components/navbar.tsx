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
  const { data: session } = authClient.useSession();
  const router = useRouter();
  
  const { settings } = useSiteSettings();
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
      await authClient.signOut({
          fetchOptions: {
              onSuccess: () => {
                  toast.success("Successfully logged out");
                  router.push("/login");
                  // Force a full page reload to clear any client-side session state
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

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-[100] bg-background border-b border-border h-20">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
            <div className="h-10 w-32 bg-muted/20 animate-pulse rounded" />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] bg-background/70 backdrop-blur-md border-b border-border shadow-sm transition-all duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Left Section: Logo & Socials */}
          <div className="flex items-center gap-6">
            <Link href="/" aria-label="Go to homepage" className="flex-shrink-0 flex items-center z-20">
                {settings?.navbar_logo ? (
                  <img
                    src={settings.navbar_logo}
                    alt={settings.site_title || "Logo"}
                    className="h-10 w-auto object-contain transition-opacity hover:opacity-80"
                  />
                ) : (
                  <span className="text-2xl font-bold tracking-tighter text-foreground">NEXDRAK</span>
                )}
            </Link>

            <span className="h-6 w-px bg-border hidden lg:block" />

            <div className="hidden lg:flex items-center gap-4 text-muted-foreground">
              <a href="https://www.instagram.com/nexdrak" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hover:scale-110">
                <i className="fa-brands fa-instagram text-lg" />
              </a>
              <a href="https://x.com/nexdrak" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hover:scale-110">
                <i className="fa-brands fa-x-twitter text-lg" />
              </a>
              <a href="https://www.youtube.com/@nexdrak" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hover:scale-110">
                <i className="fa-brands fa-youtube text-lg" />
              </a>
              <a href="https://open.spotify.com/artist/1DRRpAYf6HmdFkLLPXeMEx" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hover:scale-110">
                <i className="fa-brands fa-spotify text-lg" />
              </a>
            </div>
          </div>

          {/* Right Section: Navigation & Auth */}
          <div className="hidden lg:flex items-center justify-end gap-8">
            <nav className="flex items-center gap-6 xl:gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium tracking-widest text-muted-foreground hover:text-primary transition-all duration-200 relative group py-2"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={user.image || ""} alt={user.name || ""} />
                        <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer w-full flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer w-full flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive w-full flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild size="sm" className="px-6 font-semibold tracking-wide ml-2">
                  <Link href="/login">LOGIN</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-4 z-20">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMainMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-7 w-7" />
            </Button>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-20" />

      {/* Mobile Menu Overlay */}
      {isMainMenuOpen && (
        <div className="fixed inset-0 z-[150] lg:hidden bg-background/80 backdrop-blur-md">
          <div className="flex flex-col h-full p-6 animate-in slide-in-from-right-10 duration-200">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-bold tracking-tight">MENU</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMainMenuOpen(false)}
                className="h-10 w-10"
              >
                <X className="h-8 w-8" />
              </Button>
            </div>
            
            <nav className="flex flex-col space-y-6 flex-grow overflow-y-auto text-center justify-center">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-3xl font-bold tracking-widest hover:text-primary transition-colors py-4 border-b border-border/10"
                  onClick={() => setIsMainMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {user ? (
                <div className="space-y-4 pt-8 w-full max-w-sm mx-auto">
                  <div className="flex flex-col items-center gap-3 px-2 py-4 bg-muted/30 rounded-lg">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={user.image || ""} alt={user.name || ""} />
                      <AvatarFallback className="text-xl">{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-center">
                      <p className="font-semibold text-xl">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center justify-center gap-3 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-lg font-medium text-primary"
                      onClick={() => setIsMainMenuOpen(false)}
                    >
                      <Settings className="h-6 w-6" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/account"
                    className="flex items-center justify-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors text-lg font-medium"
                    onClick={() => setIsMainMenuOpen(false)}
                  >
                    <User className="h-6 w-6" />
                    My Account
                  </Link>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="w-full justify-center mt-6 text-lg"
                    onClick={() => {
                      handleLogout();
                      setIsMainMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Log out
                  </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full text-xl py-8 mt-12 font-bold tracking-widest max-w-sm mx-auto"
                  asChild
                  onClick={() => setIsMainMenuOpen(false)}
                >
                  <Link href="/login">LOGIN</Link>
                </Button>
              )}
            </nav>
            
            {/* Mobile Footer */}
            <div className="flex justify-center gap-10 py-8 mt-auto border-t">
              <a href="https://www.instagram.com/nexdrak" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110">
                <i className="fa-brands fa-instagram text-3xl" />
              </a>
              <a href="https://x.com/nexdrak" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110">
                <i className="fa-brands fa-x-twitter text-3xl" />
              </a>
              <a href="https://www.youtube.com/@nexdrak" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110">
                <i className="fa-brands fa-youtube text-3xl" />
              </a>
              <a href="https://open.spotify.com/artist/1DRRpAYf6HmdFkLLPXeMEx" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110">
                <i className="fa-brands fa-spotify text-3xl" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
