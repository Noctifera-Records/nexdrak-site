'use client';

import { useEffect, useState } from 'react';

interface HydrationFixProps {
  children: React.ReactNode;
}

export default function HydrationFix({ children }: HydrationFixProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Handle hydration errors
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('Cannot read properties of null') && 
          event.message?.includes('firstChild')) {
        console.warn('Hydration error handled, forcing re-render');
        event.preventDefault();
        event.stopPropagation();
        
        // Force a re-render after hydration error
        setIsHydrated(false);
        setTimeout(() => setIsHydrated(true), 100);
        return true;
      }
      return false;
    };

    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('Cannot read properties of null') && 
          event.reason?.message?.includes('firstChild')) {
        console.warn('Hydration promise rejection handled');
        event.preventDefault();
        
        // Force a re-render
        setIsHydrated(false);
        setTimeout(() => setIsHydrated(true), 100);
      }
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleRejection);

    // Set hydrated state
    setIsHydrated(true);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Show loading state during hydration issues
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}