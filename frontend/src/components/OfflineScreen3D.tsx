import React, { useEffect, useRef, useState } from 'react';
import { WifiOff, RefreshCw, ArrowRight, ShieldAlert, Radio, Database } from 'lucide-react';

interface OfflineScreen3DProps {
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const OfflineScreen3D: React.FC<OfflineScreen3DProps> = ({ 
  onRetry, 
  onDismiss 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = 440);
    let height = (canvas.height = 280);

    // Radar pulse wave rings
    const radarWaves: Array<{ radius: number; maxRadius: number; speed: number; alpha: number }> = [
      { radius: 10, maxRadius: 100, speed: 1.2, alpha: 1 },
      { radius: 45, maxRadius: 100, speed: 1.2, alpha: 0.6 },
      { radius: 80, maxRadius: 100, speed: 1.2, alpha: 0.2 },
    ];

    let time = 0;

    const render = () => {
      time += 0.04;
      ctx.clearRect(0, 0, width, height);

      // 1. Isometric Grid Floor (Floating Cybernetic Platform)
      ctx.save();
      const originX = width / 2;
      const originY = 200;

      // Holographic floor platform
      ctx.beginPath();
      ctx.moveTo(originX, originY - 60);
      ctx.lineTo(originX + 160, originY);
      ctx.lineTo(originX, originY + 60);
      ctx.lineTo(originX - 160, originY);
      ctx.closePath();

      const floorGrad = ctx.createLinearGradient(0, originY - 60, 0, originY + 60);
      floorGrad.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
      floorGrad.addColorStop(0.5, 'rgba(30, 27, 75, 0.85)');
      floorGrad.addColorStop(1, 'rgba(67, 24, 255, 0.25)');
      ctx.fillStyle = floorGrad;
      ctx.fill();

      // Platform Grid Lines
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; // Amber/Red glow when offline
      ctx.lineWidth = 1;
      for (let i = -4; i <= 4; i++) {
        // Diagonal 1
        ctx.beginPath();
        ctx.moveTo(originX + i * 35, originY - 60 + Math.abs(i) * 12);
        ctx.lineTo(originX + i * 35 - 70, originY + Math.abs(i) * 12);
        ctx.stroke();

        // Diagonal 2
        ctx.beginPath();
        ctx.moveTo(originX - i * 35, originY - 60 + Math.abs(i) * 12);
        ctx.lineTo(originX - i * 35 + 70, originY + Math.abs(i) * 12);
        ctx.stroke();
      }

      // Outer Edge Glow
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 2. Radar Satellite Dish (Searching for Cloud Connection)
      const dishX = originX + 90;
      const dishY = originY - 45;

      ctx.save();
      // Tower Pole
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(dishX, dishY + 25);
      ctx.lineTo(dishX, dishY);
      ctx.stroke();

      // Dish head
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(dishX, dishY - 2, 12, Math.PI * 0.9, Math.PI * 1.9);
      ctx.fill();

      // Pulsing Radar Rings expanding upward
      for (let wave of radarWaves) {
        wave.radius += wave.speed;
        wave.alpha = Math.max(0, 1 - (wave.radius / wave.maxRadius));
        if (wave.radius >= wave.maxRadius) {
          wave.radius = 5;
          wave.alpha = 1;
        }

        ctx.strokeStyle = `rgba(239, 68, 68, ${wave.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(dishX, dishY - 6, wave.radius, Math.PI * 1.0, Math.PI * 2.0);
        ctx.stroke();
      }
      ctx.restore();

      // 3. 3D Parked Transport Truck with Flashing Hazard Lights
      const truckX = originX - 40;
      const truckY = originY - 18;

      ctx.save();

      // Drop Shadow
      ctx.beginPath();
      ctx.ellipse(truckX + 20, truckY + 26, 65, 16, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fill();

      // Container Box
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(truckX - 25, truckY - 45, 90, 50, 4);
      ctx.fill();
      ctx.stroke();

      // Warning Stripes on Container (Offline Caution)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      for (let s = truckX - 20; s < truckX + 60; s += 16) {
        ctx.beginPath();
        ctx.moveTo(s, truckY - 45);
        ctx.lineTo(s + 8, truckY - 45);
        ctx.lineTo(s + 2, truckY + 5);
        ctx.lineTo(s - 6, truckY + 5);
        ctx.closePath();
        ctx.fill();
      }

      // Truck Cabin
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(truckX - 70, truckY - 28, 45, 34, 4);
      ctx.fill();
      ctx.stroke();

      // Windshield
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(truckX - 66, truckY - 24);
      ctx.lineTo(truckX - 52, truckY - 24);
      ctx.lineTo(truckX - 50, truckY - 8);
      ctx.lineTo(truckX - 68, truckY - 8);
      ctx.closePath();
      ctx.fill();

      // Flashing Hazard Amber Lights
      const isBlink = Math.sin(time * 8) > 0;
      if (isBlink) {
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#fbbf24';

        // Front indicator
        ctx.beginPath();
        ctx.arc(truckX - 68, truckY + 8, 4, 0, Math.PI * 2);
        ctx.fill();

        // Rear indicator
        ctx.beginPath();
        ctx.arc(truckX + 62, truckY + 8, 4, 0, Math.PI * 2);
        ctx.fill();

        // Roof cab hazard light
        ctx.beginPath();
        ctx.arc(truckX - 48, truckY - 32, 4.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(truckX - 68, truckY + 8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(truckX + 62, truckY + 8, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wheels
      const drawStaticWheel = (wx: number, wy: number) => {
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(wx, wy, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(wx, wy, 5, 0, Math.PI * 2);
        ctx.fill();
      };

      drawStaticWheel(truckX - 52, truckY + 18);
      drawStaticWheel(truckX + 15, truckY + 18);
      drawStaticWheel(truckX + 48, truckY + 18);

      ctx.restore();

      // 4. Floating 3D "NO SIGNAL" Hologram Symbol
      ctx.save();
      const floatY = 55 + Math.sin(time * 3) * 6;

      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.beginPath();
      ctx.arc(originX, floatY, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Diagonal Disconnect Slash
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(originX - 12, floatY + 12);
      ctx.lineTo(originX + 12, floatY - 12);
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleTestRetry = () => {
    setIsChecking(true);
    if (onRetry) onRetry();
    setTimeout(() => {
      setIsChecking(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none">
      <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center p-6 text-center">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-red-600/15 blur-3xl rounded-full pointer-events-none"></div>

        {/* 3D Canvas Scene */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 shadow-inner w-full flex justify-center mb-4">
          <canvas 
            ref={canvasRef} 
            className="w-full max-w-[420px] h-[220px] sm:h-[250px] block"
          />
        </div>

        {/* Alert Header */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-bold tracking-wide uppercase">
            <WifiOff size={14} className="animate-pulse text-red-500" />
            <span>Device is Offline &bull; No Internet</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Cloud Connection Required
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            TransportPro ERP requires active internet connectivity to verify accounts, sync multi-device records, and securely access your <strong>Neon PostgreSQL Cloud Database</strong>.
          </p>
        </div>

        {/* Quick Diagnostic List */}
        <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 mb-6 text-left text-xs space-y-1.5 text-slate-300">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-slate-400">
              <Database size={13} className="text-blue-400" />
              <span>Neon PostgreSQL:</span>
            </span>
            <span className="text-amber-400 font-semibold font-mono">Standby (Awaiting Net)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-slate-400">
              <Radio size={13} className="text-indigo-400" />
              <span>Multi-Device Sync:</span>
            </span>
            <span className="text-slate-400 font-medium">Paused until reconnected</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button
            onClick={handleTestRetry}
            disabled={isChecking}
            className="flex-1 flex items-center justify-center space-x-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={15} className={isChecking ? "animate-spin" : ""} />
            <span>{isChecking ? "Testing Connection..." : "Retry Connection"}</span>
          </button>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex items-center justify-center space-x-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-700 cursor-pointer"
            >
              <span>View Cached Data</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        <p className="mt-4 text-[11px] text-slate-500">
          Tip: Turn on Mobile Data or Wi-Fi. This screen will automatically close once internet is detected.
        </p>
      </div>
    </div>
  );
};
