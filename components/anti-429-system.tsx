'use client';

import { useEffect, useState } from 'react';

export default function Anti429System() {
  const [retryCount, setRetryCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    let requestQueue: Array<() => Promise<any>> = [];
    let isProcessing = false;
    let failedRequests = new Set<string>();

    // Process requests one by one with delay
    const processQueue = async () => {
      if (isProcessing || requestQueue.length === 0) return;
      
      isProcessing = true;
      
      while (requestQueue.length > 0) {
        const request = requestQueue.shift();
        if (request) {
          try {
            await request();
            // Small delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.warn('Queued request failed:', error);
          }
        }
      }
      
      isProcessing = false;
    };

    // Override fetch to queue requests and handle 429s
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : input.url;
      
      // If this is a chunk request that previously failed, skip it
      if (url.includes('/_next/static/chunks/') && failedRequests.has(url)) {
        console.warn('Skipping previously failed chunk:', url);
        return new Response('{}', { status: 200 });
      }

      try {
        const response = await originalFetch.call(this, input, init);
        
        if (response.status === 429) {
          console.warn('429 detected for:', url);
          
          // Mark chunk requests as failed
          if (url.includes('/_next/static/chunks/')) {
            failedRequests.add(url);
            
            // If too many chunks are failing, reload the page
            if (failedRequests.size > 3) {
              console.warn('Too many chunk failures, reloading page');
              setTimeout(() => window.location.reload(), 2000);
            }
            
            // Return a mock response to prevent crashes
            return new Response('{}', { 
              status: 200,
              headers: { 'Content-Type': 'application/javascript' }
            });
          }
          
          // For other 429s, retry after delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          return originalFetch.call(this, input, init);
        }
        
        return response;
      } catch (error) {
        console.warn('Fetch error for:', url, error);
        
        // If it's a chunk request, mark as failed and return mock response
        if (url.includes('/_next/static/chunks/')) {
          failedRequests.add(url);
          return new Response('{}', { 
            status: 200,
            headers: { 'Content-Type': 'application/javascript' }
          });
        }
        
        throw error;
      }
    };

    // Handle script loading errors
    const handleScriptError = (event: Event) => {
      const target = event.target as HTMLScriptElement;
      if (target && target.src && target.src.includes('/_next/static/chunks/')) {
        console.warn('Script loading failed:', target.src);
        failedRequests.add(target.src);
        
        // Remove the failed script
        target.remove();
        
        // If too many scripts fail, reload
        if (failedRequests.size > 5) {
          console.warn('Too many script failures, reloading page');
          setIsBlocked(true);
          setTimeout(() => window.location.reload(), 3000);
        }
        
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      if (error?.message?.includes('Loading chunk') || 
          error?.message?.includes('ChunkLoadError')) {
        console.warn('Chunk loading error handled:', error.message);
        event.preventDefault();
        
        setRetryCount(prev => prev + 1);
        
        // If too many chunk errors, reload
        if (retryCount > 3) {
          setIsBlocked(true);
          setTimeout(() => window.location.reload(), 2000);
        }
      }
    };

    // Add event listeners
    document.addEventListener('error', handleScriptError, true);
    window.addEventListener('unhandledrejection', handleRejection);

    // Monitor for 429 errors in network requests
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('/_next/static/chunks/')) {
          // @ts-ignore - responseStatus might not be available in all browsers
          if (entry.responseStatus === 429) {
            console.warn('429 detected in performance entry:', entry.name);
            failedRequests.add(entry.name);
          }
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    } catch (error) {
      console.warn('Performance observer not supported');
    }

    // Cleanup
    return () => {
      window.fetch = originalFetch;
      document.removeEventListener('error', handleScriptError, true);
      window.removeEventListener('unhandledrejection', handleRejection);
      observer.disconnect();
    };
  }, [retryCount]);

  // Show blocking message if too many errors
  if (isBlocked) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999]">
        <div className="text-center text-white p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Optimizando carga...</h2>
          <p className="text-gray-300">
            Detectamos problemas de red. Recargando la página para una mejor experiencia.
          </p>
        </div>
      </div>
    );
  }

  return null;
}