"use client"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  variant?: "default" | "pulse" | "dots" | "audio"
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

  if (variant === "audio") {
    // Audio wave animation
    const barClass = "bg-white w-1 mx-0.5 rounded-full animate-audio-wave";
    const height = size === "sm" ? "h-3" : size === "md" ? "h-6" : "h-10";
    
    return (
      <div className={`flex items-end justify-center ${height} ${className}`} role="status" aria-label="Loading">
        <div className={`${barClass}`} style={{ animationDuration: "1s", animationDelay: "0.0s", height: "40%" }}></div>
        <div className={`${barClass}`} style={{ animationDuration: "1.2s", animationDelay: "0.1s", height: "100%" }}></div>
        <div className={`${barClass}`} style={{ animationDuration: "0.8s", animationDelay: "0.2s", height: "60%" }}></div>
        <div className={`${barClass}`} style={{ animationDuration: "1.1s", animationDelay: "0.3s", height: "80%" }}></div>
        <div className={`${barClass}`} style={{ animationDuration: "0.9s", animationDelay: "0.4s", height: "50%" }}></div>
      </div>
    )
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