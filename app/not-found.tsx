"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Disc3 } from "lucide-react"

export const runtime = "edge";

// Define types for our glitch elements
interface GlitchLine {
  id: number
  height: number
  width: number
  top: number
  left: number
  duration: number
  opacity: number
}

export default function NotFound() {
  const [count, setCount] = useState(10)
  const [horizontalLines, setHorizontalLines] = useState<GlitchLine[]>([])
  const [verticalLines, setVerticalLines] = useState<GlitchLine[]>([])
  const [isClient, setIsClient] = useState(false)

  // Initialize glitch effects only on the client side
  useEffect(() => {
    setIsClient(true)

    // Generate horizontal glitch lines
    const hLines = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      height: Math.random() * 3,
      width: Math.random() * 100,
      top: Math.random() * 100,
      left: 0,
      duration: Math.random() * 5 + 2,
      opacity: Math.random() * 0.5 + 0.5,
    }))

    // Generate vertical glitch lines
    const vLines = Array.from({ length: 20 }).map((_, i) => ({
      id: i + 20,
      width: Math.random() * 3,
      height: Math.random() * 100,
      left: Math.random() * 100,
      top: 0,
      duration: Math.random() * 5 + 2,
      opacity: Math.random() * 0.5 + 0.5,
    }))

    setHorizontalLines(hLines)
    setVerticalLines(vLines)
  }, [])

  // Countdown timer to redirect to home page
  useEffect(() => {
    const timer = setTimeout(() => {
      if (count > 1) {
        setCount(count - 1)
      } else {
        window.location.href = "/"
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [count])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4 py-24">
      {/* Glitch effect - only render when client-side */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 z-0">
            {/* Horizontal lines */}
            {horizontalLines.map((line) => (
              <div
                key={line.id}
                className="absolute bg-green-500/20"
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

            {/* Vertical lines */}
            {verticalLines.map((line) => (
              <div
                key={line.id}
                className="absolute bg-green-500/20"
                style={{
                  width: `${line.width}px`,
                  height: `${line.height}%`,
                  top: 0,
                  left: `${line.left}%`,
                  animation: `glitch-vertical ${line.duration}s infinite linear`,
                  opacity: line.opacity,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="z-10 text-center space-y-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <Disc3 className="h-24 w-24 text-green-500 animate-spin-slow" />
        </div>

        <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-green-500 glitch-text">404</h1>

        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">SORRY BUT TRACK NOT FOUND</h2>
          <p className="text-xl text-gray-400">The beat you're looking for seems to have dropped out of the mix, ups...</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Button asChild size="lg" className="bg-green-500 hover:bg-green-600 text-black">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              BACK TO HOME
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="border-green-500 text-green-500 hover:bg-green-500/20"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            GO BACK
          </Button>
        </div>

        <div className="text-sm text-gray-500 mt-8">
          Redirecting to home in <span className="text-green-500">{count}</span> seconds...
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
        
        @keyframes glitch-vertical {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        
        .glitch-text {
          position: relative;
          display: inline-block;
        }
        
        .glitch-text::before,
        .glitch-text::after {
          content: '404';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glitch-text::before {
          color: #ff00ff;
          z-index: -1;
          animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
          animation-delay: 0.1s;
        }
        
        .glitch-text::after {
          color: #00ffff;
          z-index: -2;
          animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both infinite;
          animation-delay: 0.2s;
        }
        
        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-3px, 3px);
          }
          40% {
            transform: translate(-3px, -3px);
          }
          60% {
            transform: translate(3px, 3px);
          }
          80% {
            transform: translate(3px, -3px);
          }
          100% {
            transform: translate(0);
          }
        }
      `}</style>
    </div>
  )
}
