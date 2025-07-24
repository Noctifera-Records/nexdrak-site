"use client"

import { useState } from "react"
import Image, { ImageProps } from "next/image"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  draggable?: boolean
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className = "",
  priority = false,
  draggable = false,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={`relative ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse rounded" />
      )}
      {hasError ? (
        <div className="flex items-center justify-center bg-gray-800 text-gray-400 rounded h-full w-full">
          <span>Image not available</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          {...(fill ? { fill: true } : { width, height })}
          className={className}
          priority={priority}
          draggable={draggable}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
        />
      )}
    </div>
  )
}