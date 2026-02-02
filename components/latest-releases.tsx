"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Play, Pause, ExternalLink, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export interface Song {
  id: number
  title: string
  artist: string
  stream_url: string
  cover_image_url?: string
  type: 'album' | 'single'
  album_name?: string
  track_number?: number
  release_date?: string
  created_at: string
}

interface LatestReleasesProps {
  initialSongs?: Song[]
}

export default function LatestReleases({ initialSongs = [] }: LatestReleasesProps) {
  const [songs, setSongs] = useState<Song[]>(initialSongs)
  const [loading, setLoading] = useState(initialSongs.length === 0)
  const supabase = createClient()

  useEffect(() => {
    if (initialSongs.length > 0) return

    const fetchLatestSongs = async () => {
      try {
        const { data, error } = await supabase
          .from('songs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4)

        if (error) {
          console.error('Error fetching songs:', error)
          return
        }

        setSongs(data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestSongs()
  }, [supabase])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-black/50 backdrop-blur-sm border-white/20 overflow-hidden">
            <div className="aspect-square bg-gray-800 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (songs.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No music available</p>
        <p className="text-gray-500 text-sm">The songs will appear here when they are added.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {songs.map((song) => (
        <Card key={song.id} className="bg-black/50 backdrop-blur-sm border-white/20 overflow-hidden group">
          <div className="relative aspect-square">
            {song.cover_image_url ? (
              <Image
                src={song.cover_image_url}
                alt={song.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <Music className="h-16 w-16 text-gray-600" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-14 w-14 border-white text-white hover:bg-white/20"
                asChild
              >
                <a 
                  href={song.stream_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-6 w-6" />
                </a>
              </Button>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{song.title}</h3>
                <p className="text-sm text-gray-500">{song.artist}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${
                    song.type === 'album' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                  }`}>
                    {song.type === 'album' ? 'Álbum' : 'Single'}
                  </span>
                  {song.album_name && (
                    <span className="text-xs text-gray-400">{song.album_name}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {song.release_date ? formatDate(song.release_date) : formatDate(song.created_at)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-gray-300 hover:bg-transparent -mt-1 -mr-2"
                asChild
              >
                <a 
                  href={song.stream_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}