'use client';

import { useState, useEffect, Suspense, lazy, useMemo } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ExternalLink, 
  Share2, 
  Calendar, 
  User, 
  ArrowLeft,
  Volume2
} from "lucide-react";
import Music from "lucide-react/dist/esm/icons/music";
import Play from "lucide-react/dist/esm/icons/play";

const YouTubePlayer = lazy(() => import('@/components/youtube-player'));

interface Song {
  id: number;
  title: string;
  artist: string;
  stream_url: string;
  cover_image_url?: string;
  type: 'album' | 'single';
  album_name?: string;
  release_date?: string;
  track_number?: number;
  created_at: string;
  youtube_embed_id?: string;
  slug?: string;
}

interface StreamingLink {
  id: number;
  song_id: number;
  platform: string;
  url: string;
  is_primary: boolean;
  created_at: string;
}

interface ClientSongPageProps {
  song: Song;
  streamingLinks: StreamingLink[];
  isAlbumView: boolean;
  albumSongs: Song[];
}

const BrandIcon = ({ name, ...props }: { name: string } & React.HTMLAttributes<HTMLElement>) => {
  const map: Record<string, string> = {
    spotify: "fa-brands fa-spotify",
    youtube: "fa-brands fa-youtube",
    soundcloud: "fa-brands fa-soundcloud",
    deezer: "fa-brands fa-deezer",
    bandcamp: "fa-brands fa-bandcamp",
    apple_music: "fa-brands fa-apple",
  };
  if (name === "tidal") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        className={props.className || ''}
        style={props.style}
        aria-hidden="true"
      >
        <g fill="currentColor">
          <path d="M6 8 L8 6 L10 8 L8 10 Z" />
          <path d="M12 8 L14 6 L16 8 L14 10 Z" />
          <path d="M9 11 L11 9 L13 11 L11 13 Z" />
          <path d="M15 11 L17 9 L19 11 L17 13 Z" />
        </g>
      </svg>
    );
  }
  const cls = map[name] || "fa-solid fa-link";
  return <i className={`${cls} text-[16px] ${props.className || ''}`} aria-hidden="true" style={props.style} />;
};

const PLATFORMS_CONFIG = {
  spotify: { name: 'Spotify', color: '#1ed35e', icon: (props?: any) => <BrandIcon name="spotify" /> },
  youtube: { name: 'YouTube Music', color: '#ff0000', icon: (props?: any) => <BrandIcon name="youtube" /> },
  apple_music: { name: 'Apple Music', color: '#fd118f', icon: (props?: any) => <BrandIcon name="apple_music" /> },
  soundcloud: { name: 'SoundCloud', color: '#ff5500', icon: (props?: any) => <BrandIcon name="soundcloud" /> },
  bandcamp: { name: 'Bandcamp', color: '#629aa0', icon: (props?: any) => <BrandIcon name="bandcamp" /> },
  deezer: { name: 'Deezer', color: '#f6ff00', icon: (props?: any) => <BrandIcon name="deezer" /> },
  tidal: { name: 'Tidal', color: '#f2f2f2', icon: (props?: any) => <BrandIcon name="tidal" /> },
  amazon_music: { name: 'Amazon Music', color: '#00b7ff', icon: Music }
};

const getPlatformInfo = (platform: string) => {
  return PLATFORMS_CONFIG[platform as keyof typeof PLATFORMS_CONFIG] || { 
    name: platform.charAt(0).toUpperCase() + platform.slice(1), 
    color: '#6b7280', 
    icon: ExternalLink 
  };
};

