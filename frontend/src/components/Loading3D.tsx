import React, { useEffect, useRef } from 'react';
import { Truck, Sparkles } from 'lucide-react';

interface Loading3DProps {
  message?: string;
}

export const Loading3D: React.FC<Loading3DProps> = ({ 
  message = "Loading TransportPro ERP..." 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = 400);
    let height = (canvas.height = 260);

    // Particle system for 3D speed trail & ambient stars
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      size: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 + 0.5,
        vx: -(Math.random() * 3 + 2),
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    let time = 0;

    const render = () => {
      time += 0.05;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw 3D Perspective Holographic Road Grid
      const horizonY = 175;
      ctx.save();

      // Road background gradient
      const roadGrad = ctx.createLinearGradient(0, horizonY - 40, 0, height);
      roadGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
      roadGrad.addColorStop(0.3, 'rgba(30, 58, 138, 0.25)');
      roadGrad.addColorStop(1, 'rgba(37, 99, 235, 0.4)');
      ctx.fillStyle = roadGrad;
      ctx.beginPath();
      ctx.moveTo(130, horizonY);
      ctx.lineTo(270, horizonY);
      ctx.lineTo(390, height);
      ctx.lineTo(10, height);
      ctx.closePath();
      ctx.fill();

      // Road Edge Glowing Neon Lines
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;

      // Left edge
      ctx.beginPath();
      ctx.moveTo(130, horizonY);
      ctx.lineTo(10, height);
      ctx.stroke();

      // Right edge
      ctx.beginPath();
      ctx.moveTo(270, horizonY);
      ctx.lineTo(390, height);
      ctx.stroke();

      // Moving Dashed Center Line (Perspective Animation)
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;

      const offset = (time * 80) % 50;
      for (let y = horizonY + 5; y < height; y += 22) {
        const lineY = y + (offset * ((y - horizonY) / 100));
        if (lineY > height) continue;
        const progress = (lineY - horizonY) / (height - horizonY);
        const dashLen = 8 + progress * 24;
        const widthAtY = 1 + progress * 3;

        ctx.lineWidth = widthAtY;
        ctx.beginPath();
        ctx.moveTo(200, lineY);
        ctx.lineTo(200, Math.min(height, lineY + dashLen));
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw Speed Particles (Wind effect)
      ctx.save();
      for (let p of particles) {
        p.x += p.vx * p.z;
        if (p.x < 0) {
          p.x = width + Math.random() * 20;
          p.y = Math.random() * (height - 60) + 20;
        }

        ctx.fillStyle = `rgba(147, 197, 253, ${p.alpha})`;
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.z * 0.7), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 3. Draw Isometric 3D Delivery Truck
      const truckX = 200;
      const truckY = 145 + Math.sin(time * 6) * 2.5; // Suspension engine bounce

      ctx.save();

      // Dynamic Drop Shadow
      ctx.beginPath();
      ctx.ellipse(truckX, 178, 55, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();

      // Headlight Beams projecting forward
      const beamGrad = ctx.createLinearGradient(truckX - 45, truckY, 0, truckY + 40);
      beamGrad.addColorStop(0, 'rgba(250, 204, 21, 0.7)');
      beamGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(truckX - 52, truckY + 12);
      ctx.lineTo(truckX - 160, truckY - 20);
      ctx.lineTo(truckX - 160, truckY + 50);
      ctx.closePath();
      ctx.fill();

      // 3D Truck Trailer Body (Cargo Container)
      ctx.fillStyle = '#2563eb'; // Main blue body
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 1.5;

      // Container Side Face
      ctx.beginPath();
      ctx.roundRect(truckX - 15, truckY - 38, 75, 42, 4);
      ctx.fill();
      ctx.stroke();

      // Container Grooves (corrugated freight panels)
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 1.2;
      for (let gx = truckX - 5; gx < truckX + 55; gx += 10) {
        ctx.beginPath();
        ctx.moveTo(gx, truckY - 36);
        ctx.lineTo(gx, truckY + 2);
        ctx.stroke();
      }

      // Container Logo Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.fillText('TRANSPORT', truckX + 2, truckY - 18);
      ctx.fillStyle = '#93c5fd';
      ctx.font = '700 7px Inter, sans-serif';
      ctx.fillText('PRO ERP', truckX + 16, truckY - 8);

      // Truck Cabin (Front)
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.roundRect(truckX - 55, truckY - 22, 38, 28, 4);
      ctx.fill();

      // Windshield
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(truckX - 52, truckY - 18);
      ctx.lineTo(truckX - 40, truckY - 18);
      ctx.lineTo(truckX - 38, truckY - 4);
      ctx.lineTo(truckX - 54, truckY - 4);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Headlight lamp
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(truckX - 54, truckY + 12, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Chrome Exhaust Pipe with smoke puffs
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(truckX - 14, truckY - 45, 3.5, 20);

      // Spinning 3D Wheels
      const drawWheel = (wx: number, wy: number) => {
        // Outer Tire
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(wx, wy, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Chrome Rim
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(wx, wy, 5, 0, Math.PI * 2);
        ctx.fill();

        // Spinning Spokes
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        const angle = time * 18;
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(angle) * 5, wy + Math.sin(angle) * 5);
        ctx.lineTo(wx - Math.cos(angle) * 5, wy - Math.sin(angle) * 5);
        ctx.moveTo(wx + Math.cos(angle + Math.PI / 2) * 5, wy + Math.sin(angle + Math.PI / 2) * 5);
        ctx.lineTo(wx - Math.cos(angle + Math.PI / 2) * 5, wy - Math.sin(angle + Math.PI / 2) * 5);
        ctx.stroke();
      };

      drawWheel(truckX - 40, truckY + 14); // Front Wheel
      drawWheel(truckX + 15, truckY + 14); // Rear Wheel 1
      drawWheel(truckX + 42, truckY + 14); // Rear Wheel 2

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white select-none">
      <div className="relative flex flex-col items-center">
        {/* Ambient 3D Neon Backlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/15 blur-3xl rounded-full pointer-events-none"></div>

        {/* 3D Canvas Scene */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/60 shadow-2xl backdrop-blur-md">
          <canvas 
            ref={canvasRef} 
            className="w-[340px] sm:w-[400px] h-[220px] sm:h-[260px] block"
          />
        </div>

        {/* Loading Progress & Status Text */}
        <div className="mt-6 flex flex-col items-center space-y-3">
          <div className="flex items-center space-x-2 text-sm font-semibold tracking-wide text-blue-400">
            <Truck size={16} className="text-blue-400 animate-pulse" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
              {message}
            </span>
          </div>

          {/* Animated 3D Shimmer Bar */}
          <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
            <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500 rounded-full w-full animate-[shimmer_1.5s_infinite] origin-left"></div>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            Neon Serverless PostgreSQL &bull; Cloud Enterprise ERP
          </p>
        </div>
      </div>
    </div>
  );
};
