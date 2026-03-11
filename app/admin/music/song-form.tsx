'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createSong, updateSong, getSongs } from './actions';
import { toast } from 'sonner';
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
  youtube_embed_id?: string;
  slug?: string;
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
    youtube_embed_id: '',
    slug: ''
  });
  const [loading, setLoading] = useState(false);
  const [existingAlbums, setExistingAlbums] = useState<string[]>([]);

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
      const songs = await getSongs();
      const albums = Array.from(new Set(songs.filter((s: any) => s.type === 'album' && s.album_name).map((s: any) => s.album_name)));
      setExistingAlbums(albums as string[]);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, cover_image_url: imageUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        youtube_embed_id: formData.youtube_embed_id || null,
        slug: formData.slug || null
      };

      if (song) {
        await updateSong(song.id, songData);
        toast.success('Song updated');
      } else {
        await createSong(songData);
        toast.success('Song created');
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving song:', error);
      toast.error(error.message || 'Error saving song');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {song ? 'Edit Song' : 'Add Song'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Song Title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist">Artist *</Label>
                <Input
                  id="artist"
                  value={formData.artist}
                  onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                  placeholder="Artist Name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stream_url">Streaming URL *</Label>
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
              <Label htmlFor="type">Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'album' | 'single') => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="album">Album</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'album' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="album_name">Album Name</Label>
                  <Input
                    id="album_name"
                    value={formData.album_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, album_name: e.target.value }))}
                    placeholder="Album Name"
                    list="existing-albums"
                  />
                  <datalist id="existing-albums">
                    {existingAlbums.map(album => (
                      <option key={album} value={album} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="track_number">Track Number</Label>
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
              <Label htmlFor="release_date">Release Date</Label>
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
                placeholder="dQw4w9WgXcQ (only the video ID)"
              />
              <p className="text-xs text-gray-500">
                Optional: YouTube video ID for embedded player.
                Example: for https://www.youtube.com/watch?v=dQw4w9WgXcQ use "dQw4w9WgXcQ"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-") }))}
                placeholder="e.g.: the-cathedral"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Unique identifier for the URL. Lowercase letters, numbers, and hyphens only.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <AdminImageUpload
                  onImageUpload={handleImageUpload}
                  currentImage={formData.cover_image_url}
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or use URL</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover_url" className="text-xs">Image URL</Label>
                  <Input 
                    id="cover_url"
                    value={formData.cover_image_url || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, cover_image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (song ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
