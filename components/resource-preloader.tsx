'use client';

import { useEffect } from 'react';

export default function ResourcePreloader() {
  useEffect(() => {
    // Preload critical resources
    const preloadResources = [
      // Critical CSS
      '/_next/static/css/app/layout.css',
      // Critical fonts
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      // Critical images (add your actual image URLs)
      '/favicon.ico',
      '/apple-touch-icon.png',
    ];

    preloadResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (resource.endsWith('.css')) {
        link.as = 'style';
        link.href = resource;
      } else if (resource.includes('fonts.googleapis.com')) {
        link.as = 'style';
        link.href = resource;
      } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
        link.as = 'image';
        link.href = resource;
      } else if (resource.match(/\.(woff|woff2)$/)) {
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = resource;
      }
      
      if (link.href) {
        document.head.appendChild(link);
      }
    });

    // Prefetch next likely pages
    const prefetchPages = [
      '/music',
      '/about',
      '/contact',
    ];

    prefetchPages.forEach((page) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });

    // DNS prefetch for external domains
    const dnsPrefetch = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.youtube.com',
      'https://open.spotify.com',
    ];

    dnsPrefetch.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

  }, []);

  return null;
}