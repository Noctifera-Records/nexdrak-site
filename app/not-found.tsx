"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()
  const [phase, setPhase] = useState<"glitch" | "settle" | "done">("glitch")
  const [glitchFrame, setGlitchFrame] = useState(0)
  const [badgeGlitch, setBadgeGlitch] = useState(true)

  useEffect(() => {
    document.title = "Not Found | NexDrak"
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === "Delete") {
        window.location.reload()
      } else if (phase === "done") {
        router.push("/")
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [router, phase])

  // Phase 1: Glitch frames
  useEffect(() => {
    if (phase !== "glitch") return
    let frame = 0
    const interval = setInterval(() => {
      frame++
      setGlitchFrame(frame)
      if (frame > 18) {
        clearInterval(interval)
        setPhase("settle")
        setBadgeGlitch(false)
      }
    }, 60)
    return () => clearInterval(interval)
  }, [phase])

  // Phase 2: Settle → done
  useEffect(() => {
    if (phase !== "settle") return
    const t = setTimeout(() => setPhase("done"), 500)
    return () => clearTimeout(t)
  }, [phase])

  const glitchOffset = () => {
    if (phase !== "glitch") return {}
    const offsets = [
      { transform: "skewX(-2deg) translateX(-4px)", filter: "hue-rotate(90deg)" },
      { transform: "skewX(3deg) translateX(6px)", filter: "brightness(2) saturate(0)" },
      { transform: "skewX(-1deg) translateX(2px)", filter: "invert(1)" },
      { transform: "translateX(-8px)", filter: "hue-rotate(180deg) contrast(2)" },
      { transform: "skewX(4deg)", filter: "brightness(0.3)" },
      { transform: "none", filter: "none" },
    ]
    return offsets[glitchFrame % offsets.length]
  }

  return (
    <div className="bsod-container font-mono text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="scanlines" />
      <div className="vignette" />

      {/* 404 badge */}
      <div className="relative mb-16 text-center">
        <div
          className="inline-block bg-[#bbb] text-[#000084] px-10 py-3 font-bold tracking-widest"
          style={{
            fontSize: "2.5rem",
            boxShadow: "0.6rem 0.6rem 0 #000",
            ...(badgeGlitch ? glitchOffset() : {}),
            animation: !badgeGlitch ? "badge-pulse 2s ease-in-out infinite" : "none",
          }}
        >
          {phase === "glitch" && glitchFrame % 3 === 0
            ? ["4", "0", "4"].map((c) =>
                Math.random() > 0.5 ? String.fromCharCode(33 + Math.floor(Math.random() * 60)) : c
              ).join("")
            : "404"}
        </div>
      </div>

      {/* Contenido */}
      <div className="w-fit mx-auto max-w-[90vw]">
        <div
          style={{
            opacity: phase === "glitch" ? (glitchFrame % 2 === 0 ? 0 : 1) : 1,
            transition: phase === "settle" ? "opacity 0.3s" : "none",
          }}
        >
          <p className="mb-8" style={{ color: phase === "glitch" && glitchFrame % 4 === 0 ? "#ff0" : undefined }}>
            A fatal exception 404 has occurred at N3XX:ABAD1DEA in 0xC0DEBA5E.
          </p>
          <p className="mb-8">The current request will be terminated.</p>
          <p className="mb-2">* Press any key to return to the previous page.</p>
          <p className="mb-2">* Press CTRL+ALT+DEL to restart your computer. You will</p>
          <p className="mb-12">&nbsp;&nbsp;lose any unsaved information in all applications.</p>
        </div>

        {/* Prompt — visible directo cuando phase === "done" */}
        <p
          className="text-center mt-12"
          style={{
            opacity: phase === "done" ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          Press any key to continue...&nbsp;<span className="cursor-pipe">|</span>
        </p>
      </div>

      <Link href="/" className="block mt-16 text-center opacity-50 hover:opacity-100 underline md:hidden text-sm">
        Tap here to return home
      </Link>

      <style jsx global>{`
        @font-face {
          font-family: 'more_perfect_dos_vgaregular';
          src: url('/fonts/more-perfect-dos-vga.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
        }
        .bsod-container {
          background-color: #000084;
          font-family: 'more_perfect_dos_vgaregular', 'Courier New', monospace;
          position: relative;
          overflow: hidden;
        }
        .scanlines {
          position: fixed; inset: 0; pointer-events: none; z-index: 10;
          background: repeating-linear-gradient(
            to bottom, transparent 0px, transparent 2px,
            rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px
          );
          animation: scanroll 8s linear infinite;
        }
        @keyframes scanroll {
          from { background-position: 0 0; }
          to   { background-position: 0 40px; }
        }
        .vignette {
          position: fixed; inset: 0; pointer-events: none; z-index: 9;
          background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,30,0.7) 100%);
        }
        .cursor-pipe {
          display: inline-block;
          font-weight: bold;
          animation: pipe-blink 1s step-end infinite;
        }
        @keyframes pipe-blink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0.6rem 0.6rem 0 #000; }
          50%      { box-shadow: 0.6rem 0.6rem 0 #000, 0 0 16px 6px rgba(255,255,255,0.15); }
        }
      `}</style>
    </div>
  )
}