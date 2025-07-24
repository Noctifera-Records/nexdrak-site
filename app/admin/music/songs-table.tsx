'use client';

import Image from 'next/image';
import { Edit, Trash2, ExternalLink, Music, Disc, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface SongsTableProps {
  songs: Song[];
  onEdit: (song: Song) => void;
  onDelete: (id: number) => void;
}

export function SongsTable({ songs, onEdit, onDelete }: SongsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: 'album' | 'single') => {
    return type === 'album' ? <Disc className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />;
  };

  const getTypeColor = (type: 'album' | 'single') => {
    return type === 'album' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (songs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay canciones registradas.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <Card>
          <CardHeader>
            <CardTitle>Canciones ({songs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Portada</th>
                    <th className="text-left p-2">Título</th>
                    <th className="text-left p-2">Artista</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-left p-2">Álbum/Track</th>
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((song) => (
                    <tr key={song.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-2">
                        <div className="w-12 h-12 relative bg-gray-200 rounded">
                          {song.cover_image_url ? (
                            <Image
                              src={song.cover_image_url}
                              alt={song.title}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Music className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <p className="font-medium">{song.title}</p>
                      </td>
                      <td className="p-2">
                        <p className="text-gray-600">{song.artist}</p>
                      </td>
                      <td className="p-2">
                        <Badge className={getTypeColor(song.type)}>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(song.type)}
                            {song.type === 'album' ? 'Álbum' : 'Single'}
                          </div>
                        </Badge>
                      </td>
                      <td className="p-2">
                        {song.type === 'album' && song.album_name ? (
                          <div>
                            <p className="font-medium text-sm">{song.album_name}</p>
                            {song.track_number && (
                              <p className="text-xs text-gray-500">Track #{song.track_number}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-2 text-sm text-gray-500">
                        {song.release_date ? formatDate(song.release_date) : formatDate(song.created_at)}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a 
                              href={song.stream_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title="Escuchar canción"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(song)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(song.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {songs.map((song) => (
          <Card key={song.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 relative bg-gray-200 rounded flex-shrink-0">
                  {song.cover_image_url ? (
                    <Image
                      src={song.cover_image_url}
                      alt={song.title}
                      fill
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Music className="h-8 w-8" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium truncate">{song.title}</h3>
                      <p className="text-sm text-gray-600">{song.artist}</p>
                    </div>
                    <Badge className={getTypeColor(song.type)}>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(song.type)}
                        {song.type === 'album' ? 'Álbum' : 'Single'}
                      </div>
                    </Badge>
                  </div>
                  
                  {song.type === 'album' && song.album_name && (
                    <div className="mb-2">
                      <p className="text-sm font-medium">{song.album_name}</p>
                      {song.track_number && (
                        <p className="text-xs text-gray-500">Track #{song.track_number}</p>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mb-3">
                    {song.release_date ? formatDate(song.release_date) : formatDate(song.created_at)}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(song)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(song.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}