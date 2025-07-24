'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { ExternalLink, Share2, Music, Calendar, Disc, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface Release {
  id: number;
  title: string;
  release_date: string;
  cover_image_url: string | null;
  stream_url: string | null;
  created_at: string;
}

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

interface Album {
  name: string;
  songs: Song[];
  cover_image_url?: string;
  artist?: string;
  release_date?: string;
}

export default function MusicPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [singles, setSingles] = useState<Song[]>([]);
  const [activeTab, setActiveTab] = useState<'albums' | 'singles'>('albums');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const { data: songsData, error } = await supabase
          .from('songs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching songs:', error);
          return;
        }

        if (songsData) {
          setSongs(songsData);
          
          // Separar singles
          const singlesData = songsData.filter(song => song.type === 'single');
          setSingles(singlesData);
          
          // Agrupar álbumes
          const albumsMap = new Map<string, Album>();
          songsData
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
          
          // Ordenar canciones de cada álbum por track_number
          albumsMap.forEach(album => {
            album.songs.sort((a, b) => (a.track_number || 0) - (b.track_number || 0));
          });
          
          setAlbums(Array.from(albumsMap.values()));
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMusic();
  }, [supabase]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async (item: Song | Album) => {
    const title = 'name' in item ? item.name : item.title;
    const url = 'name' in item ? window.location.href : item.stream_url;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `¡Escucha ${title} de NexDrak!`,
          text: `Descubre ${title}.`,
          url: url || window.location.href,
        });
        console.log("¡Compartido exitosamente!");
      } catch (error) {
        console.log("Error al compartir", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url || window.location.href);
        alert("Enlace copiado al portapapeles");
      } catch (error) {
        alert("No se pudo compartir el enlace");
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 mt-10">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">MUSIC</h1>
          <p className="text-gray-300">Cargando discografía...</p>
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
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">MUSIC</h1>
        <p className="text-gray-300">Explora la discografía completa de NexDrak, desde álbumes hasta sencillos.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 border border-white/20">
          <button
            onClick={() => setActiveTab('albums')}
            className={`px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'albums'
                ? 'bg-white text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Disc className="h-4 w-4" />
            Álbumes
          </button>
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
          </button>
        </div>
      </div>

      {/* Albums Tab */}
      {activeTab === 'albums' && (
        <div className="mb-16">
          {albums.length > 0 ? (
            <div className="space-y-8">
              {albums.map((album, index) => (
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
                                    href={song.stream_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Escuchar
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
              <p className="text-gray-400 text-lg">No hay álbumes disponibles</p>
              <p className="text-gray-500 text-sm">Los álbumes aparecerán aquí cuando se agreguen</p>
            </div>
          )}
        </div>
      )}

      {/* Singles Tab */}
      {activeTab === 'singles' && (
        <div className="mb-16">
          {singles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {singles.map((song) => (
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
                          href={song.stream_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-5 w-5 mr-2" />
                          ESCUCHAR
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
                            href={song.stream_url} 
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
              <p className="text-gray-400 text-lg">No hay singles disponibles</p>
              <p className="text-gray-500 text-sm">Los singles aparecerán aquí cuando se agreguen</p>
            </div>
          )}
        </div>
      )}

      {/* Sección de licenciamiento */}
      <div className="max-w-2xl mx-auto p-8 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4">LICENCIAMIENTO</h2>
        <p className="text-gray-300 mb-6">
          ¿Interesado en licenciar la música de NexDrak para tu proyecto, película o comercial? 
          Ponte en contacto con nuestro equipo de licenciamiento.
        </p>
        <Button className="bg-white hover:bg-gray-200 text-black">
          CONTACTAR PARA LICENCIAS
        </Button>
      </div>
    </div>
  );
}