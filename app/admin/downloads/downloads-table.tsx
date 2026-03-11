"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Edit, 
  Trash2, 
  Search, 
  Plus,
  Download,
  Star,
  Image as ImageIcon,
  Music,
  Package
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { createDownload, updateDownload, deleteDownload } from './actions'
import { toast } from 'sonner'
import ImageUpload from '@/components/image-upload'
import Image from 'next/image'

interface Download {
  id: number
  title: string
  description: string | null
  category: string
  file_url: string
  cover_image_url: string | null
  file_size: string | null
  file_type: string | null
  is_featured: boolean
  is_public: boolean
  created_at: string
}

interface DownloadsTableProps {
  downloads: Download[]
  onRefresh: () => void
}

export default function DownloadsTable({ downloads: initialDownloads, onRefresh }: DownloadsTableProps) {
  const [downloads, setDownloads] = useState(initialDownloads)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingDownload, setEditingDownload] = useState<Download | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Update local state when props change
  useEffect(() => {
      setDownloads(initialDownloads);
  }, [initialDownloads]);

  // Filtrar descargas
  const filteredDownloads = downloads.filter(download => {
    const matchesSearch = download.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         download.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || download.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAddDownload = async (downloadData: any) => {
    setLoading(true)
    try {
      await createDownload({
          ...downloadData,
          is_public: true // Default to public
      });
      toast.success('Download created');
      setShowAddDialog(false)
      onRefresh();
    } catch (error) {
      console.error('Error adding download:', error)
      toast.error('Failed to create download');
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDownload = async (downloadId: number, updates: any) => {
    setLoading(true)
    try {
      await updateDownload(downloadId, updates);
      toast.success('Download updated');
      setEditingDownload(null)
      onRefresh();
    } catch (error) {
      console.error('Error updating download:', error)
      toast.error('Failed to update download');
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDownload = async (downloadId: number) => {
    if (!confirm('Are you sure you want to delete this download?')) return;
    
    setLoading(true)
    try {
      await deleteDownload(downloadId);
      toast.success('Download deleted');
      onRefresh();
    } catch (error) {
      console.error('Error deleting download:', error)
      toast.error('Failed to delete download');
    } finally {
      setLoading(false)
    }
  }

  const toggleFeatured = async (downloadId: number, isFeatured: boolean) => {
    // Optimistic update
    setDownloads(downloads.map(d => d.id === downloadId ? { ...d, is_featured: isFeatured } : d));
    
    try {
        await updateDownload(downloadId, { is_featured: isFeatured });
        toast.success('Status updated');
    } catch (error) {
        toast.error('Failed to update status');
        onRefresh(); // Revert on error
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wallpaper':
        return <ImageIcon className="h-4 w-4" />
      case 'mp3':
        return <Music className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'wallpaper':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'mp3':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Filtros y botón agregar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search downloads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="wallpaper">Wallpapers</SelectItem>
              <SelectItem value="mp3">Audio</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Download
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Download</DialogTitle>
              <DialogDescription>
                Add new content for users to download
              </DialogDescription>
            </DialogHeader>
            <DownloadForm
              onSave={handleAddDownload}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de descargas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDownloads.map((download) => (
          <div key={download.id} className="bg-card rounded-lg border border-border overflow-hidden group hover:border-primary/50 transition-all">
            {/* Thumbnail */}
            <div className="relative aspect-video bg-muted">
              {download.cover_image_url ? (
                <Image
                  src={download.cover_image_url}
                  alt={download.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  {getCategoryIcon(download.category)}
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex space-x-2">
                {download.is_featured && (
                  <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge className={`${getCategoryColor(download.category)} border`}>
                  {getCategoryIcon(download.category)}
                  <span className="ml-1 capitalize">{download.category}</span>
                </Badge>
              </div>
            </div>
            
            {/* Información */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground truncate">
                  {download.title}
                </h3>
                {download.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {download.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                  <div className="flex items-center space-x-2">
                    {download.file_size && <span>{download.file_size}</span>}
                    {download.file_type && (
                      <span className="bg-muted px-2 py-1 rounded">
                        {download.file_type}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDate(download.created_at)}
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={download.is_featured}
                    onCheckedChange={(checked) => toggleFeatured(download.id, checked)}
                  />
                  <span className="text-xs text-muted-foreground">Featured</span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Botón Editar */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDownload(download)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Download</DialogTitle>
                        <DialogDescription>
                          Modify download information
                        </DialogDescription>
                      </DialogHeader>
                      {editingDownload && (
                        <DownloadForm
                          download={editingDownload}
                          onSave={(data) => handleUpdateDownload(editingDownload.id, data)}
                          loading={loading}
                        />
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Botón Eliminar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteDownload(download.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDownloads.length === 0 && (
        <div className="text-center py-12">
          <Download className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">
            {searchTerm || categoryFilter !== 'all' ? 'No downloads found' : 'No downloads yet'}
          </p>
          <p className="text-muted-foreground text-sm">
            {!searchTerm && categoryFilter === 'all' && 'Add your first download to get started'}
          </p>
        </div>
      )}
    </div>
  )
}

import { useEffect } from 'react';

function DownloadForm({ 
  download, 
  onSave, 
  loading 
}: { 
  download?: Download
  onSave: (data: any) => void
  loading: boolean 
}) {
  const [title, setTitle] = useState(download?.title || '')
  const [description, setDescription] = useState(download?.description || '')
  const [category, setCategory] = useState(download?.category || 'wallpaper')
  const [fileUrl, setFileUrl] = useState(download?.file_url || '')
  const [coverImageUrl, setCoverImageUrl] = useState(download?.cover_image_url || '')
  const [fileSize, setFileSize] = useState(download?.file_size || '')
  const [fileType, setFileType] = useState(download?.file_type || '')
  const [isFeatured, setIsFeatured] = useState(download?.is_featured || false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      description: description || null,
      category,
      file_url: fileUrl,
      cover_image_url: coverImageUrl || null,
      file_size: fileSize || null,
      file_type: fileType || null,
      is_featured: isFeatured,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">
            Title *
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Download Name"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">
            Category *
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wallpaper">Wallpaper</SelectItem>
              <SelectItem value="mp3">Audio</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Download description..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="fileUrl">
          File URL *
        </Label>
        <Input
          id="fileUrl"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://example.com/file.zip"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Direct link to the file hosted externally
        </p>
      </div>

      <div>
        <Label>
          Preview Image
        </Label>
        <div className="space-y-3">
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
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://example.com/preview.jpg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fileSize">
            File Size
          </Label>
          <Input
            id="fileSize"
            value={fileSize}
            onChange={(e) => setFileSize(e.target.value)}
            placeholder="2.5 MB"
          />
        </div>

        <div>
          <Label htmlFor="fileType">
            Format
          </Label>
          <Input
            id="fileType"
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            placeholder="ZIP, MP3, JPG, etc."
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is-featured"
          checked={isFeatured}
          onCheckedChange={setIsFeatured}
        />
        <Label htmlFor="is-featured">Featured</Label>
      </div>

      <DialogFooter>
        <Button
          type="submit"
          disabled={loading || !title || !fileUrl}
        >
          {loading ? 'Saving...' : (download ? 'Update' : 'Create')}
        </Button>
      </DialogFooter>
    </form>
  )
}
