import { createClient, handleSupabaseError, retrySupabaseOperation } from './client-optimized';

export interface Song {
  id?: number;
  title: string;
  artist: string;
  stream_url: string;
  cover_image_url?: string | null;
  type: 'album' | 'single';
  album_name?: string | null;
  track_number?: number | null;
  release_date?: string | null;
  created_at?: string;
}

export class SongsService {
  private supabase = createClient();

  // Get all songs with error handling
  async getAllSongs() {
    return retrySupabaseOperation(async () => {
      const { data, error } = await this.supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(handleSupabaseError(error, 'fetch songs'));
      }

      return data || [];
    });
  }

  // Create a new song with proper validation
  async createSong(songData: Omit<Song, 'id' | 'created_at'>) {
    return retrySupabaseOperation(async () => {
      // Validate required fields
      if (!songData.title?.trim()) {
        throw new Error('El título es requerido');
      }
      
      if (!songData.artist?.trim()) {
        throw new Error('El artista es requerido');
      }
      
      if (!songData.stream_url?.trim()) {
        throw new Error('La URL de streaming es requerida');
      }

      // Validate URL format
      try {
        new URL(songData.stream_url);
      } catch {
        throw new Error('La URL de streaming no es válida');
      }

      // Validate date format if provided
      if (songData.release_date) {
        const date = new Date(songData.release_date);
        if (isNaN(date.getTime())) {
          throw new Error('La fecha de lanzamiento no es válida');
        }
      }

      // Prepare data for insertion
      const cleanData = {
        title: songData.title.trim(),
        artist: songData.artist.trim(),
        stream_url: songData.stream_url.trim(),
        cover_image_url: songData.cover_image_url?.trim() || null,
        type: songData.type,
        album_name: songData.type === 'album' ? songData.album_name?.trim() || null : null,
        track_number: songData.type === 'album' && songData.track_number ? Number(songData.track_number) : null,
        release_date: songData.release_date || null,
      };

      const { data, error } = await this.supabase
        .from('songs')
        .insert([cleanData])
        .select()
        .single();

      if (error) {
        throw new Error(handleSupabaseError(error, 'create song'));
      }

      return data;
    });
  }

  // Update a song with proper validation
  async updateSong(songId: number, updates: Partial<Song>) {
    return retrySupabaseOperation(async () => {
      // Validate required fields if they're being updated
      if (updates.title !== undefined && !updates.title?.trim()) {
        throw new Error('El título es requerido');
      }
      
      if (updates.artist !== undefined && !updates.artist?.trim()) {
        throw new Error('El artista es requerido');
      }
      
      if (updates.stream_url !== undefined && !updates.stream_url?.trim()) {
        throw new Error('La URL de streaming es requerida');
      }

      // Validate URL format if being updated
      if (updates.stream_url) {
        try {
          new URL(updates.stream_url);
        } catch {
          throw new Error('La URL de streaming no es válida');
        }
      }

      // Validate date format if provided
      if (updates.release_date) {
        const date = new Date(updates.release_date);
        if (isNaN(date.getTime())) {
          throw new Error('La fecha de lanzamiento no es válida');
        }
      }

      // Prepare clean data
      const cleanUpdates: any = {};
      
      if (updates.title !== undefined) cleanUpdates.title = updates.title.trim();
      if (updates.artist !== undefined) cleanUpdates.artist = updates.artist.trim();
      if (updates.stream_url !== undefined) cleanUpdates.stream_url = updates.stream_url.trim();
      if (updates.cover_image_url !== undefined) cleanUpdates.cover_image_url = updates.cover_image_url?.trim() || null;
      if (updates.type !== undefined) cleanUpdates.type = updates.type;
      if (updates.album_name !== undefined) cleanUpdates.album_name = updates.album_name?.trim() || null;
      if (updates.track_number !== undefined) cleanUpdates.track_number = updates.track_number ? Number(updates.track_number) : null;
      if (updates.release_date !== undefined) cleanUpdates.release_date = updates.release_date || null;

      const { data, error } = await this.supabase
        .from('songs')
        .update(cleanUpdates)
        .eq('id', songId)
        .select()
        .single();

      if (error) {
        throw new Error(handleSupabaseError(error, 'update song'));
      }

      return data;
    });
  }

  // Delete a song
  async deleteSong(songId: number) {
    return retrySupabaseOperation(async () => {
      const { error } = await this.supabase
        .from('songs')
        .delete()
        .eq('id', songId);

      if (error) {
        throw new Error(handleSupabaseError(error, 'delete song'));
      }

      return true;
    });
  }

  // Get existing albums for autocomplete
  async getExistingAlbums() {
    return retrySupabaseOperation(async () => {
      const { data, error } = await this.supabase
        .from('songs')
        .select('album_name')
        .eq('type', 'album')
        .not('album_name', 'is', null);

      if (error) {
        console.warn('Error fetching albums:', error);
        return [];
      }

      const albums = [...new Set(data?.map(item => item.album_name).filter(Boolean))];
      return albums;
    });
  }
}