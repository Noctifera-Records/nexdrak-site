'use client';

import { useEffect } from 'react';

export default function ChunkErrorHandler() {
  useEffect(() => {
    // Override the default chunk loading error handler
    const originalOnError = window.onerror;
    const originalOnUnhandledRejection = window.onunhandledrejection;

    // Handle chunk loading errors specifically
    window.onerror = function(message, source, lineno, colno, error) {
      // Check if it's a chunk loading error
      if (
        typeof message === 'string' && 
        (message.includes('Loading chunk') || 
         message.includes('ChunkLoadError') ||
         source?.includes('/_next/static/chunks/'))
      ) {
        console.warn('Chunk loading error detected, reloading page:', message);
        // Reload the page to get a fresh start
        window.location.reload();
        return true; // Prevent default error handling
      }

      // Call original error handler for other errors
      if (originalOnError) {
        return originalOnError.call(this, message, source, lineno, colno, error);
      }
      return false;
    };

    // Handle promise rejections from chunk loading
    window.onunhandledrejection = function(event) {
      const error = event.reason;
      
      if (
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('ChunkLoadError') ||
        error?.name === 'ChunkLoadError'
      ) {
        console.warn('Chunk loading promise rejection, reloading page:', error);
        event.preventDefault();
        window.location.reload();
        return;
      }

      // Call original handler for other rejections
      if (originalOnUnhandledRejection) {
        return originalOnUnhandledRejection.call(this, event);
      }
    };

    // Handle 429 errors specifically
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      try {
        const response = await originalFetch.apply(this, args);
        
        // If we get a 429 error on a chunk request, reload the page
        if (response.status === 429 && args[0]?.toString().includes('/_next/static/chunks/')) {
          console.warn('429 error on chunk request, reloading page');
          setTimeout(() => window.location.reload(), 1000);
          // Return a mock response to prevent crashes
          return new Response('{}', { status: 200 });
        }
        
        return response;
      } catch (error) {
        // If fetch fails on a chunk, reload the page
        if (args[0]?.toString().includes('/_next/static/chunks/')) {
          console.warn('Fetch error on chunk request, reloading page');
          setTimeout(() => window.location.reload(), 1000);
          throw error;
        }
        throw error;
      }
    };

    // Cleanup function
    return () => {
      window.onerror = originalOnError;
      window.onunhandledrejection = originalOnUnhandledRejection;
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}