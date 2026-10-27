import React, { useRef, useState } from 'react';
import { Home, MapPin, Truck, Users, Receipt, Menu } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenMore: () => void;
  isSidebarOpen?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onNavigateTab,
  onOpenMore,
  isSidebarOpen = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const lastVibratedIndexRef = useRef<number>(-1);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'trips', label: 'Trips', icon: MapPin },
    { id: 'vehicles', label: 'Fleet', icon: Truck },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'more', label: 'More', icon: Menu },
  ];

  const getActiveIndex = () => {
    if (isSidebarOpen) return 5;
    if (currentTab === 'dashboard') return 0;
    if (currentTab === 'trips') return 1;
    if (currentTab === 'vehicles' || currentTab === 'drivers') return 2;
    if (currentTab === 'customers') return 3;
    if (currentTab === 'expenses') return 4;
    return 0;
  };

  const activeIndex = getActiveIndex();
  // Display index follows touch drag continuously in real-time, or snaps to active tab
  const displayIndex = dragProgress !== null ? dragProgress : activeIndex;

  // Haptic vibration feedback for mobile devices
  const triggerVibrate = (pattern: number | number[] = 20) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fallback
      }
    }
  };

  const calculateProgressFromTouch = (touchX: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = touchX - rect.left;
    const ratio = Math.max(0, Math.min(1, relativeX / rect.width));
    return ratio * (navItems.length - 1);
  };

  // Touch start: begin Slice-style smooth continuous icon scroll
  const handleTouchStart = (e: React.TouchEvent) => {
    const progress = calculateProgressFromTouch(e.touches[0].clientX);
    const nearestIndex = Math.round(progress);
    setDragProgress(progress);
    lastVibratedIndexRef.current = nearestIndex;
    triggerVibrate(15);
  };

  // Touch move: fluidly glide round scroller following finger with vibration ticks
  const handleTouchMove = (e: React.TouchEvent) => {
    const progress = calculateProgressFromTouch(e.touches[0].clientX);
    setDragProgress(progress);
    const nearestIndex = Math.round(progress);

    if (lastVibratedIndexRef.current !== nearestIndex) {
      lastVibratedIndexRef.current = nearestIndex;
      triggerVibrate(22); // Real-time vibration tick on each icon passed
    }
  };

  // Touch end: magnetically snap to selected tab with haptic confirmation
  const handleTouchEnd = () => {
    if (dragProgress !== null) {
      const finalIndex = Math.max(0, Math.min(navItems.length - 1, Math.round(dragProgress)));
      triggerVibrate(25);
      const item = navItems[finalIndex];
      if (item.id === 'more') {
        onOpenMore();
      } else {
        onNavigateTab(item.id);
      }
    }
    setDragProgress(null);
  };

  const handleClick = (itemId: string, index: number) => {
    triggerVibrate(25); // Direct tap haptic vibration
    if (itemId === 'more') {
      onOpenMore();
    } else {
      onNavigateTab(itemId);
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 pt-1.5 pb-1 shadow-2xl select-none">
      <div 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="max-w-md mx-auto flex items-center justify-around relative"
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isSelected = Math.round(displayIndex) === index;
          const dist = Math.abs(displayIndex - index);
          const scale = isSelected ? (dragProgress !== null ? Math.max(1, 1.15 - dist * 0.15) : 1.1) : 1;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id, index)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition-all cursor-pointer relative z-10 ${
                isSelected 
                  ? 'text-sky-400 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div 
                className="relative flex items-center justify-center h-8 transition-transform"
                style={{ transform: `scale(${scale})` }}
              >
                <Icon 
                  size={19} 
                  className={`transition-colors ${
                    isSelected ? 'text-sky-400 stroke-[2.4]' : 'text-slate-400 stroke-[1.8]'
                  }`} 
                />
              </div>
              
              <span className={`text-[9px] sm:text-[9.5px] mt-0.5 tracking-tight transition-colors ${
                isSelected ? 'text-sky-400 font-bold' : 'text-slate-400 font-medium'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slice-style Round Scroller Track & Fluid Rolling Ball/Capsule */}
      <div className="relative w-56 sm:w-68 h-2.5 bg-slate-900/90 border border-slate-800 rounded-full mx-auto mt-1 mb-0.5 shadow-inner overflow-hidden flex items-center px-1">
        <div 
          className="h-2 w-7 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(56,189,248,0.95)]"
          style={{
            marginLeft: `${(displayIndex / (navItems.length - 1)) * 84}%`,
            transition: dragProgress !== null ? 'none' : 'margin-left 260ms cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        />
      </div>

      {/* Mobile Safe Area Home Bar */}
      <div className="w-20 h-0.5 bg-slate-700/60 rounded-full mx-auto mt-0.5" />
    </div>
  );
};
