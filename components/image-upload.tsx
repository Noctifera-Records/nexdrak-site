"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string | null
  onChange: (value: string | null) => void
  label?: string
  accept?: string
  maxSize?: number // en MB
  className?: string
}

interface ImageUploadFormProps {
  onImageUpload: (imageUrl: string) => void
  currentImage?: string
}

export default function ImageUpload({
  value,
  onChange,
  label = "Image",
  accept = "image/*",
  maxSize = 5,
  className = ""
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setLoading(true)

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file')
      }

      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > maxSize) {
        throw new Error(`File is too large. Maximum ${maxSize}MB allowed`)
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        setPreview(base64)
        onChange(base64)
        setLoading(false)
      }
      reader.onerror = () => {
        setError('Error reading file')
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing image')
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-white">{label}</Label>
      
      <div className="space-y-3">
        {preview && (
          <div className="relative group">
            <div className="relative aspect-square w-full max-w-xs bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={loading}
            className="border-gray-600 text-white hover:bg-gray-700 w-full max-w-xs"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </div>
            ) : (
              <div className="flex items-center">
                {preview ? <ImageIcon className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                {preview ? 'Cambiar imagen' : 'Subir imagen'}
              </div>
            )}
          </Button>

          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="text-xs text-gray-400 max-w-xs">
            <p>Supported formats: JPG, PNG, GIF, WebP</p>
            <p>Maximum size: {maxSize}MB</p>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-500/30 max-w-xs">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export function AdminImageUpload({ onImageUpload, currentImage }: ImageUploadFormProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPreview(currentImage || null)
  }, [currentImage])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setLoading(true)

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file')
      }

      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > 5) {
        throw new Error('File is too large. Maximum 5MB allowed')
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        setPreview(base64)
        onImageUpload(base64)
        setLoading(false)
      }
      reader.onerror = () => {
        setError('Error reading file')
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing image')
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {preview && (
          <div className="relative group">
            <div className="relative aspect-square w-full max-w-xs bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Botón de subida */}
        <div className="flex flex-col space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={loading}
            className="border-gray-600 text-white hover:bg-gray-700 w-full max-w-xs"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesing...
              </div>
            ) : (
              <div className="flex items-center">
                {preview ? <ImageIcon className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                {preview ? 'Change image' : 'Upload image'}
              </div>
            )}
          </Button>

          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="text-xs text-gray-400 max-w-xs">
            <p>Supported formats: JPG, PNG, GIF, WebP</p>
            <p>Maximum size: 5MB</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-500/30 max-w-xs">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}