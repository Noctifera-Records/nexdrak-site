"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string | null
  onChange: (value: string | null) => void
  label?: string
  accept?: string
  maxSizeMB?: number // en MB
  className?: string
}

interface ImageUploadFormProps {
  onImageUpload: (imageUrl: string) => void
  currentImage?: string
  maxSizeMB?: number
}

export default function ImageUpload({
  value,
  onChange,
  label = "Image",
  accept = "image/*",
  maxSizeMB = 5,
  className = ""
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPreview(value || null)
  }, [value])

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
      if (fileSizeMB > maxSizeMB) {
        throw new Error(`File is too large. Maximum ${maxSizeMB}MB allowed`)
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
      <Label className="text-foreground">{label}</Label>
      
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
                  Remove
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
            className="w-full max-w-xs"
          >
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Processing...
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
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="text-xs text-muted-foreground max-w-xs">
            <p>Supported formats: JPG, PNG, GIF, WebP</p>
            <p>Maximum size: {maxSizeMB}MB</p>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-500/10 p-2 rounded border border-red-500/20 max-w-xs">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export function AdminImageUpload({ onImageUpload, currentImage, maxSizeMB = 5 }: ImageUploadFormProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync preview with currentImage prop
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
      if (fileSizeMB > maxSizeMB) {
        throw new Error(`File is too large. Maximum ${maxSizeMB}MB allowed`)
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
            className="w-full max-w-xs"
          >
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Processing...
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

          <div className="text-xs text-muted-foreground max-w-xs">
            <p>Supported formats: JPG, PNG, GIF, WebP</p>
            <p>Maximum size: {maxSizeMB}MB</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-500 text-sm bg-red-500/10 p-2 rounded border border-red-500/20 max-w-xs">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}