'use client';

import { useEffect } from 'react';

export default function MimeTypeFixer() {
  useEffect(() => {
    // Intercept all script creation and fix CSS loading issues
    const originalCreateElement = document.createElement;
    
    document.createElement = function<K extends keyof HTMLElementTagNameMap>(
      tagName: K,
      options?: ElementCreationOptions
    ): HTMLElementTagNameMap[K] {
      const element = originalCreateElement.call(this, tagName, options);
      
      if (tagName.toLowerCase() === 'script') {
        const script = element as HTMLScriptElement;
        
        // Override the src setter to catch CSS files being loaded as scripts
        const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
        
        Object.defineProperty(script, 'src', {
          get: function() {
            return originalSrcDescriptor?.get?.call(this) || '';
          },
          set: function(value: string) {
            // If someone tries to load a CSS file as a script, prevent it
            if (value && value.includes('.css')) {
              console.warn('Prevented CSS file from being loaded as script:', value);
              
              // Create a proper link element instead
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.type = 'text/css';
              link.href = value;
              
              // Add the link to the head
              document.head.appendChild(link);
              
              // Don't set the src on the script
              return;
            }
            
            // Normal script loading
            originalSrcDescriptor?.set?.call(this, value);
          },
          configurable: true,
          enumerable: true
        });
        
        // Also override onerror to handle any remaining issues
        const originalOnError = script.onerror;
        script.onerror = function(event) {
          const src = script.src;
          if (src && src.includes('.css')) {
            console.warn('CSS MIME type error prevented for:', src);
            event.preventDefault();
            event.stopPropagation();
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

    // Also handle existing scripts that might have CSS sources
    const handleExistingScripts = () => {
      const scripts = document.querySelectorAll('script[src*=".css"]');
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && src.includes('.css')) {
          console.warn('Found existing script loading CSS, fixing:', src);
          
          // Create proper link element
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.href = src;
          
          // Replace script with link
          script.parentNode?.replaceChild(link, script);
        }
      });
    };

    // Fix existing scripts immediately
    handleExistingScripts();
    
    // Also check periodically for new problematic scripts
    const intervalId = setInterval(handleExistingScripts, 1000);

    // Handle global errors related to MIME types
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.message?.includes('MIME type') && 
          event.message?.includes('text/css') && 
          event.message?.includes('not executable')) {
        console.warn('Global CSS MIME type error handled:', event.message);
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
      return false;
    };

    window.addEventListener('error', handleGlobalError, true);

    // Cleanup
    return () => {
      document.createElement = originalCreateElement;
      window.removeEventListener('error', handleGlobalError, true);
      clearInterval(intervalId);
    };
  }, []);

  return null;
}