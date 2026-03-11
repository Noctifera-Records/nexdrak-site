"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Edit, 
  Trash2, 
  Search, 
  Plus,
  Calendar,
  ExternalLink,
  Music
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createRelease, updateRelease, deleteRelease } from './actions'
import { toast } from 'sonner'
import ImageUpload from '@/components/image-upload'

interface Release {
  id: number
  title: string
  release_date: string
  cover_image_url: string | null
  stream_url: string | null
  created_at: string
}

interface ReleasesTableProps {
  releases: Release[]
  onRefresh: () => void
}

export default function ReleasesTable({ releases: initialReleases, onRefresh }: ReleasesTableProps) {
  const [releases, setReleases] = useState(initialReleases)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingRelease, setEditingRelease] = useState<Release | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Update local state when props change
  useEffect(() => {
      setReleases(initialReleases);
  }, [initialReleases]);

  // Filtrar releases por término de búsqueda
  const filteredReleases = releases.filter(release => 
    release.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddRelease = async (releaseData: any) => {
    setLoading(true)
    try {
      await createRelease(releaseData);
      toast.success('Release created');
      setShowAddDialog(false)
      onRefresh();
    } catch (error) {
      console.error('Error adding release:', error)
      toast.error('Failed to create release');
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRelease = async (releaseId: number, updates: any) => {
    setLoading(true)
    try {
      await updateRelease(releaseId, updates);
      toast.success('Release updated');
      setEditingRelease(null)
      onRefresh();
    } catch (error) {
      console.error('Error updating release:', error)
      toast.error('Failed to update release');
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRelease = async (releaseId: number) => {
    if (!confirm('Are you sure you want to delete this release?')) return;
    
    setLoading(true)
    try {
      await deleteRelease(releaseId);
      toast.success('Release deleted');
      onRefresh();
    } catch (error) {
      console.error('Error deleting release:', error)
      toast.error('Failed to delete release');
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y botón agregar */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search releases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Release
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Release</DialogTitle>
              <DialogDescription>
                Add a new music release to your discography
              </DialogDescription>
            </DialogHeader>
            <ReleaseForm
              onSave={handleAddRelease}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de releases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReleases.map((release) => (
          <div key={release.id} className="bg-card rounded-lg border border-border overflow-hidden">
            {/* Imagen de portada */}
            <div className="aspect-square bg-muted flex items-center justify-center relative">
              {release.cover_image_url ? (
                <img
                  src={release.cover_image_url}
                  alt={release.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            
            {/* Información */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground truncate">
                  {release.title}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(release.release_date)}
                </div>
              </div>

              {/* Enlaces */}
              {release.stream_url && (
                <a
                  href={release.stream_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-500 hover:text-blue-600"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Listen
                </a>
              )}

              {/* Acciones */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingRelease(release)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Release</DialogTitle>
                      <DialogDescription>
                        Modify release information
                      </DialogDescription>
                    </DialogHeader>
                    {editingRelease && (
                      <ReleaseForm
                        release={editingRelease}
                        onSave={(data) => handleUpdateRelease(editingRelease.id, data)}
                        loading={loading}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteRelease(release.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReleases.length === 0 && (
        <div className="text-center py-12">
          <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">
            {searchTerm ? 'No releases found' : 'No releases yet'}
          </p>
          <p className="text-muted-foreground text-sm">
            {!searchTerm && 'Add your first release to get started'}
          </p>
        </div>
      )}
    </div>
  )
}

function ReleaseForm({ 
  release, 
  onSave, 
  loading 
}: { 
  release?: Release
  onSave: (data: any) => void
  loading: boolean 
}) {
  const [title, setTitle] = useState(release?.title || '')
  const [releaseDate, setReleaseDate] = useState(
    release?.release_date ? release.release_date.split('T')[0] : ''
  )
  const [coverImageUrl, setCoverImageUrl] = useState(release?.cover_image_url || '')
  const [streamUrl, setStreamUrl] = useState(release?.stream_url || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      release_date: releaseDate,
      cover_image_url: coverImageUrl || null,
      stream_url: streamUrl || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">
          Title *
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Release Name"
          required
        />
      </div>

      <div>
        <Label htmlFor="releaseDate">
          Release Date *
        </Label>
        <Input
          id="releaseDate"
          type="date"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="coverImageUrl">
          Cover Image
        </Label>
        <div className="space-y-2">
          <ImageUpload
            value={coverImageUrl}
            onChange={(url) => setCoverImageUrl(url || '')}
            label=""
            maxSizeMB={2}
          />
          <div className="text-xs text-muted-foreground">
            Or enter URL directly:
          </div>
          <Input
            id="coverImageUrl"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="streamUrl">
          Streaming URL
        </Label>
        <Input
          id="streamUrl"
          value={streamUrl}
          onChange={(e) => setStreamUrl(e.target.value)}
          placeholder="https://spotify.com/track/..."
        />
      </div>

      <DialogFooter>
        <Button
          type="submit"
          disabled={loading || !title || !releaseDate}
        >
          {loading ? 'Saving...' : (release ? 'Update' : 'Create')}
        </Button>
      </DialogFooter>
    </form>
  )
}
