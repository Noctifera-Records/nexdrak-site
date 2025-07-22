"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: "HOME", href: "/" },
    { name: "EVENTS", href: "/events" },
    { name: "MERCH", href: "/merch" },
    { name: "MUSIC", href: "/music" },
    { name: "BIO", href: "/about" },
  ]

  return (
    <header className="fixed top-0 w-full z-50 bg-black/70 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <img
            src="/nav-logo.webp"
            alt="Pulse logo"
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
          <Button variant="outline" className="border-white text-white hover:bg-white/20 rounded-md px-6">
            LOGIN (SOON)
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-black/95 border-l border-white/20">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <nav className="flex flex-col h-full pt-8 space-y-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-lg tracking-widest hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Button variant="outline" className="border-white text-white hover:bg-white/20 rounded-md">
                LOGIN (SOON)
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
