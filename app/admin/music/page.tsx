'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SongsTable } from './songs-table';
import { SongForm } from './song-form';
import { StreamingLinksManager } from './streaming-links-manager';
import { getSongs, deleteSong } from './actions';
import { toast } from 'sonner';

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
  streaming_links?: any[];
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getSongs();
      setSongs(data);
      // Extract links from songs data for compatibility with existing components
      const allLinks = data.flatMap((s: Song) => s.streaming_links || []).map((l: any) => ({
          ...l,
          song_id: data.find((s: Song) => s.streaming_links?.some((sl: any) => sl.id === l.id))?.id
      }));
      setStreamingLinks(allLinks);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error loading music');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this song?')) {
      return;
    }

    try {
      await deleteSong(id);
      setSongs(prev => prev.filter(song => song.id !== id));
      toast.success('Song deleted');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error deleting song');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSong(null);
    loadData(); // Refresh the list
  };

  const handleManageLinks = (song: Song) => {
    setManagingLinks(song);
  };

  const handleLinksClose = () => {
    setManagingLinks(null);
    loadData(); // Refresh streaming links
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Music</h1>
        </div>
        <div className="text-center py-8">
          <p>Loading music...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Music</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Song
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
