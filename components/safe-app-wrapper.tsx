'use client';

import { useEffect, useState, ReactNode } from 'react';

interface SafeAppWrapperProps {
  children: ReactNode;
}

export default function SafeAppWrapper({ children }: SafeAppWrapperProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    // Handle all types of errors that could crash the app
    const handleError = (event: ErrorEvent) => {
      // Check if it's a 429 or network error
      if (event.message?.includes('429') || event.message?.includes('Failed to fetch')) {
        setErrorCount(prev => prev + 1);
        if (errorCount < 5) { // Only show error after multiple failures
          console.warn('Network error detected, continuing...', event.message);
          return;
        }
        setHasNetworkError(true);
      }
      
      // Prevent the error from crashing the app
      event.preventDefault();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Handle promise rejections (like failed fetch requests)
      console.warn('Promise rejection handled:', event.reason);
      
      if (event.reason?.message?.includes('429') || 
          event.reason?.status === 429) {
        setErrorCount(prev => prev + 1);
        event.preventDefault();
        return;
      }
      
      // Prevent crash
      event.preventDefault();
    };

    // Add global error handlers
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Override fetch to handle 429 errors gracefully
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (response.status === 429) {
          console.warn('429 error intercepted for:', args[0]);
          // Return a mock successful response to prevent crashes
          return new Response('{}', { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }
        return response;
      } catch (error) {
        console.warn('Fetch error intercepted:', error);
        // Return a mock response instead of throwing
        return new Response('{}', { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    };

    // Set ready state after a short delay
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 500);

    return () => {
      clearTimeout(readyTimer);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.fetch = originalFetch; // Restore original fetch
    };
  }, [errorCount]);

  const handleRetry = () => {
    setHasNetworkError(false);
    setErrorCount(0);
    window.location.reload();
  };

  const handleContinue = () => {
    setHasNetworkError(false);
    setIsReady(true);
  };

  if (hasNetworkError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Network Issues Detected</h2>
          <p className="text-gray-300 mb-6">
            Some resources are having trouble loading due to rate limiting. 
            You can continue using the site or try refreshing.
          </p>
          <div className="space-x-4">
            <button
              onClick={handleContinue}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Continue Anyway
            </button>
            <button
              onClick={handleRetry}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white">Loading NexDrak...</div>
          <div className="text-gray-400 text-sm mt-2">
            Initializing application...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}