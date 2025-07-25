'use client';

import { useEffect, useState } from 'react';

interface OptimizedLoaderProps {
  children: React.ReactNode;
}

export default function OptimizedLoader({ children }: OptimizedLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add a small delay to prevent too many simultaneous requests
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}