"use client"

import { useState } from "react"
import Image from "next/image"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  draggable?: boolean
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  draggable = false
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={`relative ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse rounded" />
      )}
      {hasError ? (
        <div className="flex items-center justify-center bg-gray-800 text-gray-400 rounded">
          <span>Image not available</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          priority={priority}
          draggable={draggable}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
          style={{
            objectFit: 'contain',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      )}
    </div>
  )
}