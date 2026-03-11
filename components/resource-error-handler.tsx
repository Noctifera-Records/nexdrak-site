'use client';

import { useEffect } from 'react';

export default function ResourceErrorHandler() {
  useEffect(() => {
    // Handle script loading errors specifically
    const handleScriptError = (event: Event) => {
      const target = event.target as HTMLScriptElement;
      if (target && target.tagName === 'SCRIPT') {
        console.warn('Script failed to load:', target.src);
        
        // If it's a Next.js chunk, try to continue without it
        if (target.src.includes('/_next/static/chunks/')) {
          event.preventDefault();
          event.stopPropagation();
          
          // Remove the failed script element
          target.remove();
          
          // Dispatch a custom event to signal the app can continue
          window.dispatchEvent(new CustomEvent('chunk-load-failed', {
            detail: { src: target.src }
          }));
        }
      }
    };

    // Handle CSS loading errors
    const handleLinkError = (event: Event) => {
      const target = event.target as HTMLLinkElement;
      if (target && target.tagName === 'LINK' && target.rel === 'stylesheet') {
        console.warn('CSS failed to load:', target.href);
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Add error listeners to the document
    document.addEventListener('error', handleScriptError, true);
    document.addEventListener('error', handleLinkError, true);

    // Override the script loading mechanism to handle 429 errors
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName: string, options?: ElementCreationOptions) {
      const element = originalCreateElement.call(this, tagName, options);
      
      if (tagName.toLowerCase() === 'script') {
        const script = element as HTMLScriptElement;
        const originalOnError = script.onerror;
        
        script.onerror = function(event: Event | string) {
          console.warn('Script error intercepted:', script.src);
          
          // If it's a Next.js chunk error, don't let it crash the app
          if (script.src && script.src.includes('/_next/static/chunks/')) {
            if (typeof event !== 'string') {
              event.preventDefault();
            }
            return false;
          }
          
          if (originalOnError) {
            return originalOnError.call(this, event);
          }
          return false;
        };
      }
      
      return element;
    };

    // Handle chunk loading failures
    const handleChunkLoadFailed = (event: Event) => {
      const customEvent = event as CustomEvent<{ src?: string }>;
      console.log('Chunk load failed, but app continues:', customEvent.detail?.src);
    };

    window.addEventListener('chunk-load-failed' as any, handleChunkLoadFailed as EventListener);

    return () => {
      document.removeEventListener('error', handleScriptError, true);
      document.removeEventListener('error', handleLinkError, true);
      window.removeEventListener('chunk-load-failed' as any, handleChunkLoadFailed as EventListener);
      document.createElement = originalCreateElement;
    };
  }, []);

  return null;
}
