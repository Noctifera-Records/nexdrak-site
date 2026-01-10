'use client';

import { useState, useRef, useEffect } from 'react';
import { Play } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  dominantColor: string;
}

export default function YouTubePlayer({ videoId, title, dominantColor }: YouTubePlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoadVideo = () => {
    setIsLoaded(true);
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width: '100%', 
        paddingBottom: '56.25%',
        height: 0,
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#000',
        border: `2px solid ${dominantColor}30`
      }}
    >
      {!isLoaded ? (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: `linear-gradient(135deg, ${dominantColor}20, rgba(0,0,0,0.8))`,
            transition: 'all 0.3s ease'
          }}
          onClick={handleLoadVideo}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${dominantColor}30, rgba(0,0,0,0.7))`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${dominantColor}20, rgba(0,0,0,0.8))`;
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            color: 'white'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: dominantColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 32px ${dominantColor}40`
            }}>
              <Play style={{ width: '32px', height: '32px', marginLeft: '4px' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                Load YouTube Video
              </p>
              <p style={{ fontSize: '14px', opacity: 0.8, margin: '4px 0 0 0' }}>
                Click to watch {title}
              </p>
            </div>
          </div>
        </div>
      ) : (
        isIntersecting && (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&color=white&autoplay=0`}
            title={title}
            frameBorder="0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '8px'
            }}
          />
        )
      )}
    </div>
  );
}