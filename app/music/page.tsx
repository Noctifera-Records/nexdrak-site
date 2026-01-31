'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { ExternalLink, Share2, Music, Calendar, Disc, PlayCircle, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

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
}

interface StreamingLink {
  id: number;
  song_id: number;
  platform: string;
  url: string;
  is_primary: boolean;
}

interface Album {
  name: string;
  songs: Song[];
  cover_image_url?: string;
  artist?: string;
  release_date?: string;
}

export default function MusicPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [singles, setSingles] = useState<Song[]>([]);
  const [activeTab, setActiveTab] = useState<'albums' | 'singles'>('singles');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);
  const [filteredSingles, setFilteredSingles] = useState<Song[]>([]);
  const [streamingLinks, setStreamingLinks] = useState<StreamingLink[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [albumsLoaded, setAlbumsLoaded] = useState(false);
  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexdrak.com';

  useEffect(() => {
    const fetchSingles = async () => {
      try {
        const { data: singlesData, error } = await supabase
          .from('songs')
          .select('*')
          .eq('type', 'single')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching singles:', error);
          return;
        }

        if (singlesData) {
          setSingles(singlesData);
          const singleIds = singlesData.map(s => s.id);
          const { data: linksData, error: linksError } = await supabase
            .from('streaming_links')
            .select('*')
            .in('song_id', singleIds)
            .order('is_primary', { ascending: false })
            .order('platform');

          if (linksData && !linksError) {
            setStreamingLinks(linksData);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSingles();
  }, [supabase]);

  const fetchAlbums = async () => {
    if (albumsLoaded || albumsLoading) return;
    setAlbumsLoading(true);
    try {
      const { data: albumSongsData, error } = await supabase
        .from('songs')
        .select('*')
        .eq('type', 'album')
        .order('album_name', { ascending: true })
        .order('track_number', { ascending: true });

      if (error) {
        console.error('Error fetching albums:', error);
        return;
      }

      if (albumSongsData) {
        const albumsMap = new Map<string, Album>();
        albumSongsData
          .filter(song => song.album_name)
          .forEach(song => {
            const albumName = song.album_name!;
            if (!albumsMap.has(albumName)) {
              albumsMap.set(albumName, {
                name: albumName,
                songs: [],
                cover_image_url: song.cover_image_url,
                artist: song.artist,
                release_date: song.release_date
              });
            }
            albumsMap.get(albumName)!.songs.push(song);
          });
        
        albumsMap.forEach(album => {
          album.songs.sort((a, b) => (a.track_number || 0) - (b.track_number || 0));
        });
        
        const albumsArr = Array.from(albumsMap.values());
        setAlbums(albumsArr);

        const albumSongIds = albumSongsData.map(s => s.id);
        if (albumSongIds.length > 0) {
          const { data: linksData, error: linksError } = await supabase
            .from('streaming_links')
            .select('*')
            .in('song_id', albumSongIds)
            .order('is_primary', { ascending: false })
            .order('platform');
          if (linksData && !linksError) {
            setStreamingLinks(prev => {
              const existingIds = new Set(prev.map(l => l.id));
              const merged = [...prev];
              for (const l of linksData) {
                if (!existingIds.has(l.id)) merged.push(l);
              }
              return merged;
            });
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAlbumsLoading(false);
      setAlbumsLoaded(true);
    }
  };

  useEffect(() => {
    if (activeTab === 'albums') {
      fetchAlbums();
    }
  }, [activeTab]);

  // Initialize filtered data when albums/singles are loaded
  useEffect(() => {
    setFilteredAlbums(albums);
    setFilteredSingles(singles);
  }, [albums, singles]);

  // Filter function for search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAlbums(albums);
      setFilteredSingles(singles);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // Filter albums and their songs
    const filteredAlbumsData = albums.map(album => ({
      ...album,
      songs: album.songs.filter(song => 
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
      )
    })).filter(album => 
      album.name.toLowerCase().includes(query) ||
      album.artist?.toLowerCase().includes(query) ||
      album.songs.length > 0
    );

    // Filter singles
    const filteredSinglesData = singles.filter(song =>
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query)
    );

    setFilteredAlbums(filteredAlbumsData);
    setFilteredSingles(filteredSinglesData);

    // Auto-switch to tab with results when searching
    if (searchQuery.trim()) {
      if (filteredSinglesData.length > 0 && filteredAlbumsData.length === 0) {
        setActiveTab('singles');
      } else if (filteredAlbumsData.length > 0 && filteredSinglesData.length === 0) {
        setActiveTab('albums');
      } else if (filteredSinglesData.length > filteredAlbumsData.length) {
        setActiveTab('singles');
      } else if (filteredAlbumsData.length > 0) {
        setActiveTab('albums');
      }
    }
  }, [searchQuery, albums, singles]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPrimaryLinkForSong = (songId: number) => {
    const songLinks = streamingLinks.filter(link => link.song_id === songId);
    return songLinks.find(link => link.is_primary) || songLinks[0];
  };

  const handleShare = async (item: Song | Album) => {
    const title = 'name' in item ? item.name : item.title;
    const url = 'name' in item ? window.location.href : item.stream_url;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Listen to ${title} by NexDrak!`,
          text: `Discover ${title}.`,
          url: url || window.location.href,
        });
        console.log("Shared successfully!");
      } catch (error) {
        console.log("Error sharing", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url || window.location.href);
        alert("Link copied to clipboard");
      } catch (error) {
        alert("Could not share the link");
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 mt-10">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">MUSIC</h1>
          <p className="text-gray-300">Loading discography...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-black/50 backdrop-blur-sm border-white/20">
              <div className="aspect-square bg-gray-800 animate-pulse" />
              <CardContent className="p-4">
                <div className="h-6 bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-700 rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 mt-10">
      {activeTab === 'singles' ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: (searchQuery ? filteredSingles : singles).map((s, i) => ({
                "@type": "MusicRecording",
                position: i + 1,
                name: s.title,
                byArtist: s.artist ? { "@type": "MusicGroup", name: s.artist } : undefined,
                image: s.cover_image_url || undefined,
                datePublished: s.release_date ? new Date(s.release_date).toISOString().slice(0,10) : undefined,
                url: getPrimaryLinkForSong(s.id)?.url || s.stream_url || undefined
              }))
            })
          }}
        />
      ) : (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: (searchQuery ? filteredAlbums : albums).map((a, i) => ({
                "@type": "MusicAlbum",
                position: i + 1,
                name: a.name,
                byArtist: a.artist ? { "@type": "MusicGroup", name: a.artist } : undefined,
                image: a.cover_image_url || undefined,
                datePublished: a.release_date ? new Date(a.release_date).toISOString().slice(0,10) : undefined,
                url: siteUrl + "/music"
              }))
            })
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicCollection",
            name: "Discografía de NexDrak",
            headline: activeTab === 'singles' ? "Singles de NexDrak" : "Álbumes de NexDrak",
            url: siteUrl + "/music",
            publisher: {
              "@type": "Organization",
              name: "NexDrak",
              logo: siteUrl + "/og-image.png"
            },
            hasPart: (activeTab === 'singles'
              ? (searchQuery ? filteredSingles : singles).map((s) => ({
                  "@type": "MusicRecording",
                  name: s.title,
                  byArtist: s.artist ? { "@type": "MusicGroup", name: s.artist } : undefined,
                  image: s.cover_image_url || undefined,
                  datePublished: s.release_date ? new Date(s.release_date).toISOString().slice(0,10) : undefined,
                  url: getPrimaryLinkForSong(s.id)?.url || s.stream_url || undefined
                }))
              : (searchQuery ? filteredAlbums : albums).map((a) => ({
                  "@type": "MusicAlbum",
                  name: a.name,
                  byArtist: a.artist ? { "@type": "MusicGroup", name: a.artist } : undefined,
                  image: a.cover_image_url || undefined,
                  datePublished: a.release_date ? new Date(a.release_date).toISOString().slice(0,10) : undefined,
                  url: siteUrl + "/music"
                }))
            )
          })
        }}
      />
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">MUSIC</h1>
        <p className="text-gray-300 mb-8">Explore NexDrak's complete discography, from albums to singles.</p>
        
        {/* Search Bar */}
        <div style={{ 
          width: '100%', 
          maxWidth: '400px', 
          margin: '0 auto 32px auto'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search songs, albums, or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 40px',
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                border: '1px solid rgba(75, 85, 99, 0.6)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                outline: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = 'rgba(156, 163, 175, 0.8)';
                target.style.backgroundColor = 'rgba(31, 41, 55, 0.9)';
              }}
              onBlur={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
                target.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
              }}
            />
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              pointerEvents: 'none'
            }}>
              <Search className="h-5 w-5" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = 'white'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = '#9ca3af'}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div style={{ 
              fontSize: '14px', 
              color: '#9ca3af', 
              marginTop: '8px', 
              textAlign: 'center' 
            }}>
              Searching for "{searchQuery}"
              {filteredAlbums.length > 0 && filteredSingles.length > 0 && (
                <span style={{ display: 'block', marginTop: '4px', fontSize: '12px' }}>
                  Found in both Albums ({filteredAlbums.length}) and Singles ({filteredSingles.length})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 border border-white/20 flex">
          <button
            onClick={() => setActiveTab('singles')}
            className={`px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'singles'
                ? 'bg-white text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <PlayCircle className="h-4 w-4" />
            Singles
            {searchQuery && filteredSingles.length > 0 && (
              <span style={{
                backgroundColor: activeTab === 'singles' ? '#000' : '#fff',
                color: activeTab === 'singles' ? '#fff' : '#000',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 'bold',
                marginLeft: '4px'
              }}>
                {filteredSingles.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('albums')}
            className={`px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'albums'
                ? 'bg-white text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Disc className="h-4 w-4" />
            Albums
            {searchQuery && filteredAlbums.length > 0 && (
              <span style={{
                backgroundColor: activeTab === 'albums' ? '#000' : '#fff',
                color: activeTab === 'albums' ? '#fff' : '#000',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 'bold',
                marginLeft: '4px'
              }}>
                {filteredAlbums.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Albums Tab */}
      {activeTab === 'albums' && (
        <div className="mb-16">
          {albumsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-black/50 backdrop-blur-sm border-white/20">
                  <div className="aspect-video bg-gray-800 animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-700 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAlbums.length > 0 ? (
            <div className="space-y-8">
              {filteredAlbums.map((album, index) => (
                <Card key={index} className="bg-black/50 backdrop-blur-sm border-white/20 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {album.cover_image_url && (
                        <div className="relative w-full lg:w-64 h-64 bg-gray-800 rounded-lg overflow-hidden">
                          <Image
                            src={album.cover_image_url}
                            alt={album.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-2 text-white">{album.name}</h2>
                        {album.artist && (
                          <p className="text-gray-400 mb-2 text-lg">{album.artist}</p>
                        )}
                        {album.release_date && (
                          <div className="flex items-center text-gray-500 mb-6">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(album.release_date)}
                          </div>
                        )}
                        <div className="space-y-2">
                          {album.songs.map((song) => (
                            <div key={song.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
                              <div className="flex items-center gap-4">
                                <span className="text-gray-500 w-8 text-center">{song.track_number}</span>
                                <span className="text-white">{song.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShare(song)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-white/50 text-white hover:bg-white/20"
                                  asChild
                                >
                                  <a 
                                    href={getPrimaryLinkForSong(song.id)?.url || song.stream_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Listen
                                  </a>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Disc className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              {searchQuery ? (
                <>
                  <p className="text-gray-400 text-lg">No albums found for "{searchQuery}"</p>
                  <p className="text-gray-500 text-sm">Try searching with different keywords</p>
                </>
              ) : (
                <>
                  <p className="text-gray-400 text-lg">No albums available</p>
                  <p className="text-gray-500 text-sm">Albums will appear here when added</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Singles Tab */}
      {activeTab === 'singles' && (
        <div className="mb-16">
          {filteredSingles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSingles.map((song) => (
                <Card key={song.id} className="bg-black/50 backdrop-blur-sm border-white/20 overflow-hidden group hover:border-white/40 transition-all">
                  <div className="relative aspect-square bg-gray-800">
                    {song.cover_image_url ? (
                      <Image
                        src={song.cover_image_url}
                        alt={song.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="h-16 w-16 text-gray-600" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-white text-white hover:bg-white/20"
                        asChild
                      >
                        <a 
                          href={getPrimaryLinkForSong(song.id)?.url || song.stream_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-5 w-5 mr-2" />
                          LISTEN
                        </a>
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-gray-200 transition-colors">
                        {song.title}
                      </h3>
                      
                      {song.artist && (
                        <p className="text-gray-400">{song.artist}</p>
                      )}

                      {song.release_date && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(song.release_date)}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/50 text-white hover:bg-white/20 flex-1 mr-2"
                          asChild
                        >
                          <a 
                            href={getPrimaryLinkForSong(song.id)?.url || song.stream_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            STREAM
                          </a>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(song)}
                          className="text-white hover:bg-white/20"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <PlayCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              {searchQuery ? (
                <>
                  <p className="text-gray-400 text-lg">No singles found for "{searchQuery}"</p>
                  <p className="text-gray-500 text-sm">Try searching with different keywords</p>
                </>
              ) : (
                <>
                  <p className="text-gray-400 text-lg">No singles available</p>
                  <p className="text-gray-500 text-sm">Singles will appear here when added</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Licensing section */}
      <div className="max-w-2xl mx-auto p-8 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4">LICENSING</h2>
        <p className="text-gray-300 mb-6">
          Interested in licensing NexDrak's music for your project, film, or commercial? 
          Get in touch with our licensing team.
        </p>
        <Button className="bg-white hover:bg-gray-200 text-black">
          CONTACT FOR LICENSING
        </Button>
      </div>
    </div>
  );
}
