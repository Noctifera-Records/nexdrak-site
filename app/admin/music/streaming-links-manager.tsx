'use client';

import { useState, useEffect } from 'react';
import { X, Plus, ExternalLink, Trash2, Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

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

interface StreamingLink {
  id: number;
  song_id: number;
  platform: string;
  url: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

interface StreamingLinksManagerProps {
  song: Song;
  streamingLinks: StreamingLink[];
  onClose: () => void;
}

const PLATFORMS = [
  { value: 'spotify', label: 'Spotify', color: '#1db954' },
  { value: 'youtube', label: 'YouTube Music', color: '#ff0000' },
  { value: 'apple_music', label: 'Apple Music', color: '#fa57c1' },
  { value: 'soundcloud', label: 'SoundCloud', color: '#ff5500' },
  { value: 'bandcamp', label: 'Bandcamp', color: '#629aa0' },
  { value: 'deezer', label: 'Deezer', color: '#ff0092' },
  { value: 'tidal', label: 'Tidal', color: '#000000' },
  { value: 'amazon_music', label: 'Amazon Music', color: '#ff9900' }
];

export function StreamingLinksManager({ song, streamingLinks, onClose }: StreamingLinksManagerProps) {
  const [links, setLinks] = useState<StreamingLink[]>(streamingLinks);
  const [newLink, setNewLink] = useState({ platform: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    setLinks(streamingLinks);
  }, [streamingLinks]);

  const handleAddLink = async () => {
    if (!newLink.platform || !newLink.url) {
      setError('Platform and URL are required');
      return;
    }

    // Check if platform already exists
    if (links.some(link => link.platform === newLink.platform)) {
      setError('This platform already exists for this song');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('streaming_links')
        .insert({
          song_id: song.id,
          platform: newLink.platform,
          url: newLink.url,
          is_primary: links.length === 0 // First link is primary by default
        })
        .select()
        .single();

      if (error) throw error;

      setLinks(prev => [...prev, data]);
      setNewLink({ platform: '', url: '' });
    } catch (error: any) {
      setError(error.message || 'Error adding streaming link');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    if (!confirm('Are you sure you want to delete this streaming link?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('streaming_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      setLinks(prev => prev.filter(link => link.id !== linkId));
    } catch (error: any) {
      setError(error.message || 'Error deleting streaming link');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (linkId: number) => {
    setLoading(true);
    try {
      // First, set all links for this song to non-primary
      await supabase
        .from('streaming_links')
        .update({ is_primary: false })
        .eq('song_id', song.id);

      // Then set the selected link as primary
      const { error } = await supabase
        .from('streaming_links')
        .update({ is_primary: true })
        .eq('id', linkId);

      if (error) throw error;

      setLinks(prev => prev.map(link => ({
        ...link,
        is_primary: link.id === linkId
      })));
    } catch (error: any) {
      setError(error.message || 'Error setting primary link');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformInfo = (platform: string) => {
    return PLATFORMS.find(p => p.value === platform) || { 
      value: platform, 
      label: platform.charAt(0).toUpperCase() + platform.slice(1), 
      color: '#6b7280' 
    };
  };

  const availablePlatforms = PLATFORMS.filter(
    platform => !links.some(link => link.platform === platform.value)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manage Streaming Links</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {song.title} by {song.artist}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Streaming Links ({links.length})</h3>
            
            {links.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ExternalLink className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No streaming links added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((link) => {
                  const platformInfo = getPlatformInfo(link.platform);
                  
                  return (
                    <div key={link.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            style={{ backgroundColor: platformInfo.color, color: 'white' }}
                            className="text-xs"
                          >
                            {platformInfo.label}
                          </Badge>
                          {link.is_primary && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{link.url}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            title="Open link"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetPrimary(link.id)}
                          disabled={link.is_primary || loading}
                          title={link.is_primary ? "Already primary" : "Set as primary"}
                        >
                          {link.is_primary ? (
                            <Star className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLink(link.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add New Link */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Add New Streaming Link</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select 
                  value={newLink.platform} 
                  onValueChange={(value) => setNewLink(prev => ({ ...prev, platform: value }))}
                  disabled={availablePlatforms.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      availablePlatforms.length === 0 
                        ? "All platforms added" 
                        : "Select platform"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatforms.map(platform => (
                      <SelectItem key={platform.value} value={platform.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: platform.color }}
                          />
                          {platform.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleAddLink}
                  disabled={loading || !newLink.platform || !newLink.url || availablePlatforms.length === 0}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-900/20 border border-blue-500 text-blue-200 px-4 py-3 rounded text-sm">
            <p className="font-medium mb-1">💡 Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>The primary link will be used for the main "LISTEN NOW" button</li>
              <li>All links will appear in the "Available on" section</li>
              <li>You can only have one link per platform per song</li>
            </ul>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}