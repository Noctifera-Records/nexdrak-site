'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { AdminImageUpload } from '@/components/image-upload';

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
    release_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [existingAlbums, setExistingAlbums] = useState<string[]>([]);
  const supabase = createClient();

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
        release_date: song.release_date || ''
      });
    }
  }, [song]);

  const fetchExistingAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('album_name')
        .eq('type', 'album')
        .not('album_name', 'is', null);

      if (error) {
        console.error('Error fetching albums:', error);
        return;
      }

      const albums = [...new Set(data?.map(item => item.album_name).filter(Boolean))];
      setExistingAlbums(albums);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const songData = {
        title: formData.title.trim(),
        artist: formData.artist.trim(),
        stream_url: formData.stream_url.trim(),
        cover_image_url: formData.cover_image_url.trim() || null,
        type: formData.type,
        album_name: formData.type === 'album' ? formData.album_name.trim() || null : null,
        track_number: formData.type === 'album' && formData.track_number ? parseInt(formData.track_number) : null,
        release_date: formData.release_date || null
      };

      let error;

      if (song) {
        // Update existing song
        const result = await supabase
          .from('songs')
          .update(songData)
          .eq('id', song.id);
        error = result.error;
      } else {
        // Create new song
        const result = await supabase
          .from('songs')
          .insert([songData]);
        error = result.error;
      }

      if (error) {
        console.error('Error saving song:', error);
        alert('Error al guardar la canción');
        return;
      }

      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la canción');
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
              <Label>Imagen de Portada</Label>
              <AdminImageUpload
                onImageUpload={handleImageUpload}
                currentImage={formData.cover_image_url}
              />
            </div>

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