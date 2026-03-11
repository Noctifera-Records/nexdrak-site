"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Settings,
  Music,
  Calendar,
  Package,
  User,
  Download,
  Menu,
  X,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AdminShellProps {
  children: React.ReactNode;
  user: {
      name?: string | null;
      email: string;
      image?: string | null;
  };
}

export default function AdminShell({ children, user }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
      await authClient.signOut({
          fetchOptions: {
              onSuccess: () => {
                  toast.success("Successfully logged out");
                  router.push("/login");
                  router.refresh();
              },
          },
      });
  };

  const navigationItems = [
    { href: "/admin", icon: Home, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/music", icon: Music, label: "Music" },
    { href: "/admin/merch", icon: ShoppingBag, label: "Merchandise" },
    { href: "/admin/downloads", icon: Download, label: "Downloads" },
    { href: "/admin/events", icon: Calendar, label: "Events" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
    { href: "/admin/account", icon: User, label: "Account" },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-card border-r border-border text-foreground flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeSidebar}
            className="lg:hidden text-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={closeSidebar}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info and logout */}
        <div className="border-t border-border p-4 space-y-3">
          <div className="flex items-center space-x-3 px-2">
            <div className="bg-muted rounded-full p-2 flex-shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            className="w-full justify-start hover:bg-muted text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-foreground hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-background text-foreground overflow-auto">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
