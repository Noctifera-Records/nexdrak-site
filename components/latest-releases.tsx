"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Release {
  id: number
  title: string
  type: string
  coverArt: string
  releaseDate: string
  audioSrc: string
}

const releases: Release[] = [
  {
    id: 1,
    title: "Neon Pulse",
    type: "Single",
    coverArt: "/img/releases/rede.webp",
    releaseDate: "May 1, 2025",
    audioSrc:
      "./music/dev.mp3",
  },
  {
    id: 2,
    title: "Digital Dreams",
    type: "Album",
    coverArt: "/placeholder.svg?height=400&width=400",
    releaseDate: "March 15, 2025",
    audioSrc:
      "https://cdn.pixabay.com/download/audio/2022/10/25/audio_946f463397.mp3?filename=electronic-future-beats-117997.mp3",
  },
  {
    id: 3,
    title: "Synth Horizon",
    type: "EP",
    coverArt: "/placeholder.svg?height=400&width=400",
    releaseDate: "January 10, 2025",
    audioSrc:
      "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3?filename=background-music-for-documentary-science-film-169615.mp3",
  },
  {
    id: 4,
    title: "Midnight Drive",
    type: "Single",
    coverArt: "/placeholder.svg?height=400&width=400",
    releaseDate: "December 5, 2024",
    audioSrc:
      "https://cdn.pixabay.com/download/audio/2022/08/23/audio_d16737dc28.mp3?filename=electronic-future-beats-122862.mp3",
  },
]

export default function LatestReleases() {
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  // Modify the togglePlay function to handle audio element tracking
  const togglePlay = (release: Release) => {
    if (playingId === release.id) {
      // Currently playing this track, so pause it
      audio?.pause()
      setPlayingId(null)
      setAudio(null)
    } else {
      // Stop current audio if any
      if (audio) {
        audio.pause()
      }

      // Play the new track
      const newAudio = new Audio(release.audioSrc)

      // Mark the audio element as not connected yet
      // @ts-ignore - adding custom property
      newAudio._isConnected = false

      // Add error handling
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
        <Card key={release.id} className="bg-black/50 backdrop-blur-sm border-green-500/20 overflow-hidden group">
          <div className="relative aspect-square">
            <Image
              src={release.coverArt || "/placeholder.svg"}
              alt={release.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                onClick={() => togglePlay(release)}
                variant="outline"
                size="icon"
                className="rounded-full h-14 w-14 border-green-500 text-green-500 hover:bg-green-500/20"
              >
                {playingId === release.id ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
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
                className="text-green-500 hover:text-green-400 hover:bg-transparent -mt-1 -mr-2"
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
