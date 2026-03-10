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
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/image-upload'
import Image from 'next/image'

interface Download {
  id: number
  title: string
  description: string | null
  category: string
  file_url: string
  thumbnail_url: string | null
  file_size: string | null
  file_format: string | null
  is_featured: boolean
  download_count: number
  created_at: string
}

interface DownloadsTableProps {
  downloads: Download[]
}

export default function DownloadsTable({ downloads: initialDownloads }: DownloadsTableProps) {
  const [downloads, setDownloads] = useState(initialDownloads)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingDownload, setEditingDownload] = useState<Download | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  // Filtrar descargas
  const filteredDownloads = downloads.filter(download => {
    const matchesSearch = download.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         download.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || download.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAddDownload = async (downloadData: Omit<Download, 'id' | 'created_at' | 'download_count'>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('downloads')
        .insert([{ ...downloadData, download_count: 0 }])
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Error de base de datos: ${error.message}`)
      }

      setDownloads([data, ...downloads])
      setShowAddDialog(false)
      router.refresh()
    } catch (error) {
      console.error('Error adding download:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      alert(`Error al agregar descarga: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDownload = async (downloadId: number, updates: Partial<Download>) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('downloads')
        .update(updates)
        .eq('id', downloadId)

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Error de base de datos: ${error.message}`)
      }

      setDownloads(downloads.map(download => 
        download.id === downloadId ? { ...download, ...updates } : download
      ))
      
      setEditingDownload(null)
      router.refresh()
    } catch (error) {
      console.error('Error updating download:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      alert(`Error al actualizar descarga: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDownload = async (downloadId: number) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('downloads')
        .delete()
        .eq('id', downloadId)

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Error de base de datos: ${error.message}`)
      }

      setDownloads(downloads.filter(download => download.id !== downloadId))
      router.refresh()
    } catch (error) {
      console.error('Error deleting download:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      alert(`Error al eliminar descarga: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleFeatured = async (downloadId: number, isFeatured: boolean) => {
    await handleUpdateDownload(downloadId, { is_featured: isFeatured })
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
    return new Date(dateString).toLocaleDateString('es-ES', {
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
              placeholder="Buscar descargas..."
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
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="wallpaper">Wallpapers</SelectItem>
              <SelectItem value="mp3">Audio</SelectItem>
              <SelectItem value="other">Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Descarga
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Descarga</DialogTitle>
              <DialogDescription>
                Agrega nuevo contenido para descargar
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
              {download.thumbnail_url ? (
                <Image
                  src={download.thumbnail_url}
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
                    Destacado
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
                    {download.file_format && (
                      <span className="bg-muted px-2 py-1 rounded">
                        {download.file_format}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="h-3 w-3" />
                    <span>{download.download_count}</span>
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
                  <span className="text-xs text-muted-foreground">Destacado</span>
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
                        <DialogTitle>Editar Descarga</DialogTitle>
                        <DialogDescription>
                          Modifica la información de la descarga
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Eliminar Descarga</DialogTitle>
                        <DialogDescription>
                          ¿Estás seguro de que quieres eliminar "{download.title}"?
                          Esta acción no se puede deshacer.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteDownload(download.id)}
                          disabled={loading}
                        >
                          {loading ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
            {searchTerm || categoryFilter !== 'all' ? 'No se encontraron descargas' : 'No hay descargas'}
          </p>
          <p className="text-muted-foreground text-sm">
            {!searchTerm && categoryFilter === 'all' && 'Agrega tu primera descarga para comenzar'}
          </p>
        </div>
      )}
    </div>
  )
}

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
  const [thumbnailUrl, setThumbnailUrl] = useState(download?.thumbnail_url || '')
  const [fileSize, setFileSize] = useState(download?.file_size || '')
  const [fileFormat, setFileFormat] = useState(download?.file_format || '')
  const [isFeatured, setIsFeatured] = useState(download?.is_featured || false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      description: description || null,
      category,
      file_url: fileUrl,
      thumbnail_url: thumbnailUrl || null,
      file_size: fileSize || null,
      file_format: fileFormat || null,
      is_featured: isFeatured,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">
            Título *
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nombre de la descarga"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">
            Categoría *
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wallpaper">Wallpaper</SelectItem>
              <SelectItem value="mp3">Audio</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">
          Descripción
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción de la descarga"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="fileUrl">
          URL del Archivo *
        </Label>
        <Input
          id="fileUrl"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://ejemplo.com/archivo.zip"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enlace directo al archivo alojado en otra plataforma
        </p>
      </div>

      <div>
        <Label>
          Imagen de Vista Previa
        </Label>
        <div className="space-y-3">
          <ImageUpload
            value={thumbnailUrl}
            onChange={(url) => setThumbnailUrl(url || '')}
            label=""
            maxSize={2}
          />
          <div className="text-xs text-muted-foreground">
            O ingresa una URL directamente:
          </div>
          <Input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://ejemplo.com/preview.jpg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fileSize">
            Tamaño del Archivo
          </Label>
          <Input
            id="fileSize"
            value={fileSize}
            onChange={(e) => setFileSize(e.target.value)}
            placeholder="2.5 MB"
          />
        </div>

        <div>
          <Label htmlFor="fileFormat">
            Formato
          </Label>
          <Input
            id="fileFormat"
            value={fileFormat}
            onChange={(e) => setFileFormat(e.target.value)}
            placeholder="ZIP, MP3, JPG, etc."
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={isFeatured}
          onCheckedChange={setIsFeatured}
        />
        <Label>Destacado</Label>
      </div>

      <DialogFooter>
        <Button
          type="submit"
          disabled={loading || !title || !fileUrl}
        >
          {loading ? 'Guardando...' : (download ? 'Actualizar' : 'Crear')}
        </Button>
      </DialogFooter>
    </form>
  )
}