import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import MusicPlayer from "@/components/music-player"

export const runtime = "edge";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NexDrak — Official Website",
  description: "Official website of NexDrak - Music Artist",
  generator: "v0.dev",
  keywords: ["NexDrak", "Music", "Artist", "Dubstep", "Darkwave", "Synth"],
  authors: [{ name: "NexDrak", url: "https://nexdrak.com" }],
  creator: "NexDrak",
  metadataBase: new URL("https://nexdrak.com"),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "NexDrak — Official Website",
    description: "The official home of NexDrak's music and content.",
    url: "https://nexdrak.com",
    siteName: "NexDrak",
    images: [
      {
        url: "/og-image.png", // reemplaza si tienes una imagen OG
        width: 1200,
        height: 630,
        alt: "NexDrak Banner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexDrak — Official Website",
    description: "The official home of NexDrak's music and content.",
    creator: "@NexDrak", // tu usuario si tienes Twitter
    images: ["/og-image.png"],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: '#000000', // Agregando themeColor
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-black text-white min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Navbar />
          <main className="flex-1 relative">{children}</main>
          <MusicPlayer />
        </ThemeProvider>
      </body>
    </html>
  )
}
