import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// @ts-ignore - CSS module import has no type declarations
// import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
// import BackgroundAnimation from "@/components/background-animation"
import { NotificationProvider } from "@/components/notification-system"
import ErrorBoundary from "@/components/error-boundary"
// import HydrationFix from "@/components/hydration-fix"
import StructuredData from "./structured-data"
// import ResourcePreloader from "@/components/resource-preloader"
// import WebVitals from "@/components/web-vitals"
import { Toaster } from "@/components/ui/toaster"
import FooterBar from "@/components/footer-bar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://nexdrak.com'),
  title: {
    default: 'NexDrak - Official Artist Website',
    template: '%s | NexDrak'
  },
  description: 'Official website of NexDrak. Listen to the latest electronic music releases, check upcoming events, and get exclusive merchandise.',
  keywords: ['Electronic Music', 'NexDrak', 'DJ', 'Producer', 'Techno', 'House', 'Music Events'],
  authors: [{ name: 'NexDrak' }],
  creator: 'NexDrak',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nexdrak.com',
    siteName: 'NexDrak',
    title: 'NexDrak | Official Artist Website',
    description: 'Official website of NexDrak. Listen to the latest electronic music releases, check upcoming events, and get exclusive merchandise.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NexDrak Official Website',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexDrak | Official Artist Website',
    description: 'Official website of NexDrak. Listen to the latest electronic music releases, check upcoming events, and get exclusive merchandise.',
    images: ['/og-image.png'],
    creator: '@nexdrak',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'verification_token', // Add your Google verification token
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <StructuredData />
      </head>
      <body className={`${inter.className} min-h-screen bg-black text-white antialiased overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200`}>
        <ErrorBoundary>
            <NotificationProvider>
              {/* <ResourcePreloader /> */}
              {/* <WebVitals /> */}
              {/* <BackgroundAnimation /> */}
              <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-40 pointer-events-none" aria-hidden="true" />
              
              {/* <HydrationFix> */}
                <Navbar />
                <main className="flex-grow flex flex-col relative z-0">
                  {children}
                </main>
                <FooterBar />
                <Toaster />
              {/* </HydrationFix> */}
            </NotificationProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
