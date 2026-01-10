'use client';



import { useState, useEffect, use, Suspense, lazy } from "react";
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

// Lazy load YouTube player component
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

interface SongPageProps {
  params: Promise<{
    song: string;
  }>;
}

export default function SongPage({ params }: SongPageProps) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  const [song, setSong] = useState<Song | null>(null);
  const [streamingLinks, setStreamingLinks] = useState<StreamingLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [dominantColor, setDominantColor] = useState<string>('#ff0080');
  const [isAlbumView, setIsAlbumView] = useState(false);
  const [albumSongs, setAlbumSongs] = useState<Song[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchSong = async () => {
      try {
        // Convert URL slug back to readable format
        const searchTerm = resolvedParams.song
          .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
          .replace(/-/g, ' ') // Replace hyphens with spaces
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        // First, try to find by song title
        let { data: songData, error } = await supabase
          .from('songs')
          .select('*')
          .ilike('title', searchTerm)
          .single();

        // If not found by title, try to find by album name
        if (error || !songData) {
          const { data: albumSongs, error: albumError } = await supabase
            .from('songs')
            .select('*')
            .ilike('album_name', searchTerm)
            .order('track_number', { ascending: true });

          if (albumSongs && albumSongs.length > 0 && !albumError) {
            // If found by album name, use the first track of the album
            songData = albumSongs[0];
            error = null;
            setIsAlbumView(true);
            setAlbumSongs(albumSongs);
          }
        } else {
          setIsAlbumView(false);
          setAlbumSongs([]);
        }

        if (error || !songData) {
          // Neither song nor album found - redirect to 404 silently
          notFound();
          return;
        }

        setSong(songData);

        // Fetch streaming links for this song
        const { data: linksData, error: linksError } = await supabase
          .from('streaming_links')
          .select('*')
          .eq('song_id', songData.id)
          .order('is_primary', { ascending: false })
          .order('platform');

        if (linksData && !linksError) {
          setStreamingLinks(linksData);
        }

      } catch (error) {
        // Any other error - redirect to 404 silently
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchSong();
  }, [resolvedParams.song, supabase]);

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
      spotify: { name: 'Spotify', color: '#1ed35eff', icon: Volume2 },
      youtube: { name: 'YouTube Music', color: '#ff0000', icon: Play },
      apple_music: { name: 'Apple Music', color: '#fd118fff', icon: Music },
      soundcloud: { name: 'SoundCloud', color: '#ff5500', icon: Volume2 },
      bandcamp: { name: 'Bandcamp', color: '#629aa0', icon: Music },
      deezer: { name: 'Deezer', color: '#f6ff00ff', icon: Volume2 },
      tidal: { name: 'Tidal', color: '#f2f2f2ff', icon: Volume2 },
      amazon_music: { name: 'Amazon Music', color: '#00b7ffff', icon: Music }
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
        
        // Sample pixels and find dominant colors (multiple colors for gradient)
        const colorCounts: { [key: string]: number } = {};
        const step = 4; // Sample every 4th pixel for performance
        
        for (let i = 0; i < data.length; i += step * 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const alpha = data[i + 3];
          
          // Skip transparent pixels
          if (alpha < 128) continue;
          
          // Group similar colors
          const rGroup = Math.floor(r / 32) * 32;
          const gGroup = Math.floor(g / 32) * 32;
          const bGroup = Math.floor(b / 32) * 32;
          
          const colorKey = `${rGroup},${gGroup},${bGroup}`;
          colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
        }
        
        // Get top 3 colors for gradient
        const sortedColors = Object.entries(colorCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3);
        
        if (sortedColors.length > 0) {
          const [r, g, b] = sortedColors[0][0].split(',').map(Number);
          const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          setDominantColor(hexColor);
        }
      } catch (error) {
        console.log('Could not extract color from image');
      }
    };
    
    img.onerror = () => {
      console.log('Could not load image for color extraction');
    };
    
    img.src = imageUrl;
  };

  // Extract color when song loads
  useEffect(() => {
    if (song?.cover_image_url) {
      extractDominantColor(song.cover_image_url);
    }
  }, [song?.cover_image_url]);

  // Generate complementary colors for gradient
  const generateGradientColors = (baseColor: string) => {
    // Convert hex to RGB
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Generate complementary and analogous colors
    const colors = [
      // Original color (darker)
      `rgba(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}, 0.3)`,
      // Complementary color
      `rgba(${255 - r}, ${255 - g}, ${255 - b}, 0.2)`,
      // Analogous color 1
      `rgba(${Math.min(255, r + 30)}, ${Math.max(0, g - 20)}, ${Math.min(255, b + 20)}, 0.25)`,
      // Analogous color 2
      `rgba(${Math.max(0, r - 20)}, ${Math.min(255, g + 30)}, ${Math.max(0, b - 30)}, 0.2)`,
      // Dark overlay for readability
      'rgba(0, 0, 0, 0.7)'
    ];
    
    return colors;
  };

  // Extract YouTube video ID from URL
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

  // Get YouTube embed ID - priority: youtube_embed_id > YouTube streaming link > stream_url if YouTube
  const getYouTubeEmbedId = (): string | null => {
    // First priority: dedicated youtube_embed_id field
    if (song?.youtube_embed_id) {
      return song.youtube_embed_id;
    }
    
    // Second priority: YouTube streaming link
    const youtubeLink = streamingLinks.find(link => link.platform === 'youtube');
    if (youtubeLink) {
      return extractYouTubeId(youtubeLink.url);
    }
    
    // Third priority: stream_url if it's a YouTube URL
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
      } catch (error) {
        // User cancelled sharing or other error - fail silently
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard");
      } catch (error) {
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
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: 'white', position: 'relative', overflow: 'hidden' }}>
      {/* Dynamic Animated Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0
      }}>
        {/* Base gradient background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 30%, ${generateGradientColors(dominantColor)[0]} 0%, transparent 50%), 
                       radial-gradient(circle at 80% 20%, ${generateGradientColors(dominantColor)[1]} 0%, transparent 50%), 
                       radial-gradient(circle at 40% 80%, ${generateGradientColors(dominantColor)[2]} 0%, transparent 50%), 
                       radial-gradient(circle at 90% 70%, ${generateGradientColors(dominantColor)[3]} 0%, transparent 50%), 
                       linear-gradient(135deg, ${generateGradientColors(dominantColor)[4]} 0%, rgba(0,0,0,0.9) 100%)`,
          transition: 'background 1s ease',
          animation: 'backgroundShift 20s ease-in-out infinite'
        }} />
        
        {/* Animated floating orbs */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, ${dominantColor}20 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float1 15s ease-in-out infinite',
          transition: 'background 1s ease'
        }} />
        
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '250px',
          height: '250px',
          background: `radial-gradient(circle, ${dominantColor}15 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'float2 18s ease-in-out infinite reverse',
          transition: 'background 1s ease'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${dominantColor}25 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(35px)',
          animation: 'float3 12s ease-in-out infinite',
          transition: 'background 1s ease'
        }} />
        
        {/* Subtle noise texture overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          animation: 'noise 8s steps(10) infinite'
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '96px 16px 32px 16px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Back Button */}
          <Link href="/music" style={{ textDecoration: 'none' }}>
            <Button
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Music
            </Button>
          </Link>

          {/* Main Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
            
            {/* Album Art */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                aspectRatio: '1',
                margin: '0 auto',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: `0 25px 50px -12px ${dominantColor}40`,
                border: `1px solid ${dominantColor}30`,
                transition: 'box-shadow 0.5s ease, border-color 0.5s ease'
              }}>
                {song.cover_image_url ? (
                  <Image
                    src={song.cover_image_url}
                    alt={`${song.title} album cover by ${song.artist}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                    sizes="(max-width: 768px) 100vw, 400px"
                    quality={85}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Music style={{ width: '64px', height: '64px', color: '#6b7280' }} aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>

            {/* Song Info */}
            <div>
              <h1 style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                lineHeight: '1.1'
              }}>
                {song.title}
              </h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <User style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
                <span style={{ fontSize: '20px', color: '#9ca3af' }}>{song.artist}</span>
              </div>

              {song.album_name && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>From the album</span>
                  <p style={{ fontSize: '18px', fontWeight: '600', margin: '4px 0' }}>{song.album_name}</p>
                </div>
              )}

              {song.release_date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
                  <Calendar style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>
                    Released {formatDate(song.release_date)}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                {(getPrimaryLink() || song.stream_url) && (
                  <Button
                    style={{
                      backgroundColor: dominantColor,
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.5s ease'
                    }}
                    asChild
                  >
                    <a 
                      href={getPrimaryLink()?.url || song.stream_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      aria-label={`Listen to ${song.title} by ${song.artist}`}
                    >
                      <Play className="h-5 w-5" aria-hidden="true" />
                      LISTEN NOW
                    </a>
                  </Button>
                )}

                <Button
                  onClick={handleShare}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  aria-label={`Share ${song.title} by ${song.artist}`}
                >
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  Share
                </Button>
              </div>

              {/* Streaming Links */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                  Available on
                </h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {streamingLinks.length > 0 ? (
                    <>
                      {streamingLinks.map((link) => {
                        const platformInfo = getPlatformInfo(link.platform);
                        const IconComponent = platformInfo.icon;
                        
                        return (
                          <Button
                            key={link.id}
                            style={{
                              backgroundColor: 'transparent',
                              border: `1px solid ${platformInfo.color}`,
                              color: platformInfo.color,
                              justifyContent: 'flex-start',
                              padding: '12px 16px'
                            }}
                            asChild
                          >
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              aria-label={`Listen to ${song.title} on ${platformInfo.name}`}
                            >
                              <IconComponent className="h-4 w-4 mr-3" aria-hidden="true" />
                              {platformInfo.name}
                              {link.is_primary && (
                                <span style={{ 
                                  marginLeft: '8px', 
                                  fontSize: '12px', 
                                  opacity: 0.7 
                                }}>
                                  ⭐
                                </span>
                              )}
                              <ExternalLink className="h-4 w-4 ml-auto" aria-hidden="true" />
                            </a>
                          </Button>
                        );
                      })}
                      
                      {/* Add original stream_url as "Others" if it exists */}
                      {song.stream_url && (
                        <Button
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #6b7280',
                            color: '#6b7280',
                            justifyContent: 'flex-start',
                            padding: '12px 16px'
                          }}
                          asChild
                        >
                          <a 
                            href={song.stream_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label={`Listen to ${song.title} on other platforms`}
                          >
                            <ExternalLink className="h-4 w-4 mr-3" aria-hidden="true" />
                            Others
                            <ExternalLink className="h-4 w-4 ml-auto" aria-hidden="true" />
                          </a>
                        </Button>
                      )}
                    </>
                  ) : (
                    // Fallback to old stream_url if no streaming links exist
                    song.stream_url && (
                      <Button
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #6b7280',
                          color: '#6b7280',
                          justifyContent: 'flex-start',
                          padding: '12px 16px'
                        }}
                        asChild
                      >
                        <a 
                          href={song.stream_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          aria-label={`Listen to ${song.title}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-3" aria-hidden="true" />
                          Listen
                          <ExternalLink className="h-4 w-4 ml-auto" aria-hidden="true" />
                        </a>
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <Card style={{ 
            backgroundColor: 'rgba(31, 41, 55, 0.5)', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: '48px'
          }}>
            <CardContent style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                About this track
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>Song Title</span>
                  <p style={{ fontWeight: '600' }}>{song.title}</p>
                </div>
                <div>
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>Type</span>
                  <p style={{ fontWeight: '600', textTransform: 'capitalize' }}>{song.type}</p>
                </div>
                {song.track_number && (
                  <div>
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>Track Number</span>
                    <p style={{ fontWeight: '600' }}>{song.track_number}</p>
                  </div>
                )}
                <div>
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>Added</span>
                  <p style={{ fontWeight: '600' }}>{formatDate(song.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* YouTube Player */}
          {getYouTubeEmbedId() && (
            <Card style={{ 
              backgroundColor: 'rgba(31, 41, 55, 0.5)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginTop: '24px'
            }}>
              <CardContent style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                  Watch on YouTube
                </h3>
                
                <Suspense fallback={
                  <div style={{ 
                    position: 'relative', 
                    width: '100%', 
                    paddingBottom: '56.25%',
                    height: 0,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#000',
                    border: `2px solid ${dominantColor}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{ position: 'absolute', color: 'white' }}>Loading video...</div>
                  </div>
                }>
                  <YouTubePlayer 
                    videoId={getYouTubeEmbedId()!}
                    title={`${song.title} - ${song.artist}`}
                    dominantColor={dominantColor}
                  />
                </Suspense>
                
                <div style={{ 
                  marginTop: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#ff0000',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Play style={{ width: '12px', height: '12px', color: 'white' }} aria-hidden="true" />
                    </div>
                    <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                      Official video on YouTube
                    </span>
                  </div>
                  
                  <Button
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #ff0000',
                      color: '#ff0000',
                      fontSize: '12px',
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    asChild
                  >
                    <a 
                      href={`https://www.youtube.com/watch?v=${getYouTubeEmbedId()}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      aria-label={`Watch ${song.title} on YouTube`}
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      Watch on YouTube
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Album Tracklist - Only show when accessed by album name */}
          {isAlbumView && albumSongs.length > 1 && (
            <Card style={{ 
              backgroundColor: 'rgba(31, 41, 55, 0.5)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginTop: '24px'
            }}>
              <CardContent style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                  Album Tracklist - {song.album_name}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {albumSongs.map((track, index) => (
                    <div 
                      key={track.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '12px 16px', 
                        borderRadius: '8px',
                        backgroundColor: track.id === song.id ? `${dominantColor}20` : 'transparent',
                        border: track.id === song.id ? `1px solid ${dominantColor}50` : '1px solid transparent',
                        marginBottom: '8px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        if (track.id !== song.id) {
                          // Navigate to this track
                          const trackSlug = track.title
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^a-z0-9-]/g, '');
                          window.location.href = `/${trackSlug}`;
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (track.id !== song.id) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (track.id !== song.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ 
                          color: track.id === song.id ? dominantColor : '#9ca3af', 
                          fontWeight: '600',
                          minWidth: '24px',
                          textAlign: 'center'
                        }}>
                          {track.track_number || index + 1}
                        </span>
                        <div>
                          <p style={{ 
                            fontWeight: track.id === song.id ? '600' : '400',
                            color: track.id === song.id ? 'white' : '#e5e7eb',
                            margin: 0
                          }}>
                            {track.title}
                          </p>
                          {track.id === song.id && (
                            <p style={{ 
                              fontSize: '12px', 
                              color: dominantColor, 
                              margin: '4px 0 0 0',
                              fontWeight: '500'
                            }}>
                              Now Playing
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {track.id === song.id && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: dominantColor,
                            borderRadius: '50%',
                            animation: 'pulse 2s infinite'
                          }} />
                        )}
                        <Play style={{ 
                          width: '16px', 
                          height: '16px', 
                          color: track.id === song.id ? dominantColor : '#6b7280'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                  border: '1px solid rgba(59, 130, 246, 0.3)', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#93c5fd'
                }}>
                  💡 You accessed this album by its name. Click on any track to switch to it, or use individual song URLs like /{song.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          
          h1[style*="font-size: 48px"] {
            font-size: 32px !important;
          }
        }
        
        @keyframes backgroundShift {
          0%, 100% { 
            filter: hue-rotate(0deg) brightness(1); 
          }
          25% { 
            filter: hue-rotate(10deg) brightness(1.1); 
          }
          50% { 
            filter: hue-rotate(-5deg) brightness(0.9); 
          }
          75% { 
            filter: hue-rotate(15deg) brightness(1.05); 
          }
        }
        
        @keyframes float1 {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
          }
          25% { 
            transform: translate(30px, -20px) scale(1.1); 
          }
          50% { 
            transform: translate(-20px, 30px) scale(0.9); 
          }
          75% { 
            transform: translate(40px, 10px) scale(1.05); 
          }
        }
        
        @keyframes float2 {
          0%, 100% { 
            transform: translate(0, 0) scale(1) rotate(0deg); 
          }
          33% { 
            transform: translate(-25px, 20px) scale(1.15) rotate(120deg); 
          }
          66% { 
            transform: translate(35px, -15px) scale(0.85) rotate(240deg); 
          }
        }
        
        @keyframes float3 {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
          }
          20% { 
            transform: translate(15px, -25px) scale(1.2); 
          }
          40% { 
            transform: translate(-30px, 10px) scale(0.8); 
          }
          60% { 
            transform: translate(25px, 20px) scale(1.1); 
          }
          80% { 
            transform: translate(-10px, -15px) scale(0.95); 
          }
        }
        
        @keyframes noise {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(-10%, 5%); }
          30% { transform: translate(5%, -10%); }
          40% { transform: translate(-5%, 15%); }
          50% { transform: translate(-10%, 5%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 10%); }
          80% { transform: translate(-15%, 0%); }
          90% { transform: translate(10%, 5%); }
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.5; 
            transform: scale(1.2); 
          }
        }
      `}</style>
    </div>
  );
}