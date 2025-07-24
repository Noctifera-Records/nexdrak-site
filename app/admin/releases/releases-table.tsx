"use client"

import { useState } from 'react'
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
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
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
}

export default function ReleasesTable({ releases: initialReleases }: ReleasesTableProps) {
  const [releases, setReleases] = useState(initialReleases)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingRelease, setEditingRelease] = useState<Release | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  // Filtrar releases por término de búsqueda
  const filteredReleases = releases.filter(release => 
    release.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddRelease = async (releaseData: Omit<Release, 'id' | 'created_at'>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('releases')
        .insert([releaseData])
        .select()
        .single()

      if (error) throw error

      setReleases([data, ...releases])
      setShowAddDialog(false)
      router.refresh()
    } catch (error) {
      console.error('Error adding release:', error)
      alert('Error al agregar lanzamiento')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRelease = async (releaseId: number, updates: Partial<Release>) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('releases')
        .update(updates)
        .eq('id', releaseId)

      if (error) throw error

      setReleases(releases.map(release => 
        release.id === releaseId ? { ...release, ...updates } : release
      ))
      
      setEditingRelease(null)
      router.refresh()
    } catch (error) {
      console.error('Error updating release:', error)
      alert('Error al actualizar lanzamiento')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRelease = async (releaseId: number) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('releases')
        .delete()
        .eq('id', releaseId)

      if (error) throw error

      setReleases(releases.filter(release => release.id !== releaseId))
      router.refresh()
    } catch (error) {
      console.error('Error deleting release:', error)
      alert('Error al eliminar lanzamiento')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar lanzamientos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-700 text-white"
          />
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-white text-black hover:bg-gray-200">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Lanzamiento
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Nuevo Lanzamiento</DialogTitle>
              <DialogDescription className="text-gray-400">
                Agrega un nuevo lanzamiento musical
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
          <div key={release.id} className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
            {/* Imagen de portada */}
            <div className="aspect-square bg-gray-800 flex items-center justify-center">
              {release.cover_image_url ? (
                <img
                  src={release.cover_image_url}
                  alt={release.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music className="h-16 w-16 text-gray-600" />
              )}
            </div>
            
            {/* Información */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-white truncate">
                  {release.title}
                </h3>
                <div className="flex items-center text-sm text-gray-400 mt-1">
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
                  className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Escuchar
                </a>
              )}

              {/* Acciones */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-700">
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
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Editar Lanzamiento</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Modifica la información del lanzamiento
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

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Eliminar Lanzamiento</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        ¿Estás seguro de que quieres eliminar "{release.title}"?
                        Esta acción no se puede deshacer.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" className="border-gray-600 text-gray-300">
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteRelease(release.id)}
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
        ))}
      </div>

      {filteredReleases.length === 0 && (
        <div className="text-center py-12">
          <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">
            {searchTerm ? 'No se encontraron lanzamientos' : 'No hay lanzamientos'}
          </p>
          <p className="text-gray-500 text-sm">
            {!searchTerm && 'Agrega tu primer lanzamiento para comenzar'}
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
        <Label htmlFor="title" className="text-white">
          Título *
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="Nombre del lanzamiento"
          required
        />
      </div>

      <div>
        <Label htmlFor="releaseDate" className="text-white">
          Fecha de Lanzamiento *
        </Label>
        <Input
          id="releaseDate"
          type="date"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          required
        />
      </div>

      <div>
        <Label htmlFor="coverImageUrl" className="text-white">
          Imagen de Portada
        </Label>
        <div className="space-y-2">
          <ImageUpload
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            label=""
            maxSize={2}
          />
          <div className="text-xs text-gray-400">
            O ingresa una URL directamente:
          </div>
          <Input
            id="coverImageUrl"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="streamUrl" className="text-white">
          URL de Streaming
        </Label>
        <Input
          id="streamUrl"
          value={streamUrl}
          onChange={(e) => setStreamUrl(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="https://spotify.com/track/..."
        />
      </div>

      <DialogFooter>
        <Button
          type="submit"
          disabled={loading || !title || !releaseDate}
          className="bg-white text-black hover:bg-gray-200"
        >
          {loading ? 'Guardando...' : (release ? 'Actualizar' : 'Crear')}
        </Button>
      </DialogFooter>
    </form>
  )
}