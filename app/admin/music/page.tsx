'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SongsService } from '@/lib/supabase/songs-operations';
import { SongsTable } from './songs-table';
import { SongForm } from './song-form';
import { StreamingLinksManager } from './streaming-links-manager';

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

export default function AdminMusicPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [streamingLinks, setStreamingLinks] = useState<StreamingLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [managingLinks, setManagingLinks] = useState<Song | null>(null);
  const songsService = new SongsService();

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const data = await songsService.getAllSongs();
      setSongs(data);
      
      // Fetch streaming links
      await fetchStreamingLinks();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStreamingLinks = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('streaming_links')
        .select('*')
        .order('song_id')
        .order('is_primary', { ascending: false });

      if (data && !error) {
        setStreamingLinks(data);
      }
    } catch (error) {
      console.error('Error fetching streaming links:', error);
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

  const handleManageLinks = (song: Song) => {
    setManagingLinks(song);
  };

  const handleLinksClose = () => {
    setManagingLinks(null);
    fetchStreamingLinks(); // Refresh streaming links
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Música</h1>
        </div>
        <div className="text-center py-8">
          <p>Loading songs...</p>
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
        streamingLinks={streamingLinks}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onManageLinks={handleManageLinks}
      />

      {showForm && (
        <SongForm
          song={editingSong}
          onClose={handleFormClose}
        />
      )}

      {managingLinks && (
        <StreamingLinksManager
          song={managingLinks}
          streamingLinks={streamingLinks.filter(link => link.song_id === managingLinks.id)}
          onClose={handleLinksClose}
        />
      )}
    </div>
  );
}