'use client';

import { useEffect } from 'react';

export default function ResourcePreloader() {
  useEffect(() => {
    // Preload critical resources with staggered timing to avoid 429 errors
    const preloadResources = async () => {
      const criticalResources = [
        '/favicon.ico',
        '/android-chrome-192x192.png',
        '/apple-touch-icon.png',
        '/site.webmanifest'
      ];

      // Stagger resource loading to prevent rate limiting
      for (let i = 0; i < criticalResources.length; i++) {
        setTimeout(() => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = criticalResources[i];
          document.head.appendChild(link);
        }, i * 100); // 100ms delay between each resource
      }
    };

    // Only preload if document is ready
    if (document.readyState === 'complete') {
      preloadResources();
    } else {
      window.addEventListener('load', preloadResources);
      return () => window.removeEventListener('load', preloadResources);
    }
  }, []);

  return null;
}