'use client';

import { useEffect, useState } from 'react';

export default function Smart429Handler() {
  const [error429Count, setError429Count] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    let notificationTimeout: NodeJS.Timeout;

    // Only handle actual 429 errors, don't interfere with navigation
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
      try {
        const response = await originalFetch.call(this, input, init);
        
        // Only handle 429 errors for static resources, not navigation
        if (response.status === 429) {
          const url = typeof input === 'string' ? input : input.url;
          
          // Only handle static resources, not page navigation
          if (url.includes('/_next/static/') || url.includes('/api/')) {
            console.warn('429 error on static resource:', url);
            setError429Count(prev => prev + 1);
            
            // Show notification for user awareness
            setShowNotification(true);
            clearTimeout(notificationTimeout);
            notificationTimeout = setTimeout(() => {
              setShowNotification(false);
            }, 3000);
            
            // For static chunks, return a minimal mock response
            if (url.includes('/_next/static/chunks/')) {
              return new Response('', {
                status: 200,
                headers: { 'Content-Type': 'application/javascript' }
              });
            }
            
            // For CSS files, return empty CSS
            if (url.includes('/_next/static/css/')) {
              return new Response('', {
                status: 200,
                headers: { 'Content-Type': 'text/css' }
              });
            }
            
            // For other resources, wait a bit and retry once
            await new Promise(resolve => setTimeout(resolve, 1000));
            return originalFetch.call(this, input, init);
          }
        }
        
        return response;
      } catch (error) {
        // Don't interfere with normal errors, just pass them through
        throw error;
      }
    };

    // Handle script and CSS loading errors
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLScriptElement | HTMLLinkElement;
      
      if (target?.tagName === 'SCRIPT' && target.src?.includes('/_next/static/chunks/')) {
        console.warn('Chunk loading failed, but continuing:', target.src);
        // Remove the failed script but don't reload the page
        target.remove();
        event.preventDefault();
        event.stopPropagation();
      }
      
      if (target?.tagName === 'LINK' && target.href?.includes('/_next/static/css/')) {
        console.warn('CSS loading failed, but continuing:', target.href);
        // Remove the failed CSS link but don't reload the page
        target.remove();
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Handle MIME type errors specifically
    const handleMimeError = (event: ErrorEvent) => {
      if (event.message?.includes('MIME type') && event.message?.includes('text/css')) {
        console.warn('CSS MIME type error handled:', event.message);
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
      return false;
    };

    // Override document.createElement to fix CSS loading issues
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName: string, options?: ElementCreationOptions) {
      const element = originalCreateElement.call(this, tagName, options);
      
      // Fix script tags that might be loading CSS
      if (tagName.toLowerCase() === 'script') {
        const script = element as HTMLScriptElement;
        const originalOnError = script.onerror;
        
        script.onerror = function(event) {
          // Check if this script is actually trying to load CSS
          if (script.src && script.src.includes('.css')) {
            console.warn('Script trying to load CSS file, converting to link:', script.src);
            
            // Create a proper link element for CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = script.src;
            link.type = 'text/css';
            
            // Replace the script with the link
            if (script.parentNode) {
              script.parentNode.replaceChild(link, script);
            }
            
            event.preventDefault();
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

    document.addEventListener('error', handleResourceError, true);
    window.addEventListener('error', handleMimeError, true);

    return () => {
      window.fetch = originalFetch;
      document.createElement = originalCreateElement;
      document.removeEventListener('error', handleResourceError, true);
      window.removeEventListener('error', handleMimeError, true);
      clearTimeout(notificationTimeout);
    };
  }, []);

  // Show a subtle notification if there are 429 errors
  if (showNotification && error429Count > 0) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-900/80 border border-yellow-600 text-yellow-200 px-3 py-2 rounded-md shadow-lg z-50 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <span>Optimizando carga de recursos...</span>
        </div>
      </div>
    );
  }

  return null;
}