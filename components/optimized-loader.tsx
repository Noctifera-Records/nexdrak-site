'use client';

import { useEffect, useState } from 'react';

interface OptimizedLoaderProps {
  children: React.ReactNode;
}

export default function OptimizedLoader({ children }: OptimizedLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Check if page is already loaded
    if (document.readyState === 'complete') {
      setIsLoaded(true);
      setShowLoader(false);
      return;
    }

    // Set a maximum loading time to prevent infinite loading
    const maxLoadTime = setTimeout(() => {
      setIsLoaded(true);
      setShowLoader(false);
    }, 2000);

    // Listen for page load completion
    const handleLoad = () => {
      clearTimeout(maxLoadTime);
      setIsLoaded(true);
      setShowLoader(false);
    };

    // Add minimal delay only on first load
    const minDelay = setTimeout(() => {
      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
      }
    }, 50);

    return () => {
      clearTimeout(maxLoadTime);
      clearTimeout(minDelay);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  if (showLoader && !isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}