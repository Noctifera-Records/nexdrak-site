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
   Music, 
   Calendar, 
   User, 
   ArrowLeft,
   Play,
   Volume2
 } from "lucide-react";
 import { createClient } from "@/lib/supabase/client";
 
 const YouTubePlayer = lazy(() => import('@/components/youtube-player'));
 
 interface Song {
   id: number;
   title: string;
   artist: string;
   stream_url: string;
   cover_image_url?: string;
   type: 'album' | 'single';
   album_name?: string;
   track_number?: number;
   release_date?: string;
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
   updated_at: string;
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

 export default function ClientSongPage({ slug }: { slug: string }) {
   const [song, setSong] = useState<Song | null>(null);
   const [streamingLinks, setStreamingLinks] = useState<StreamingLink[]>([]);
   const [loading, setLoading] = useState(true);
   const [dominantColor, setDominantColor] = useState<string>('#ff0080');
   const [isAlbumView, setIsAlbumView] = useState(false);
   const [albumSongs, setAlbumSongs] = useState<Song[]>([]);
   const supabase = createClient();
 
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
   useEffect(() => {
     const fetchSong = async () => {
       try {
         const slugParam = slug.toLowerCase();
 
         let songData: Song | null = null;
         let error: any = null;
 
         try {
           const { data, error: slugError } = await supabase
             .from('songs')
             .select('*')
             .eq('slug', slugParam)
             .single();
 
           if (!slugError && data) {
             songData = data as Song;
           }
         } catch {}
 
         if (!songData) {
           const searchTerm = slug
             .replace(/([a-z])([A-Z])/g, '$1 $2')
             .replace(/-/g, ' ')
             .toLowerCase()
             .split(' ')
             .map(word => word.charAt(0).toUpperCase() + word.slice(1))
             .join(' ');
 
           const { data, error: titleError } = await supabase
             .from('songs')
             .select('*')
             .ilike('title', searchTerm)
             .single();
 
           songData = (data as Song) || null;
           error = titleError;
 
           if (error || !songData) {
             const { data: albumSongsData, error: albumError } = await supabase
               .from('songs')
               .select('*')
               .ilike('album_name', searchTerm)
               .order('track_number', { ascending: true });
 
             if (albumSongsData && albumSongsData.length > 0 && !albumError) {
               songData = albumSongsData[0] as Song;
               error = null;
               setIsAlbumView(true);
               setAlbumSongs(albumSongsData as Song[]);
             }
           } else {
             setIsAlbumView(false);
             setAlbumSongs([]);
           }
         } else {
           setIsAlbumView(false);
           setAlbumSongs([]);
         }
 
         if (error || !songData) {
           notFound();
           return;
         }
 
         setSong(songData);
 
         const { data: linksData, error: linksError } = await supabase
           .from('streaming_links')
           .select('*')
           .eq('song_id', songData.id)
           .order('is_primary', { ascending: false })
           .order('platform');
 
         if (linksData && !linksError) {
           setStreamingLinks(linksData);
         }
       } catch {
         notFound();
       } finally {
         setLoading(false);
       }
     };
 
     fetchSong();
   }, [slug, supabase]);
 
   const formatDate = (dateString: string) => {
     return new Date(dateString).toLocaleDateString('en-US', {
       year: 'numeric',
       month: 'long',
       day: 'numeric'
     });
   };
 
   const getPrimaryLink = () => {
     return streamingLinks.find(link => link.is_primary) || streamingLinks[0];
   };
 
   const getPlatformInfo = (platform: string) => {
    const platforms = {
      spotify: { name: 'Spotify', color: '#1ed35e', icon: (props?: any) => <BrandIcon name="spotify" /> },
      youtube: { name: 'YouTube Music', color: '#ff0000', icon: (props?: any) => <BrandIcon name="youtube" /> },
      apple_music: { name: 'Apple Music', color: '#fd118f', icon: (props?: any) => <BrandIcon name="apple_music" /> },
      soundcloud: { name: 'SoundCloud', color: '#ff5500', icon: (props?: any) => <BrandIcon name="soundcloud" /> },
      bandcamp: { name: 'Bandcamp', color: '#629aa0', icon: (props?: any) => <BrandIcon name="bandcamp" /> },
      deezer: { name: 'Deezer', color: '#f6ff00', icon: (props?: any) => <BrandIcon name="deezer" /> },
      tidal: { name: 'Tidal', color: '#f2f2f2', icon: (props?: any) => <BrandIcon name="tidal" /> },
      amazon_music: { name: 'Amazon Music', color: '#00b7ff', icon: Music }
    };
     
     return platforms[platform as keyof typeof platforms] || { 
       name: platform.charAt(0).toUpperCase() + platform.slice(1), 
       color: '#6b7280', 
       icon: ExternalLink 
     };
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
 
  const adjustColor = (hex: string, amt: number) => {
    try {
      const clean = hex.replace('#', '').slice(0, 6);
      let r = parseInt(clean.substr(0, 2), 16);
      let g = parseInt(clean.substr(2, 2), 16);
      let b = parseInt(clean.substr(4, 2), 16);
      r = Math.max(0, Math.min(255, r + amt));
      g = Math.max(0, Math.min(255, g + amt));
      b = Math.max(0, Math.min(255, b + amt));
      return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
    } catch {
      return hex;
    }
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
    const seed = hashSeed(slug || 'default');
    const rnd = mulberry32(seed);
    return Array.from({ length: 100 }).map(() => ({
      left: rnd() * 100,
      top: rnd() * 100,
      delay: rnd() * 2 + 0.1,
    }));
  }, [slug]);

  const hexToRgba = (hex: string, alpha: number) => {
    try {
      const clean = hex.replace('#', '').slice(0, 6);
      const r = parseInt(clean.substr(0, 2), 16);
      const g = parseInt(clean.substr(2, 2), 16);
      const b = parseInt(clean.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch {
      return `rgba(255, 255, 255, ${alpha})`;
    }
  };

   useEffect(() => {
     if (song?.cover_image_url) {
       extractDominantColor(song.cover_image_url);
     }
   }, [song?.cover_image_url]);
 
   const generateGradientColors = (baseColor: string) => {
     const hex = baseColor.replace('#', '');
     const r = parseInt(hex.substr(0, 2), 16);
     const g = parseInt(hex.substr(2, 2), 16);
     const b = parseInt(hex.substr(4, 2), 16);
     const colors = [
       `rgba(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}, 0.3)`,
       `rgba(${255 - r}, ${255 - g}, ${255 - b}, 0.2)`,
       `rgba(${Math.min(255, r + 30)}, ${Math.max(0, g - 20)}, ${Math.min(255, b + 20)}, 0.25)`,
       `rgba(${Math.max(0, r - 20)}, ${Math.min(255, g + 30)}, ${Math.max(0, b - 30)}, 0.2)`,
       'rgba(0, 0, 0, 0.7)'
     ];
     return colors;
   };
 
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
 
   if (loading) {
     return (
       <div style={{ minHeight: '100vh', backgroundColor: '#000', color: 'white', padding: '96px 16px 32px 16px' }}>
         <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
           <div style={{ 
             width: '300px', 
             height: '300px', 
             backgroundColor: '#1f2937', 
             borderRadius: '12px', 
             margin: '0 auto 24px auto',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center'
           }}>
             <Music style={{ width: '64px', height: '64px', color: '#6b7280' }} />
           </div>
           <div style={{ height: '32px', backgroundColor: '#1f2937', borderRadius: '8px', marginBottom: '16px' }} />
           <div style={{ height: '20px', backgroundColor: '#1f2937', borderRadius: '8px', width: '60%', margin: '0 auto' }} />
         </div>
       </div>
     );
   }
 
   if (!song) {
     notFound();
   }
 
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 20% 30%, ${generateGradientColors(dominantColor)[0]} 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, ${generateGradientColors(dominantColor)[1]} 0%, transparent 50%),
                         linear-gradient(180deg, ${generateGradientColors(dominantColor)[4]} 0%, transparent 100%)`,
          }}
        />
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        {pixelPoints.map((p, i) => (
          <div
            key={i}
            className="absolute w-2.5 h-2.5 rounded-sm"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              background: `linear-gradient(135deg, ${dominantColor}66, #ff0080)`,
              filter: 'blur(0.6px)',
              animation: `pixelFloat ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-20 pb-8">
        <div className="flex items-center justify-start mb-6">
          <Link href="/music" aria-label="Back to Music">
            <Button className="bg-transparent border border-white/40 text-white hover:bg-white/10 transition-all duration-200 hover:brightness-110 px-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
        </div>

        <Card className="bg-black/50 backdrop-blur-sm border border-white/10">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="flex flex-col items-center md:items-start">
                <div className="w-64 h-64 bg-gray-800 rounded-lg overflow-hidden mb-3">
                  {song.cover_image_url ? (
                    <Image
                      src={song.cover_image_url}
                      alt={song.title}
                      width={256}
                      height={256}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-16 h-16 text-gray-500" />
                    </div>
                  )}
                </div>

                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold mb-1">{song.title}</h1>
                  {song.artist && (
                    <div className="flex items-center justify-center md:justify-start text-gray-400 gap-2">
                      <User className="w-4 h-4" />
                      <span>{song.artist}</span>
                    </div>
                  )}
                  {song.release_date && (
                    <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        Released {formatDate(song.release_date)}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    {(getPrimaryLink() || song.stream_url) && (
                      <Button
                        className="text-white font-semibold px-4 py-2 border border-white/40 transition-all duration-200 hover:brightness-110"
                        style={{ backgroundColor: dominantColor }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = adjustColor(dominantColor, 20); }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = dominantColor; }}
                        asChild
                      >
                        <a
                          href={getPrimaryLink()?.url || song.stream_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Listen
                        </a>
                      </Button>
                    )}
                    <Button
                      className="bg-transparent border border-white/40 text-white px-4 py-2 hover:bg-white/10 transition-all duration-200 hover:brightness-110"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-11/12 mx-auto">
                <h3 className="text-lg font-bold mb-3 text-center md:text-left">Available on</h3>
                <div className="grid gap-2">
                  {streamingLinks.length > 0 ? (
                    <>
                      {streamingLinks.map((link) => {
                        const platformInfo = getPlatformInfo(link.platform);
                        return (
                          <Button
                            key={link.id}
                            className="justify-start px-4 py-3 bg-black/50 hover:bg-black/70 transition-all duration-200 hover:brightness-110 rounded-md"
                            style={{
                              border: `1.5px solid ${platformInfo.color}`,
                              color: '#ffffff',
                              backgroundColor: 'rgba(0,0,0,0.5)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hexToRgba(platformInfo.color, 0.18); }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'; }}
                            asChild
                          >
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Listen to ${song.title} on ${platformInfo.name}`}
                            >
                              <platformInfo.icon className="w-4 h-4 mr-2" style={{ color: '#ffffff' }} />
                              <span className="mr-2">{platformInfo.name}</span>
                              {link.is_primary && <span className="ml-2 text-emerald-400">Primary</span>}
                              <ExternalLink className="w-4 h-4 ml-auto" />
                            </a>
                          </Button>
                        );
                      })}
                      {song.stream_url && (
                        <Button
                          className="justify-start px-4 py-3 bg-black/40 hover:bg-black/60 transition-all duration-200 hover:brightness-110 rounded-md border border-white/40 text-white"
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)'; }}
                          asChild
                        >
                          <a
                            href={song.stream_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Listen to ${song.title} on other platforms`}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Others
                            <ExternalLink className="w-4 h-4 ml-auto" />
                          </a>
                        </Button>
                      )}
                    </>
                  ) : (
                    song.stream_url && (
                      <Button className="justify-start px-4 py-3 bg-black/40 hover:bg-black/60 transition-all duration-200 hover:brightness-110 rounded-md border border-white/40 text-white" asChild>
                        <a href={song.stream_url} target="_blank" rel="noopener noreferrer" aria-label={`Listen to ${song.title}`}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Listen
                          <ExternalLink className="w-4 h-4 ml-auto" />
                        </a>
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {getYouTubeEmbedId() && (
          <Card className="bg-black/50 backdrop-blur-sm border border-white/10 mt-6">
            <CardContent className="p-6">
              <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                <Suspense fallback={<div className="h-52 bg-gray-800 rounded" />}>
                  <YouTubePlayer 
                    videoId={getYouTubeEmbedId() || ''} 
                    title={`${song?.title} - ${song?.artist || ''}`} 
                    dominantColor={dominantColor} 
                  />
                </Suspense>
              </div>
              <div className="flex justify-end mt-3">
                <Button className="bg-transparent border border-white/40 text-white px-3 py-2 text-xs hover:bg-white/10 transition-all duration-200 hover:brightness-110" asChild>
                  <a
                    href={`https://www.youtube.com/watch?v=${getYouTubeEmbedId()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Watch ${song.title} on YouTube`}
                  >
                    <ExternalLink className="w-3 h-3 mr-1.5" />
                    Watch on YouTube
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isAlbumView && albumSongs.length > 1 && (
          <Card className="bg-black/50 backdrop-blur-sm border border-white/10 mt-6">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Album Tracklist - {song?.album_name}</h3>
              <div className="flex flex-col gap-2">
                {albumSongs.map((track, index) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between px-4 py-3 rounded bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-white/10 text-white rounded px-2 text-xs font-semibold min-w-6 text-center">
                        {track.track_number || index + 1}
                      </span>
                      <div>
                        <p className={track.id === song?.id ? 'font-semibold text-white' : 'text-gray-200'}>
                          {track.title}
                        </p>
                        {track.id === song?.id && (
                          <p className="text-xs" style={{ color: dominantColor }}>
                            Now Playing
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {track.id === song?.id && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dominantColor }} />
                      )}
                      <Button className="bg-transparent border border-white/40 text-white px-3 py-2 text-xs hover:bg-white/10 transition-all duration-200 hover:brightness-110" asChild>
                        <a
                          href={getPrimaryLink()?.url || track.stream_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Listen to ${track.title}`}
                        >
                          <ExternalLink className="w-3 h-3 mr-1.5" />
                          Listen
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <style jsx>{`
          @keyframes pixelFloat {
            0%,100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
            50% { transform: translate(-50%, -52%) scale(1.1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
 }
