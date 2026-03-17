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
import { useNotifications } from '@/components/notification-system'
import { incrementDownloadCount } from './actions'

interface DownloadItem {
  id: number
  title: string
  description: string | null
  category: string
  file_url: string
  thumbnail_url?: string | null
  cover_image_url?: string | null
  file_size: string | null
  file_format?: string | null
  file_type?: string | null
  is_featured: boolean
  download_count: number
  created_at: string
}

interface DownloadsGridProps {
  downloads: DownloadItem[]
}

export default function DownloadsGrid({ downloads: initialDownloads }: DownloadsGridProps) {
  const [downloads, setDownloads] = useState(initialDownloads)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [downloading, setDownloading] = useState<number | null>(null)
  
  const { showNotification } = useNotifications()

  // Filtrar descargas
  const filteredDownloads = downloads.filter(download => {
    const matchesSearch = download.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (download.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || download.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Separar destacados y normales
  const featuredDownloads = filteredDownloads.filter(d => d.is_featured)
  const regularDownloads = filteredDownloads.filter(d => !d.is_featured)

  const handleDownload = async (download: DownloadItem) => {
    setDownloading(download.id)
    
    try {
      // Incrementar contador de descargas
      await incrementDownloadCount(download.id)

      // Actualizar estado local
      setDownloads(downloads.map(d => 
        d.id === download.id ? { ...d, download_count: d.download_count + 1 } : d
      ))

      // Mostrar notificación de éxito
      showNotification({
        type: 'success',
        title: 'Download started',
        message: `Downloading "${download.title}"`
      })

      // Abrir enlace de descarga
      window.open(download.file_url, '_blank')
    } catch (error) {
      console.error('Error updating download count:', error)
      
      // Mostrar notificación de error
      showNotification({
        type: 'error',
        title: 'Error in download',
        message: 'Could not process download correctly'
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
        return 'bg-blue-500/10 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border-blue-500/30'
      case 'mp3':
        return 'bg-purple-500/10 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 border-purple-500/30'
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
    <div className="space-y-8">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search downloads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/80 border-input text-foreground backdrop-blur-sm"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 bg-background/80 border-input text-foreground backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="wallpaper">Wallpapers</SelectItem>
              <SelectItem value="mp3">Audio</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Descargas destacadas */}
      {featuredDownloads.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <Star className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
            <h2 className="text-2xl font-bold text-foreground dark:text-white">Destacados</h2>
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
          <h2 className="text-2xl font-bold text-foreground dark:text-white mb-6">
            All Downloads
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
          <Package className="h-16 w-16 text-muted-foreground dark:text-gray-600 mx-auto mb-4" />
          <p className="text-muted-foreground dark:text-gray-400 text-lg mb-2">
            {searchTerm || categoryFilter !== 'all' 
              ? 'No downloads found' 
              : 'No downloads available'
            }
          </p>
          <p className="text-muted-foreground/80 dark:text-gray-500 text-sm">
            {!searchTerm && categoryFilter === 'all' && 'Downloads will appear here when added'}
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
  download: DownloadItem
  onDownload: (download: DownloadItem) => void
  downloading: boolean
  getCategoryIcon: (category: string) => React.ReactNode
  getCategoryLabel: (category: string) => string
  getCategoryColor: (category: string) => string
  formatDate: (date: string) => string
  featured?: boolean
}) {
  return (
    <Card className={`bg-card/50 dark:bg-black/50 backdrop-blur-sm border-border dark:border-white/20 overflow-hidden group hover:border-foreground/40 dark:hover:border-white/40 transition-all shadow-sm dark:shadow-none ${
      featured ? 'ring-2 ring-yellow-500/30' : ''
    }`}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted dark:bg-gray-800">
        {(download.cover_image_url || download.thumbnail_url) ? (
          <Image
            src={(download.cover_image_url || download.thumbnail_url) as string}
            alt={download.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground dark:text-gray-400">
            {getCategoryIcon(download.category)}
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex space-x-2">
          {featured && (
            <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 border-yellow-500/30">
              <Star className="h-3 w-3 mr-1" />
              Featured
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
                <div className="animate-spin rounded-full h-4 w-4 border-black border-b-2 mr-2"></div>
                Downloading...
              </div>
            ) : (
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Download
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Información */}
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground dark:text-white group-hover:text-primary dark:group-hover:text-gray-200 transition-colors">
            {download.title}
          </h3>
          {download.description && (
            <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1 line-clamp-2">
              {download.description}
            </p>
          )}
        </div>

        {/* Metadatos */}
        <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-gray-500">
          <div className="flex items-center space-x-3">
            {download.file_size && (
              <span>{download.file_size}</span>
            )}
            {(download.file_type || download.file_format) && (
              <span className="bg-muted dark:bg-gray-800 px-2 py-1 rounded text-foreground dark:text-gray-300">
                {download.file_type || download.file_format}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Download className="h-3 w-3" />
            <span>{download.download_count}</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground dark:text-gray-500">
          {formatDate(download.created_at)}
        </div>

        {/* Botón de descarga móvil */}
        <div className="block sm:hidden mt-2">
            <Button
            onClick={() => onDownload(download)}
            disabled={downloading}
            className="w-full bg-foreground text-background hover:bg-foreground/90 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
            >
            {downloading ? (
                <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Downloading...
                </div>
            ) : (
                <div className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Download
                </div>
            )}
            </Button>
        </div>
      </CardContent>
    </Card>
  )
}
