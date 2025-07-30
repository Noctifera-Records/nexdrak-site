import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import BackgroundAnimation from "@/components/background-animation"
import { NotificationProvider } from "@/components/notification-system"
import OptimizedLoader from "@/components/optimized-loader"
import ResourcePreloader from "@/components/resource-preloader"
import ErrorBoundary from "@/components/error-boundary"
import SafeAppWrapper from "@/components/safe-app-wrapper"
import ResourceErrorHandler from "@/components/resource-error-handler"
import ChunkErrorHandler from "@/components/chunk-error-handler"
import Anti429System from "@/components/anti-429-system"
import Final429Solution from "@/components/final-429-solution"
import StructuredData from "./structured-data"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "NexDrak — Official Music Artist Website",
    template: "%s | NexDrak"
  },
  description: "Official website of NexDrak - Electronic Music Artist. Listen to the latest releases including Red Eye Flight, discover tour dates, and explore the complete discography of dubstep, darkwave, and synth music.",
  generator: "Next.js",
  applicationName: "NexDrak Official Website",
  referrer: "origin-when-cross-origin",
  keywords: [
    "NexDrak", 
    "Electronic Music", 
    "Music Artist", 
    "Dubstep", 
    "Darkwave", 
    "Synth", 
    "Red Eye Flight",
    "Venus",
    "Call Me Back",
    "Your Smile",
    "Electronic Dance Music",
    "EDM",
    "Music Producer",
    "DJ",
    "Live Music",
    "Concert Tours",
    "Music Streaming"
  ],
  authors: [{ name: "NexDrak", url: "https://nexdrak.com" }],
  creator: "NexDrak",
  publisher: "NexDrak",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://nexdrak.com"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
      "es-ES": "/es-ES",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "NexDrak — Official Electronic Music Artist",
    description: "Discover NexDrak's latest electronic music releases, tour dates, and exclusive content. Stream Red Eye Flight and explore the complete discography.",
    url: "https://nexdrak.com",
    siteName: "NexDrak Official",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NexDrak - Electronic Music Artist",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexDrak — Electronic Music Artist",
    description: "Stream the latest electronic music from NexDrak. New single Red Eye Flight out now!",
    creator: "@NexDrak",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code-here",
    yandex: "yandex-verification-code-here",
    yahoo: "yahoo-site-verification-code-here",
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
      <head>
        <StructuredData />
      </head>
      <body className={`${inter.className} bg-black text-white min-h-screen flex flex-col`}>
        <Final429Solution />
        <Anti429System />
        <ChunkErrorHandler />
        <ResourceErrorHandler />
        <SafeAppWrapper>
          <ResourcePreloader />
          <ErrorBoundary>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
              <NotificationProvider>
                <OptimizedLoader>
                  <BackgroundAnimation />
                  <Navbar />
                  <main className="flex-1 relative pt-20">{children}</main>
                </OptimizedLoader>
              </NotificationProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </SafeAppWrapper>
      </body>
    </html>
  )
}
