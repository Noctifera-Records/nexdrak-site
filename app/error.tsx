"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, RefreshCw, AlertTriangle } from "lucide-react"

export const runtime = "edge";

interface GlitchLine {
  id: number
  height: number
  width: number
  top: number
  left: number
  duration: number
  opacity: number
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [horizontalLines, setHorizontalLines] = useState<GlitchLine[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)

    // Initialize client-side only
    setIsClient(true)

    // Generate horizontal glitch lines
    const hLines = Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      height: Math.random() * 3,
      width: Math.random() * 100,
      top: Math.random() * 100,
      left: 0,
      duration: Math.random() * 5 + 2,
      opacity: Math.random() * 0.5 + 0.5,
    }))

    setHorizontalLines(hLines)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4 py-24">
      {/* Glitch effect - only render when client-side */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 z-0">
            {horizontalLines.map((line) => (
              <div
                key={line.id}
                className="absolute bg-red-500/20"
                style={{
                  height: `${line.height}px`,
                  width: `${line.width}%`,
                  left: 0,
                  top: `${line.top}%`,
                  animation: `glitch-horizontal ${line.duration}s infinite linear`,
                  opacity: line.opacity,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="z-10 text-center space-y-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <AlertTriangle className="h-24 w-24 text-red-500 animate-pulse" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-red-500">SYSTEM FAILURE</h1>

        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">SOMETHING WENT WRONG</h2>
          <p className="text-lg text-gray-400">Looks like we hit a bad frequency. Our engineers have been notified.</p>
          {error.message && (
            <p className="text-sm text-gray-500 bg-black/50 p-4 rounded-md border border-red-500/20 mt-4 max-w-lg mx-auto overflow-auto">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Button onClick={reset} size="lg" className="bg-red-500 hover:bg-red-600 text-black">
            <RefreshCw className="mr-2 h-5 w-5" />
            TRY AGAIN
          </Button>

          <Button asChild variant="outline" size="lg" className="border-red-500 text-red-500 hover:bg-red-500/20">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              BACK TO HOME
            </Link>
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes glitch-horizontal {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100vw);
          }
        }
      `}</style>
    </div>
  )
}
