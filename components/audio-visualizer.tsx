"use client";

import { useRef, useEffect, useState } from "react";
import { makeNoise2D } from "open-simplex-noise";

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
}

export default function AudioVisualizer({
  audioElement,
  isPlaying,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  const noise2D = useRef(makeNoise2D(Date.now())).current;

  useEffect(() => {
    if (!audioElement) return;
    const ctx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.3;
    try {
      const src = ctx.createMediaElementSource(audioElement);
      src.connect(analyserNode);
      analyserNode.connect(ctx.destination);
    } catch {
      console.warn("Audio source ya conectado.");
    }
    setAnalyser(analyserNode);
  }, [audioElement]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);
    let rotation = 0;
    let hue = 120;
    let glitchTimer = 0;

    const SILENCE_THRESHOLD = 10;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawAnimatedPattern(ctx, canvas, performance.now() / 1000);

      let isSilent = false;

      if (isPlaying && analyser) {
        analyser.getByteFrequencyData(data);

        const avg = data.reduce((sum, val) => sum + val, 0) / data.length;

        if (avg < SILENCE_THRESHOLD) {
          const time = performance.now() / 500;
          for (let i = 0; i < bufLen; i++) {
            data[i] = 32 + Math.sin(time + i * 0.1) * 8;
          }
          isSilent = true;
        }
      } else {
        const time = performance.now() / 500;
        for (let i = 0; i < bufLen; i++) {
          data[i] = 16 + Math.sin(time + i * 0.1) * 4;
        }
        isSilent = true;
      }

      drawMultiThin(ctx, canvas, data, rotation, hue, noise2D, isSilent);
      drawExtremeGlitch(ctx, canvas, glitchTimer);

      rotation += isPlaying && !isSilent ? 0.015 : 0.003;
      hue = (hue + 0.3) % 360;
      glitchTimer++;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [analyser, isPlaying, noise2D]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full -z-10"
    />
  );
}

function drawAnimatedPattern(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  time: number
) {
  const patternCanvas = document.createElement("canvas");
  const patternCtx = patternCanvas.getContext("2d")!;
  const patternSize = 32;
  patternCanvas.width = patternSize;
  patternCanvas.height = patternSize;

  patternCtx.fillStyle = `rgba(100, 100, 100, 0.1)`;
  patternCtx.fillRect(0, 0, patternSize, patternSize);
  patternCtx.fillStyle = `rgba(150, 50, 150, 0.05)`;
  patternCtx.beginPath();
  patternCtx.arc(
    patternSize / 2,
    patternSize / 2,
    patternSize / 4,
    0,
    Math.PI * 2
  );
  patternCtx.fill();

  const pattern = ctx.createPattern(patternCanvas, "repeat")!;
  ctx.fillStyle = pattern;

  const speedX = 20;
  const speedY = 15;
  const offsetX = (time * speedX) % patternSize;
  const offsetY = (time * speedY) % patternSize;

  ctx.setTransform(1, 0, 0, 1, offsetX, offsetY);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawMultiThin(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  data: Uint8Array,
  rotation: number,
  hue: number,
  noise2D: (x: number, y: number) => number,
  isSilent: boolean, // Nuevo parámetro
  layers = 3
) {
  const W = canvas.width,
    H = canvas.height;
  const cx = W / 2,
    cy = H / 2;
  const baseR = Math.min(cx, cy) * 0.4;
  const time = performance.now() * 0.001;

  for (let layer = 0; layer < layers; layer++) {
    const phase = rotation * (1 + layer * 0.1) + (layer / layers) * Math.PI * 2;
    const width = 4 + (layers - layer) * 0.3;
    const hueOffset = hue + layer * 8;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(phase);
    ctx.beginPath();
    ctx.lineJoin = "round";

    const N = data.length;
    for (let i = 0; i < N; i++) {
      const v = data[i] / 255;
      const angle = (i / N) * Math.PI * 2;

      // Reducir o eliminar efectos durante el silencio
      const jitter = isSilent ? 0 : (Math.random() - 0.5) * baseR * 0.2;
      const n1 = isSilent ? 0 : noise2D((i / N) * 4 + layer, time) * 0.5;
      const spike = isSilent ? 0 : v > 0.7 && i % 5 === 0 ? v * baseR * 0.3 : 0;

      const r = baseR + v * baseR * 0.7 + jitter + n1 * baseR + spike;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);

      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }

    ctx.closePath();

    // Gradiente más suave durante el silencio
    const grad = ctx.createRadialGradient(0, 0, baseR * 0.2, 0, 0, baseR * 1.3);
    if (isSilent) {
      grad.addColorStop(0, `hsla(${hueOffset},100%,30%,0.5)`);
      grad.addColorStop(0.5, `hsla(${hueOffset + 10},100%,20%,0.4)`);
      grad.addColorStop(1, `hsla(${hueOffset + 20},100%,15%,0.3)`);
    } else {
      grad.addColorStop(0, `hsla(${hueOffset},100%,70%,1)`);
      grad.addColorStop(0.5, `hsla(${hueOffset + 20},100%,50%,0.9)`);
      grad.addColorStop(1, `hsla(${hueOffset + 40},100%,40%,0.8)`);
    }

    ctx.strokeStyle = grad;
    ctx.lineWidth = isSilent ? width * 0.7 : width;
    ctx.shadowBlur = isSilent ? 4 : 8;
    ctx.shadowColor = `hsla(${hueOffset + 20},100%,60%,${
      isSilent ? 0.4 : 0.8
    })`;
    ctx.stroke();
    ctx.restore();
  }
}

function drawGlitch(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  timer: number
) {
  if (timer % 30 !== 0) return;
  const n = 3 + Math.floor(Math.random() * 6);
  for (let i = 0; i < n; i++) {
    const y = Math.random() * canvas.height;
    const h = 2 + Math.random() * 4;
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.2})`;
    ctx.fillRect(0, y, canvas.width, h);
  }
}

function drawExtremeGlitch(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  timer: number
) {
  if (timer % 20 !== 0) return;

  const glitchAmount = 6 + Math.floor(Math.random() * 10);
  for (let i = 0; i < glitchAmount; i++) {
    const y = Math.random() * canvas.height;
    const h = 3 + Math.random() * 8;
    ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${
      Math.random() * 255
    },${Math.random() * 0.3})`;
    ctx.fillRect(0, y, canvas.width, h);
  }

  // Desplazamiento brusco del canvas
  if (Math.random() > 0.6) {
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    ctx.setTransform(1, 0, 0, 1, offsetX, offsetY);
  } else {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
