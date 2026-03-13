import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { NotificationProvider } from "@/components/notification-system"
import ErrorBoundary from "@/components/error-boundary"
import { HydrationFix } from "@/components/hydration-fix"
import StructuredData from "./structured-data"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import FooterBar from "@/components/footer-bar"
import GlobalBackground from "@/components/global-background"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://nexdrak.com'),
  title: {
    default: 'NexDrak',
    template: '%s | NexDrak',
  },
  description: 'Official website of NexDrak. Electronic music, events, and merchandise.',
  alternates: {
    canonical: 'https://nexdrak.com',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <StructuredData />
      </head>
      <body className={`${inter.className} min-h-screen bg-white dark:bg-black text-black dark:text-white antialiased overflow-x-hidden transition-colors duration-300`}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange
          >
            <NotificationProvider>
              <GlobalBackground />
              
              <HydrationFix>
                <Navbar />
                <main className="flex-grow flex flex-col relative z-0">
                  {children}
                </main>
                <FooterBar />
                <Toaster />
                <SonnerToaster />
              </HydrationFix>
              
            </NotificationProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
