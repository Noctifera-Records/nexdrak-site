"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Image as ImageIcon, 
  Music, 
  Package, 
  Star,
  Filter,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from '@/lib/supabase/client'
import { useNotifications } from '@/components/notification-system'

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

interface DownloadsGridProps {
  downloads: Download[]
}

export default function DownloadsGrid({ downloads: initialDownloads }: DownloadsGridProps) {
  const [downloads, setDownloads] = useState(initialDownloads)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [downloading, setDownloading] = useState<number | null>(null)
  
  const supabase = createClient()
  const { showNotification } = useNotifications()

  // Filtrar descargas
  const filteredDownloads = downloads.filter(download => {
    const matchesSearch = download.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         download.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || download.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Separar destacados y normales
  const featuredDownloads = filteredDownloads.filter(d => d.is_featured)
  const regularDownloads = filteredDownloads.filter(d => !d.is_featured)

  const handleDownload = async (download: Download) => {
    setDownloading(download.id)
    
    try {
      // Incrementar contador de descargas
      await supabase
        .from('downloads')
        .update({ download_count: download.download_count + 1 })
        .eq('id', download.id)

      // Actualizar estado local
      setDownloads(downloads.map(d => 
        d.id === download.id ? { ...d, download_count: d.download_count + 1 } : d
      ))

      // Mostrar notificación de éxito
      showNotification({
        type: 'success',
        title: 'Descarga iniciada',
        message: `Descargando "${download.title}"`
      })

      // Abrir enlace de descarga
      window.open(download.file_url, '_blank')
    } catch (error) {
      console.error('Error updating download count:', error)
      
      // Mostrar notificación de error
      showNotification({
        type: 'error',
        title: 'Error en la descarga',
        message: 'No se pudo procesar la descarga correctamente'
      })
      
      // Aún así abrir el enlace
      window.open(download.file_url, '_blank')
    } finally {
      setDownloading(null)
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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'wallpaper':
        return 'Wallpaper'
      case 'mp3':
        return 'Audio'
      default:
        return 'Otros'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'wallpaper':
        return 'bg-blue-900/30 text-blue-300 border-blue-500/30'
      case 'mp3':
        return 'bg-purple-900/30 text-purple-300 border-purple-500/30'
      default:
        return 'bg-gray-900/30 text-gray-300 border-gray-500/30'
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
    <div className="space-y-8">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar descargas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-700 text-white"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="wallpaper">Wallpapers</SelectItem>
              <SelectItem value="mp3">Audio</SelectItem>
              <SelectItem value="other">Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Descargas destacadas */}
      {featuredDownloads.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <Star className="h-5 w-5 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Destacados</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredDownloads.map((download) => (
              <DownloadCard
                key={download.id}
                download={download}
                onDownload={handleDownload}
                downloading={downloading === download.id}
                getCategoryIcon={getCategoryIcon}
                getCategoryLabel={getCategoryLabel}
                getCategoryColor={getCategoryColor}
                formatDate={formatDate}
                featured
              />
            ))}
          </div>
        </div>
      )}

      {/* Todas las descargas */}
      {regularDownloads.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Todas las Descargas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularDownloads.map((download) => (
              <DownloadCard
                key={download.id}
                download={download}
                onDownload={handleDownload}
                downloading={downloading === download.id}
                getCategoryIcon={getCategoryIcon}
                getCategoryLabel={getCategoryLabel}
                getCategoryColor={getCategoryColor}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {filteredDownloads.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">
            {searchTerm || categoryFilter !== 'all' 
              ? 'No se encontraron descargas' 
              : 'No hay descargas disponibles'
            }
          </p>
          <p className="text-gray-500 text-sm">
            {!searchTerm && categoryFilter === 'all' && 'Las descargas aparecerán aquí cuando se agreguen'}
          </p>
        </div>
      )}
    </div>
  )
}

function DownloadCard({ 
  download, 
  onDownload, 
  downloading, 
  getCategoryIcon, 
  getCategoryLabel, 
  getCategoryColor, 
  formatDate,
  featured = false 
}: {
  download: Download
  onDownload: (download: Download) => void
  downloading: boolean
  getCategoryIcon: (category: string) => JSX.Element
  getCategoryLabel: (category: string) => string
  getCategoryColor: (category: string) => string
  formatDate: (date: string) => string
  featured?: boolean
}) {
  return (
    <Card className={`bg-gray-900 border-gray-700 overflow-hidden group hover:border-gray-600 transition-all ${
      featured ? 'ring-2 ring-yellow-500/30' : ''
    }`}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-800">
        {download.thumbnail_url ? (
          <Image
            src={download.thumbnail_url}
            alt={download.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {getCategoryIcon(download.category)}
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex space-x-2">
          {featured && (
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              <Star className="h-3 w-3 mr-1" />
              Destacado
            </Badge>
          )}
          <Badge className={`${getCategoryColor(download.category)} border`}>
            {getCategoryIcon(download.category)}
            <span className="ml-1">{getCategoryLabel(download.category)}</span>
          </Badge>
        </div>

        {/* Overlay de descarga */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={() => onDownload(download)}
            disabled={downloading}
            className="bg-white text-black hover:bg-gray-200"
          >
            {downloading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Descargando...
              </div>
            ) : (
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Información */}
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-gray-200 transition-colors">
            {download.title}
          </h3>
          {download.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
              {download.description}
            </p>
          )}
        </div>

        {/* Metadatos */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            {download.file_size && (
              <span>{download.file_size}</span>
            )}
            {download.file_format && (
              <span className="bg-gray-800 px-2 py-1 rounded">
                {download.file_format}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Download className="h-3 w-3" />
            <span>{download.download_count}</span>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          {formatDate(download.created_at)}
        </div>

        {/* Botón de descarga */}
        <Button
          onClick={() => onDownload(download)}
          disabled={downloading}
          className="w-full bg-white text-black hover:bg-gray-200"
        >
          {downloading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              Descargando...
            </div>
          ) : (
            <div className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Descargar {download.file_format}
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}