export default function ClientSongPage({ song, streamingLinks, isAlbumView, albumSongs }: ClientSongPageProps) {
  const [dominantColor, setDominantColor] = useState<string>('#ff0080');

  const getContrastColor = (hex: string) => {
    try {
      const clean = hex.replace('#', '').slice(0, 6);
      const r = parseInt(clean.substr(0, 2), 16);
      const g = parseInt(clean.substr(2, 2), 16);
      const b = parseInt(clean.substr(4, 2), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
      return luminance > 186 ? '#000' : '#fff';
    } catch {
      return '#fff';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getPrimaryLink = () => {
    return streamingLinks.find(link => link.is_primary) || streamingLinks[0];
  };

  const extractDominantColor = (imageUrl: string) => {
    if (!imageUrl) return;
    const img = new (window as any).Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const colorCounts: { [key: string]: number } = {};
        const step = 4;
        for (let i = 0; i < data.length; i += step * 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const alpha = data[i + 3];
          if (alpha < 128) continue;
          const rGroup = Math.floor(r / 32) * 32;
          const gGroup = Math.floor(g / 32) * 32;
          const bGroup = Math.floor(b / 32) * 32;
          const key = `${rGroup},${gGroup},${bGroup}`;
          colorCounts[key] = (colorCounts[key] || 0) + 1;
        }
        let dominant = '#6b7280';
        let maxCount = 0;
        for (const key in colorCounts) {
          if (colorCounts[key] > maxCount) {
            maxCount = colorCounts[key];
            const [r, g, b] = key.split(',').map(Number);
            dominant = `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
          }
        }
        setDominantColor(dominant);
      } catch {}
    };
    img.src = imageUrl;
  };

  // Deterministic PRNG to avoid hydration mismatches
  const hashSeed = (str: string) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  const mulberry32 = (a: number) => {
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };
  const pixelPoints = useMemo(() => {
    const seed = hashSeed(song.slug || song.title || 'default');
    const rnd = mulberry32(seed);
    return Array.from({ length: 100 }).map(() => ({
      left: rnd() * 100,
      top: rnd() * 100,
      delay: rnd() * 2 + 0.1,
    }));
  }, [song.slug, song.title]);

  useEffect(() => {
    if (song?.cover_image_url) {
      extractDominantColor(song.cover_image_url);
    }
  }, [song?.cover_image_url]);

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const getYouTubeEmbedId = (): string | null => {
    if (song?.youtube_embed_id) {
      return song.youtube_embed_id;
    }
    const youtubeLink = streamingLinks.find(link => link.platform === 'youtube');
    if (youtubeLink) {
      return extractYouTubeId(youtubeLink.url);
    }
    if (song?.stream_url) {
      return extractYouTubeId(song.stream_url);
    }
    return null;
  };

  const handleShare = async () => {
    if (!song) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${song.title} by ${song.artist}`,
          text: `Listen to ${song.title} by ${song.artist}`,
          url: window.location.href,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard");
      } catch {
        alert("Could not share the link");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Gradient based on dominant color */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${dominantColor}, transparent 70%)`
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-20 pb-8">
        <div className="flex items-center justify-start mb-6">
          <Link href="/music" aria-label="Back to Music">
            <Button variant="ghost" className="hover:bg-accent hover:text-accent-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col items-center md:items-start w-full">
                <div className="relative w-full max-w-[300px] aspect-square bg-muted rounded-lg overflow-hidden mb-6 shadow-xl">
                  {song.cover_image_url ? (
                    <Image
                      src={song.cover_image_url}
                      alt={song.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="text-center md:text-left w-full">
                  <h1 className="text-3xl font-bold mb-2 text-foreground">{song.title}</h1>
                  {song.artist && (
                    <div className="flex items-center justify-center md:justify-start text-muted-foreground gap-2 mb-2">
                      <User className="w-4 h-4" />
                      <span>{song.artist}</span>
                    </div>
                  )}
                  {song.release_date && (
                    <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Released {formatDate(song.release_date)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {(getPrimaryLink() || song.stream_url) && (
                      <Button
                        className="font-semibold px-6 transition-all duration-200 hover:brightness-110 hover:scale-105 shadow-lg"
                        style={{ 
                          backgroundColor: dominantColor,
                          color: getContrastColor(dominantColor)
                        }}
                        asChild
                      >
                        <a
                          href={getPrimaryLink()?.url || song.stream_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Listen Now
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="hover:bg-accent"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <h3 className="text-lg font-bold mb-4 text-center md:text-left text-foreground">Available on</h3>
                <div className="grid gap-3">
                  {streamingLinks.length > 0 ? (
                    <>
                      {streamingLinks.map((link) => {
                        const platformInfo = getPlatformInfo(link.platform);
                        return (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent transition-all duration-200"
                            aria-label={`Listen to ${song.title} on ${platformInfo.name}`}
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: platformInfo.color + '20' }}
                              >
                                <platformInfo.icon 
                                  className="w-4 h-4" 
                                  style={{ color: platformInfo.color }} 
                                />
                              </div>
                              <span className="font-medium text-foreground">{platformInfo.name}</span>
                              {link.is_primary && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                  Primary
                                </span>
                              )}
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                          </a>
                        );
                      })}
                      {song.stream_url && !streamingLinks.some(l => l.url === song.stream_url) && (
                        <a
                          href={song.stream_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <span className="font-medium text-foreground">Other Platform</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                        </a>
                      )}
                    </>
                  ) : (
                    song.stream_url && (
                      <a
                        href={song.stream_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium text-foreground">Listen</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                      </a>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {getYouTubeEmbedId() && (
          <Card className="bg-card/50 backdrop-blur-sm border border-border mt-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative w-full aspect-video bg-black">
                <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse" />}>
                  <YouTubePlayer 
                    videoId={getYouTubeEmbedId() || ''} 
                    title={`${song?.title} - ${song?.artist || ''}`} 
                    dominantColor={dominantColor} 
                  />
                </Suspense>
              </div>
              <div className="p-4 flex justify-end bg-card border-t border-border">
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={`https://www.youtube.com/watch?v=${getYouTubeEmbedId()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BrandIcon name="youtube" className="w-4 h-4 mr-2 text-red-500" />
                    Watch on YouTube
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isAlbumView && albumSongs.length > 1 && (
          <Card className="bg-card/50 backdrop-blur-sm border border-border mt-6">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 text-foreground">Album Tracklist - {song?.album_name}</h3>
              <div className="flex flex-col gap-2">
                {[...albumSongs]
                  .sort((a, b) => (a.track_number || 0) - (b.track_number || 0))
                  .map((track, index) => {
                    const isCurrent = track.id === song?.id;
                    return (
                      <div
                        key={track.id}
                        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                          isCurrent 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'bg-card hover:bg-accent border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`text-sm font-mono w-6 text-center ${isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                            {track.track_number || index + 1}
                          </span>
                          <div>
                            <p className={`font-medium ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                              {track.title}
                            </p>
                            {isCurrent && (
                              <p className="text-xs text-primary/80">
                                Now Playing
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isCurrent && (
                            <div className="flex gap-0.5 h-3 items-end mr-2">
                              <div className="w-1 bg-primary animate-[music-bar_1s_ease-in-out_infinite]" style={{ height: '60%' }}></div>
                              <div className="w-1 bg-primary animate-[music-bar_1.1s_ease-in-out_infinite_0.1s]" style={{ height: '100%' }}></div>
                              <div className="w-1 bg-primary animate-[music-bar_1.2s_ease-in-out_infinite_0.2s]" style={{ height: '40%' }}></div>
                            </div>
                          )}
                          
                          {!isCurrent && (
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                              <Link href={`/${track.slug}`} aria-label={`Go to ${track.title}`}>
                                <Play className="w-4 h-4 text-muted-foreground" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <style jsx global>{`
        @keyframes music-bar {
          0%, 100% { height: 40%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
