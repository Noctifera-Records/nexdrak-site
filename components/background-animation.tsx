"use client";

import { useRef, useEffect } from "react";

export default function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    // Función de animación simple
    const animate = () => {
      if (!canvasRef.current) return;

      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = performance.now() / 1000;

      // Fondo gradiente
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.9)");
      gradient.addColorStop(0.5, "rgba(10, 10, 20, 0.8)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.9)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Partículas flotantes
      const particleCount = 50;
      for (let i = 0; i < particleCount; i++) {
        const x =
          (canvas.width / particleCount) * i + Math.sin(time * 0.5 + i) * 50;
        const y = canvas.height * 0.5 + Math.sin(time * 0.3 + i * 0.5) * 100;
        const size = 2 + Math.sin(time + i) * 1;
        const opacity = 0.3 + Math.sin(time * 0.7 + i) * 0.2;

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Líneas ondulantes
      const lineCount = 8;
      for (let i = 0; i < lineCount; i++) {
        const y = (canvas.height / lineCount) * i;
        const amplitude = 30 + i * 5;
        const frequency = 0.01 + i * 0.002;
        const phase = time * 0.5 + i * 0.5;

        ctx.beginPath();
        ctx.moveTo(0, y);

        for (let x = 0; x < canvas.width; x += 5) {
          const wave = Math.sin(x * frequency + phase) * amplitude;
          ctx.lineTo(x, y + wave);
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + i * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Círculos pulsantes en el centro
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < 3; i++) {
        const radius = 50 + i * 30 + Math.sin(time * 2 + i) * 20;
        const opacity = 0.1 + Math.sin(time + i) * 0.05;

        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    // Iniciar animación
    const animationId = requestAnimationFrame(animate);

    // Limpiar
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Manejar redimensionamiento
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

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
}
