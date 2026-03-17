"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Share2, Music, Calendar, Disc, PlayCircle, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

interface MusicClientProps {
  initialSongs: Song[];
  initialLinks: StreamingLink[];
}

export default function MusicClient({ initialSongs, initialLinks }: MusicClientProps) {
  const [activeTab, setActiveTab] = useState<'albums' | 'singles'>('singles');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Process data for Albums
  const albums = (() => {
    const albumsMap = new Map<string, Album>();
    initialSongs
      .filter(song => song.type === 'album' && song.album_name)
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
      // Sort songs by title since track_number doesn't exist
      album.songs.sort((a, b) => a.title.localeCompare(b.title));
    });
    
    return Array.from(albumsMap.values()).sort((a, b) => {
      const ad = a.release_date ? new Date(a.release_date).getTime() : 0;
      const bd = b.release_date ? new Date(b.release_date).getTime() : 0;
      return bd - ad;
    });
  })();

  // Process data for Singles
  const singles = initialSongs.filter(song => song.type === 'single');

  const filteredAlbums = (() => {
    if (!searchQuery.trim()) return albums;
    const query = searchQuery.toLowerCase();
    return albums.map(album => ({
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
  })();

  const filteredSingles = (() => {
    if (!searchQuery.trim()) return singles;
    const query = searchQuery.toLowerCase();
    return singles.filter(song =>
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query)
    );
  })();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPrimaryLinkForSong = (songId: number) => {
    const songLinks = initialLinks.filter(link => link.song_id === songId);
    return songLinks.find(link => link.is_primary) || songLinks[0];
  };

  const handleShare = async (item: Song | Album) => {
    const title = 'name' in item ? item.name : item.title;
    const url = 'name' in item ? window.location.href : (item.stream_url || window.location.href);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Listen to ${title} by NexDrak!`,
          text: `Discover ${title}.`,
          url: url,
        });
      } catch (error) {
        console.log("Error sharing", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        // Could add a toast here
      } catch (error) {
        console.error("Could not share", error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 mt-10 text-foreground">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground dark:text-white">MUSIC</h1>
        <p className="text-muted-foreground dark:text-gray-300 mb-8">Explore NexDrak's complete discography, from albums to singles.</p>
        
        {/* Search Bar */}
        <div className="w-full max-w-[400px] mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search songs, albums, or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 px-10 bg-background/80 dark:bg-gray-800/80 border border-input dark:border-gray-600 rounded-lg text-foreground dark:text-white text-base outline-none focus:border-ring focus:bg-background/90 dark:focus:bg-gray-800/90 transition-all backdrop-blur-md placeholder:text-muted-foreground dark:placeholder:text-gray-400"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-gray-400 pointer-events-none">
              <Search className="h-5 w-5" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-gray-400 bg-transparent border-none cursor-pointer p-1 rounded hover:text-foreground dark:hover:text-white transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-muted/50 dark:bg-black/50 backdrop-blur-sm rounded-lg p-1 border border-border dark:border-white/20 flex">
          <button
            onClick={() => setActiveTab('singles')}
            className={`px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'singles'
                ? 'bg-background dark:bg-white text-foreground dark:text-black shadow-sm'
                : 'text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white'
            }`}
          >
            <PlayCircle className="h-4 w-4" />
            Singles
            {filteredSingles.length > 0 && (
              <span className={`ml-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'singles' 
                  ? 'bg-foreground text-background dark:bg-black dark:text-white' 
                  : 'bg-muted text-foreground dark:bg-white dark:text-black'
              }`}>
                {filteredSingles.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('albums')}
            className={`px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'albums'
                ? 'bg-background dark:bg-white text-foreground dark:text-black shadow-sm'
                : 'text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white'
            }`}
          >
            <Disc className="h-4 w-4" />
            Albums
            {filteredAlbums.length > 0 && (
              <span className={`ml-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'albums' 
                  ? 'bg-foreground text-background dark:bg-black dark:text-white' 
                  : 'bg-muted text-foreground dark:bg-white dark:text-black'
              }`}>
                {filteredAlbums.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Albums Tab */}
      {activeTab === 'albums' && (
        <div className="mb-16">
          {filteredAlbums.length > 0 ? (
            <div className="space-y-8">
              {filteredAlbums.map((album, index) => (
                <Card key={index} className="bg-card/50 dark:bg-black/50 backdrop-blur-sm border-border dark:border-white/20 overflow-hidden shadow-sm dark:shadow-none">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {album.cover_image_url && (
                        <div className="relative w-full lg:w-64 h-64 bg-muted dark:bg-gray-800 rounded-lg overflow-hidden">
                          <Image
                            src={album.cover_image_url}
                            alt={album.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-2 text-foreground dark:text-white">{album.name}</h2>
                        {album.artist && (
                          <p className="text-muted-foreground dark:text-gray-400 mb-2 text-lg">{album.artist}</p>
                        )}
                        {album.release_date && (
                          <div className="flex items-center text-muted-foreground dark:text-gray-500 mb-6">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(album.release_date)}
                          </div>
                        )}
                        <div className="space-y-2">
                          {[...album.songs]
                            .sort((a, b) => (a.track_number || 0) - (b.track_number || 0))
                            .map((song, songIndex) => (
                            <div key={song.id} className="flex items-center justify-between p-3 hover:bg-muted dark:hover:bg-white/5 rounded-lg transition-colors">
                              <div className="flex items-center gap-4">
                                <span className="text-muted-foreground dark:text-gray-500 w-8 text-center">{song.track_number || songIndex + 1}</span>
                                <span className="text-foreground dark:text-white">{song.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShare(song)}
                                  className="text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-white"
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-foreground/50 text-foreground hover:bg-foreground/10 dark:border-white/50 dark:text-white dark:hover:bg-white/20"
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
              <Disc className="h-16 w-16 text-muted-foreground dark:text-gray-600 mx-auto mb-4" />
              <p className="text-muted-foreground dark:text-gray-400 text-lg">
                {searchQuery ? `No albums found for "${searchQuery}"` : 'No albums available'}
              </p>
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
                <Card key={song.id} className="bg-card/50 dark:bg-black/50 backdrop-blur-sm border-border dark:border-white/20 overflow-hidden group hover:border-foreground/40 dark:hover:border-white/40 transition-all shadow-sm dark:shadow-none">
                  <div className="relative aspect-square bg-muted dark:bg-gray-800">
                    {song.cover_image_url ? (
                      <Image
                        src={song.cover_image_url}
                        alt={song.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="h-16 w-16 text-muted-foreground dark:text-gray-600" />
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
                      <h3 className="text-xl font-bold text-foreground dark:text-white group-hover:text-primary dark:group-hover:text-gray-200 transition-colors">
                        {song.title}
                      </h3>
                      
                      {song.artist && (
                        <p className="text-muted-foreground dark:text-gray-400">{song.artist}</p>
                      )}

                      {song.release_date && (
                        <div className="flex items-center text-sm text-muted-foreground/80 dark:text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(song.release_date)}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-foreground/50 text-foreground hover:bg-foreground/10 dark:border-white/50 dark:text-white dark:hover:bg-white/20 flex-1 mr-2"
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
                          className="text-foreground hover:bg-muted dark:text-white dark:hover:bg-white/20"
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
              <PlayCircle className="h-16 w-16 text-muted-foreground dark:text-gray-600 mx-auto mb-4" />
              <p className="text-muted-foreground dark:text-gray-400 text-lg">
                {searchQuery ? `No singles found for "${searchQuery}"` : 'No singles available'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Licensing section */}
      <div className="max-w-2xl mx-auto p-8 bg-card/50 dark:bg-black/50 backdrop-blur-sm border border-border dark:border-white/20 rounded-xl text-center shadow-sm dark:shadow-none">
        <h2 className="text-2xl font-bold mb-4 text-foreground dark:text-white">LICENSING</h2>
        <p className="text-muted-foreground dark:text-gray-300 mb-6">
          Interested in licensing NexDrak's music for your project, film, or commercial? 
          Get in touch with our licensing team.
        </p>
        <Button className="bg-foreground text-background hover:bg-foreground/90 dark:bg-white dark:hover:bg-gray-200 dark:text-black transition-colors">
          CONTACT FOR LICENSING
        </Button>
      </div>
    </div>
  );
}
