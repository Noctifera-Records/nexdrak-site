'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SongsService } from '@/lib/supabase/songs-operations';
import { SongsTable } from './songs-table';
import { SongForm } from './song-form';

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

export default function AdminMusicPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const songsService = new SongsService();

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const data = await songsService.getAllSongs();
      setSongs(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta canción?')) {
      return;
    }

    try {
      await songsService.deleteSong(id);
      setSongs(prev => prev.filter(song => song.id !== id));
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la canción');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSong(null);
    fetchSongs(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Música</h1>
        </div>
        <div className="text-center py-8">
          <p>Cargando canciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Música</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Canción
        </Button>
      </div>

      <SongsTable 
        songs={songs}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <SongForm
          song={editingSong}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}