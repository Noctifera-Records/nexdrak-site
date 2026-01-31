"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Beaker, 
  Palette, 
  Zap, 
  Music, 
  Sparkles, 
  Volume2,
  VolumeX,
  RotateCcw,
  Code,
  Wand2,
  Download
} from "lucide-react";

type ColorScheme = 'neon' | 'cyber' | 'sunset' | 'ocean';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function PlaygroundPage() {
  const [activeExperiment, setActiveExperiment] = useState<string>('visualizer');
  const [isPlaying, setIsPlaying] = useState(false);
  const [colorScheme, setColorScheme] = useState<ColorScheme>('neon');
  const [particles, setParticles] = useState<Particle[]>([]);

  // Initialize particles
  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    }));
    setParticles(newParticles);
  }, []);

  // Animate particles
  useEffect(() => {
    if (!isPlaying || typeof window === 'undefined') return;
    
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.vx + window.innerWidth) % window.innerWidth,
        y: (particle.y + particle.vy + window.innerHeight) % window.innerHeight
      })));
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const experiments = [
    {
      id: 'visualizer',
      name: 'Audio Visualizer',
      icon: Music,
      description: 'Interactive music visualization'
    },
    {
      id: 'particles',
      name: 'Particle System',
      icon: Sparkles,
      description: 'Dynamic particle animation'
    },
    {
      id: 'colorlab',
      name: 'Color Lab',
      icon: Palette,
      description: 'Color scheme generator'
    },
    {
      id: 'synth',
      name: 'Web Synth',
      icon: Zap,
      description: 'Browser-based synthesizer'
    }
  ];

  const colorSchemes: Record<ColorScheme, string[]> = {
    neon: ['#ff0080', '#00ff80', '#8000ff', '#ff8000'],
    cyber: ['#00ffff', '#ff00ff', '#ffff00', '#ff0040'],
    sunset: ['#ff6b35', '#f7931e', '#ffd23f', '#06ffa5'],
    ocean: ['#0077be', '#00a8cc', '#40e0d0', '#7fffd4']
  };

  // Deterministic PRNG to avoid hydration mismatches in demo sections
  const hashSeed = (str: string) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  const mulberry32 = (a: number) => {
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };
  const visualizerBars = useMemo(() => {
    const rnd = mulberry32(hashSeed("visualizer-seed"));
    return Array.from({ length: 20 }, () => ({
      height: rnd() * 150 + 20,
      duration: rnd() * 0.5 + 0.5
    }));
  }, []);
  const particleDotsDemo = useMemo(() => {
    const rnd = mulberry32(hashSeed("particles-seed"));
    return Array.from({ length: 30 }, () => ({
      left: rnd() * 100,
      top: rnd() * 100,
      duration: rnd() * 3 + 2
    }));
  }, []);

  const resetParticles = () => {
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    }));
    setParticles(newParticles);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: 'white', position: 'relative', overflow: 'hidden' }}>
      {/* Animated Background */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y,
              width: '2px',
              height: '2px',
              backgroundColor: colorSchemes[colorScheme][particle.id % 4],
              borderRadius: '50%',
              opacity: isPlaying ? 0.8 : 0.3,
              transition: 'opacity 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '96px 16px 32px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
              <Beaker style={{ width: '32px', height: '32px', color: colorSchemes[colorScheme][0] }} />
              <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: 0 }}>PLAYGROUND</h1>
            </div>
            <p style={{ fontSize: '18px', color: '#9ca3af', maxWidth: '600px', margin: '0 auto' }}>
              Experimental features, creative tools, and interactive experiences. 
              This is where we test new ideas and push boundaries.
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                backgroundColor: isPlaying ? colorSchemes[colorScheme][0] : 'transparent',
                border: `2px solid ${colorSchemes[colorScheme][0]}`,
                color: isPlaying ? '#000' : colorSchemes[colorScheme][0],
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {isPlaying ? 'Stop' : 'Start'} Animation
            </Button>
            
            <select
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value as ColorScheme)}
              style={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                border: `1px solid ${colorSchemes[colorScheme][1]}`,
                borderRadius: '6px',
                color: 'white',
                padding: '8px 12px'
              }}
            >
              <option value="neon">Neon</option>
              <option value="cyber">Cyber</option>
              <option value="sunset">Sunset</option>
              <option value="ocean">Ocean</option>
            </select>

            <Button
              onClick={resetParticles}
              style={{
                backgroundColor: 'transparent',
                border: `2px solid ${colorSchemes[colorScheme][2]}`,
                color: colorSchemes[colorScheme][2],
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Experiment Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {experiments.map((experiment) => {
              const IconComponent = experiment.icon;
              const isActive = activeExperiment === experiment.id;
              
              return (
                <Card 
                  key={experiment.id}
                  style={{
                    backgroundColor: isActive ? `${colorSchemes[colorScheme][0]}20` : 'rgba(31, 41, 55, 0.5)',
                    border: `2px solid ${isActive ? colorSchemes[colorScheme][0] : 'rgba(75, 85, 99, 0.6)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setActiveExperiment(experiment.id)}
                >
                  <CardContent style={{ padding: '24px', textAlign: 'center' }}>
                    <IconComponent 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        color: isActive ? colorSchemes[colorScheme][0] : '#9ca3af',
                        margin: '0 auto 12px auto'
                      }} 
                    />
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
                      {experiment.name}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                      {experiment.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Experiment Content */}
          <Card style={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: `1px solid ${colorSchemes[colorScheme][0]}` }}>
            <CardContent style={{ padding: '32px' }}>
              {activeExperiment === 'visualizer' && (
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: colorSchemes[colorScheme][0] }}>
                    Audio Visualizer
                  </h2>
                  <div style={{ 
                    height: '200px', 
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    border: `1px solid ${colorSchemes[colorScheme][1]}`
                  }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'end' }}>
                    {visualizerBars.map((bar, i) => (
                        <div
                          key={i}
                          style={{
                            width: '8px',
                          height: `${bar.height}px`,
                            backgroundColor: colorSchemes[colorScheme][i % 4],
                            borderRadius: '4px 4px 0 0',
                          animation: isPlaying ? `pulse ${bar.duration}s infinite alternate` : 'none'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: '#9ca3af' }}>
                    Real-time audio visualization with frequency analysis
                  </p>
                </div>
              )}

              {activeExperiment === 'particles' && (
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: colorSchemes[colorScheme][1] }}>
                    Particle System
                  </h2>
                  <div style={{ 
                    height: '200px', 
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    border: `1px solid ${colorSchemes[colorScheme][1]}`
                  }}>
                    {particleDotsDemo.map((dot, i) => (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          left: `${dot.left}%`,
                          top: `${dot.top}%`,
                          width: '4px',
                          height: '4px',
                          backgroundColor: colorSchemes[colorScheme][i % 4],
                          borderRadius: '50%',
                          animation: isPlaying ? `float ${dot.duration}s infinite linear` : 'none'
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ color: '#9ca3af' }}>
                    Dynamic particle physics simulation with collision detection
                  </p>
                </div>
              )}

              {activeExperiment === 'colorlab' && (
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: colorSchemes[colorScheme][2] }}>
                    Color Lab
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    {colorSchemes[colorScheme].map((color, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          backgroundColor: color,
                          borderRadius: '8px',
                          margin: '0 auto 8px auto',
                          border: '2px solid rgba(255, 255, 255, 0.2)'
                        }} />
                        <code style={{ fontSize: '12px', color: '#9ca3af' }}>{color}</code>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: '#9ca3af' }}>
                    Generate and experiment with color palettes for creative projects
                  </p>
                </div>
              )}

              {activeExperiment === 'synth' && (
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: colorSchemes[colorScheme][3] }}>
                    Web Synth
                  </h2>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(7, 1fr)', 
                    gap: '4px', 
                    maxWidth: '400px', 
                    margin: '0 auto 16px auto' 
                  }}>
                    {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note, i) => (
                      <button
                        key={note}
                        style={{
                          height: '60px',
                          backgroundColor: colorSchemes[colorScheme][i % 4],
                          border: 'none',
                          borderRadius: '4px',
                          color: '#000',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.1s ease'
                        }}
                        onMouseDown={(e) => {
                          const target = e.target as HTMLButtonElement;
                          target.style.transform = 'scale(0.95)';
                          target.style.opacity = '0.8';
                        }}
                        onMouseUp={(e) => {
                          const target = e.target as HTMLButtonElement;
                          target.style.transform = 'scale(1)';
                          target.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          const target = e.target as HTMLButtonElement;
                          target.style.transform = 'scale(1)';
                          target.style.opacity = '1';
                        }}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                  <p style={{ color: '#9ca3af' }}>
                    Browser-based synthesizer with Web Audio API
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '48px', padding: '24px', backgroundColor: 'rgba(31, 41, 55, 0.3)', borderRadius: '8px' }}>
            <Code style={{ width: '24px', height: '24px', color: colorSchemes[colorScheme][0], margin: '0 auto 12px auto' }} />
            <p style={{ color: '#9ca3af', marginBottom: '16px' }}>
              This playground is built with React, Web APIs, and creative coding techniques.
              Experiment, learn, and have fun!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Button
                style={{
                  backgroundColor: 'transparent',
                  border: `1px solid ${colorSchemes[colorScheme][0]}`,
                  color: colorSchemes[colorScheme][0],
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Wand2 className="h-4 w-4" />
                View Source
              </Button>
              <Button
                style={{
                  backgroundColor: 'transparent',
                  border: `1px solid ${colorSchemes[colorScheme][1]}`,
                  color: colorSchemes[colorScheme][1],
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scaleY(1); }
          100% { transform: scaleY(0.3); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-20px) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
