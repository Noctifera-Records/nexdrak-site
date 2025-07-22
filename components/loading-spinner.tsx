"use client"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  variant?: "default" | "pulse" | "dots"
}

export default function LoadingSpinner({ 
  size = "md", 
  className = "",
  variant = "default" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  if (variant === "pulse") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${sizeClasses[size]} bg-white/20 rounded-full animate-pulse`} />
      </div>
    )
  }

  if (variant === "dots") {
    return (
      <div className={`flex items-center justify-center space-x-1 ${className}`}>
        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <div className={`${sizeClasses[size]} border-2 border-white/20 border-t-white rounded-full animate-spin`} />
    </div>
  )
}