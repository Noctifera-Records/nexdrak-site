"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Pause, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Release {
  id: number
  title: string
  type: string
  coverArt: string
  releaseDate: string
  audioSrc: string
  purchaseLink: string
}

const releases: Release[] = [
  {
    id: 1,
    title: "Red Eye Flight",
    type: "Single",
    coverArt: "/img/releases/rede.webp",
    releaseDate: "Mar 10, 2025",
    audioSrc: "./samples/red3.ogg",
    purchaseLink: "https://album.link/redeye"
  },
  {
    id: 2,
    title: "Endless Rail",
    type: "Single",
    coverArt: "/img/releases/endless.webp",
    releaseDate: "Ago 16, 2023",
    audioSrc: "/samples/endless.ogg",
    purchaseLink: "https://album.link/example"
  },
  {
    id: 3,
    title: "Rewind",
    type: "Single",
    coverArt: "/img/releases/rewind.webp",
    releaseDate: "Mar 3, 2021",
    audioSrc: "/samples/rewind.ogg",
    purchaseLink: "https://album.link/example"
  },
  {
    id: 4,
    title: "Your Lie",
    type: "EP",
    coverArt: "/img/releases/yourlie.webp",
    releaseDate: "June 2, 2020",
    audioSrc: "/samples/yourlie.ogg",
    purchaseLink: "https://album.link/example"
  }
]

export default function LatestReleases() {
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const togglePlay = (release: Release) => {
    if (playingId === release.id) {
      audio?.pause()
      setPlayingId(null)
      setAudio(null)
    } else {
      if (audio) {
        audio.pause()
      }

      const newAudio = new Audio(release.audioSrc)
      // @ts-ignore - custom property for tracking
      newAudio._isConnected = false

      newAudio.onerror = (e) => {
        console.error("Audio error:", e)
        setPlayingId(null)
        setAudio(null)
      }

      const playPromise = newAudio.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Playback error:", error)
          setPlayingId(null)
          setAudio(null)
        })
      }

      newAudio.onended = () => {
        setPlayingId(null)
        setAudio(null)
      }

      setAudio(newAudio)
      setPlayingId(release.id)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {releases.map((release) => (
        <Card key={release.id} className="bg-black/50 backdrop-blur-sm border-white/20 overflow-hidden group">
          <div className="relative aspect-square">
            <Image
              src={release.coverArt || "/placeholder.svg"}
              alt={release.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex items-center gap-4">
                {/* Botón de compra */}
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-14 w-14 border-white text-white hover:bg-white/20"
                  asChild
                >
                  <a 
                    href={release.purchaseLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ShoppingCart className="h-6 w-6" />
                  </a>
                </Button>
                {/* Botón de reproducción/pausa */}
                <Button
                  onClick={() => togglePlay(release)}
                  variant="outline"
                  size="icon"
                  className="rounded-full h-14 w-14 border-white text-white hover:bg-white/20"
                >
                  {playingId === release.id ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{release.title}</h3>
                <p className="text-sm text-gray-400">
                  {release.type} • {release.releaseDate}
                </p>
              </div>
              <Button
                onClick={() => togglePlay(release)}
                variant="ghost"
                size="icon"
                className="text-white hover:text-gray-300 hover:bg-transparent -mt-1 -mr-2"
              >
                {playingId === release.id ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}