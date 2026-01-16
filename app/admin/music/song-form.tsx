'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SongsService } from '@/lib/supabase/songs-operations';
import { AdminImageUpload } from '@/components/image-upload';
import { RLSErrorHelp } from '@/components/rls-error-help';

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

interface SongFormProps {
  song?: Song | null;
  onClose: () => void;
}

export function SongForm({ song, onClose }: SongFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    stream_url: '',
    cover_image_url: '',
    type: 'single' as 'album' | 'single',
    album_name: '',
    track_number: '',
    release_date: '',
    youtube_embed_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [existingAlbums, setExistingAlbums] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const songsService = new SongsService();

  useEffect(() => {
    fetchExistingAlbums();
    
    if (song) {
      setFormData({
        title: song.title,
        artist: song.artist,
        stream_url: song.stream_url,
        cover_image_url: song.cover_image_url || '',
        type: song.type,
        album_name: song.album_name || '',
        track_number: song.track_number?.toString() || '',
        release_date: song.release_date || '',
        youtube_embed_id: song.youtube_embed_id || '',
        slug: song.slug || ''
      });
    }
  }, [song]);

  const fetchExistingAlbums = async () => {
    try {
      const albums = await songsService.getExistingAlbums();
      setExistingAlbums(albums);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const songData = {
        title: formData.title,
        artist: formData.artist,
        stream_url: formData.stream_url,
        cover_image_url: formData.cover_image_url || null,
        type: formData.type,
        album_name: formData.album_name || null,
        track_number: formData.track_number ? parseInt(formData.track_number) : null,
        release_date: formData.release_date || null,
        youtube_embed_id: formData.youtube_embed_id || null
      };

      if (song) {
        // Update existing song
        await songsService.updateSong(song.id, songData);
      } else {
        // Create new song
        await songsService.createSong(songData);
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving song:', error);
      setError(error.message || 'Error al guardar la canción');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, cover_image_url: imageUrl }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {song ? 'Editar Canción' : 'Agregar Canción'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nombre de la canción"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist">Artista *</Label>
                <Input
                  id="artist"
                  value={formData.artist}
                  onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                  placeholder="Nombre del artista"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stream_url">URL de Streaming *</Label>
              <Input
                id="stream_url"
                type="url"
                value={formData.stream_url}
                onChange={(e) => setFormData(prev => ({ ...prev, stream_url: e.target.value }))}
                placeholder="https://open.spotify.com/track/..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'album' | 'single') => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="album">Álbum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'album' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="album_name">Nombre del Álbum</Label>
                  <Input
                    id="album_name"
                    value={formData.album_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, album_name: e.target.value }))}
                    placeholder="Nombre del álbum"
                    list="existing-albums"
                  />
                  <datalist id="existing-albums">
                    {existingAlbums.map(album => (
                      <option key={album} value={album} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="track_number">Número de Track</Label>
                  <Input
                    id="track_number"
                    type="number"
                    min="1"
                    value={formData.track_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, track_number: e.target.value }))}
                    placeholder="1"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="release_date">Fecha de Lanzamiento</Label>
              <Input
                id="release_date"
                type="date"
                value={formData.release_date}
                onChange={(e) => setFormData(prev => ({ ...prev, release_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube_embed_id">YouTube Video ID</Label>
              <Input
                id="youtube_embed_id"
                value={formData.youtube_embed_id}
                onChange={(e) => setFormData(prev => ({ ...prev, youtube_embed_id: e.target.value }))}
                placeholder="dQw4w9WgXcQ (solo el ID del video)"
              />
              <p className="text-xs text-gray-500">
                Opcional: ID del video de YouTube para mostrar el reproductor embebido. 
                Ejemplo: para https://www.youtube.com/watch?v=dQw4w9WgXcQ usar solo "dQw4w9WgXcQ"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-") }))}
                placeholder="ej: the-cathedral, x-z-am0u-r"
              />
              <p className="text-xs text-gray-500">
                Opcional: Identificador único para la URL. Solo letras minúsculas, números y guiones.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Imagen de Portada</Label>
              <AdminImageUpload
                onImageUpload={handleImageUpload}
                currentImage={formData.cover_image_url}
              />
            </div>

            {error && (
              <div className="space-y-3">
                <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded">
                  {error}
                </div>
                <RLSErrorHelp 
                  error={error} 
                  operation={song ? 'actualizar canción' : 'crear canción'} 
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : (song ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}