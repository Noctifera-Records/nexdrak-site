"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Save,
  Settings,
  Globe,
  Image,
  Music,
  Mail,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/image-upload'

interface SettingsFormProps {
  settings: Record<string, string>
}

export default function SettingsForm({ settings: initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const supabase = createClient()
  const router = useRouter()

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      // Actualizar cada configuración
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .upsert(update, { onConflict: 'key' })

        if (error) {
          console.error('Supabase error:', error)
          throw new Error(`Error al actualizar ${update.key}: ${error.message}`)
        }
      }

      setMessage('Configuraciones guardadas exitosamente')
      router.refresh()
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Error al guardar configuraciones')
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const settingsConfig = [
    {
      section: 'Información General',
      icon: <Globe className="h-5 w-5" />,
      fields: [
        {
          key: 'main_title',
          label: 'Título Principal',
          placeholder: 'THE QUIET ONE',
          description: 'Título que aparece en la página principal'
        },
        {
          key: 'site_description',
          label: 'Descripción del Sitio',
          placeholder: 'Sitio oficial del artista...',
          description: 'Descripción para SEO y redes sociales',
          type: 'textarea'
        },
        {
          key: 'artist_name',
          label: 'Nombre del Artista',
          placeholder: 'NexDrak',
          description: 'Nombre principal del artista'
        }
      ]
    },
    {
      section: 'Imágenes',
      icon: <Image className="h-5 w-5" />,
      fields: [
        {
          key: 'hero_image',
          label: 'Imagen Principal',
          placeholder: 'https://ejemplo.com/imagen.jpg',
          description: 'Imagen de fondo de la sección principal'
        },
        {
          key: 'logo_url',
          label: 'URL del Logo',
          placeholder: 'https://ejemplo.com/logo.png',
          description: 'Logo que aparece en la navegación'
        },
        {
          key: 'og_image',
          label: 'Imagen para Redes Sociales',
          placeholder: 'https://ejemplo.com/og-image.jpg',
          description: 'Imagen que aparece al compartir en redes sociales'
        }
      ]
    },
    {
      section: 'Enlaces de Música',
      icon: <Music className="h-5 w-5" />,
      fields: [
        {
          key: 'spotify_url',
          label: 'Spotify',
          placeholder: 'https://open.spotify.com/artist/...',
          description: 'Enlace a tu perfil de Spotify'
        },
        {
          key: 'apple_music_url',
          label: 'Apple Music',
          placeholder: 'https://music.apple.com/artist/...',
          description: 'Enlace a tu perfil de Apple Music'
        },
        {
          key: 'youtube_url',
          label: 'YouTube',
          placeholder: 'https://youtube.com/@...',
          description: 'Enlace a tu canal de YouTube'
        },
        {
          key: 'soundcloud_url',
          label: 'SoundCloud',
          placeholder: 'https://soundcloud.com/...',
          description: 'Enlace a tu perfil de SoundCloud'
        }
      ]
    },
    {
      section: 'Redes Sociales',
      icon: <Mail className="h-5 w-5" />,
      fields: [
        {
          key: 'instagram_url',
          label: 'Instagram',
          placeholder: 'https://instagram.com/...',
          description: 'Enlace a tu perfil de Instagram'
        },
        {
          key: 'twitter_url',
          label: 'Twitter/X',
          placeholder: 'https://twitter.com/...',
          description: 'Enlace a tu perfil de Twitter'
        },
        {
          key: 'facebook_url',
          label: 'Facebook',
          placeholder: 'https://facebook.com/...',
          description: 'Enlace a tu página de Facebook'
        },
        {
          key: 'tiktok_url',
          label: 'TikTok',
          placeholder: 'https://tiktok.com/@...',
          description: 'Enlace a tu perfil de TikTok'
        }
      ]
    }
  ]

  return (
    <div className="max-w-4xl space-y-8">
      {/* Mensajes de estado */}
      {message && (
        <div className="flex items-center space-x-2 text-green-400 bg-green-900/20 p-4 rounded-lg border border-green-500/30">
          <CheckCircle className="h-5 w-5" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-500/30">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Secciones de configuración */}
      {settingsConfig.map((section) => (
        <div key={section.section} className="bg-gray-900 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            {section.icon}
            <h2 className="text-xl font-semibold text-white">{section.section}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.fields.map((field) => (
              <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                {/* Campos de imagen usan ImageUpload */}
                {section.section === 'Imágenes' ? (
                  <div className="space-y-3">
                    <ImageUpload
                      value={settings[field.key] || ''}
                      onChange={(value) => handleInputChange(field.key, value || '')}
                      label={field.label}
                      maxSize={3}
                    />
                    <div className="text-xs text-gray-400">
                      O ingresa una URL directamente:
                    </div>
                    <Input
                      id={field.key}
                      value={settings[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder={field.placeholder}
                    />
                    {field.description && (
                      <p className="text-sm text-gray-400">{field.description}</p>
                    )}
                  </div>
                ) : (
                  /* Campos normales */
                  <div>
                    <Label htmlFor={field.key} className="text-white">
                      {field.label}
                    </Label>
                    
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.key}
                        value={settings[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white mt-1"
                        placeholder={field.placeholder}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={field.key}
                        value={settings[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white mt-1"
                        placeholder={field.placeholder}
                      />
                    )}
                    
                    {field.description && (
                      <p className="text-sm text-gray-400 mt-1">{field.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-white text-black hover:bg-gray-200 px-8"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              <span>Guardando...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Guardar Configuraciones</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}