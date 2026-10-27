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
  const [touchActiveIndex, setTouchActiveIndex] = useState<number | null>(null);

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

  // Haptic vibration feedback for mobile devices (vibrate during scrolling/tapping)
  const triggerVibrate = (pattern: number | number[] = 20) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fallback if permission restricted or desktop
      }
    }
  };

  // Scroll / Drag along the bottom navigation bar with real-time vibration ticks
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const tabWidth = rect.width / navItems.length;
    let index = Math.floor(x / tabWidth);
    if (index < 0) index = 0;
    if (index >= navItems.length) index = navItems.length - 1;

    if (touchActiveIndex !== index) {
      setTouchActiveIndex(index);
      triggerVibrate(20); // Tactile vibration tick on scrolling to next tab
      const item = navItems[index];
      if (item.id === 'more') {
        onOpenMore();
      } else {
        onNavigateTab(item.id);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const tabWidth = rect.width / navItems.length;
    let index = Math.floor(x / tabWidth);
    if (index < 0) index = 0;
    if (index >= navItems.length) index = navItems.length - 1;
    setTouchActiveIndex(index);
    triggerVibrate(15);
  };

  const handleTouchEnd = () => {
    setTouchActiveIndex(null);
  };

  const handleClick = (itemId: string, index: number) => {
    triggerVibrate(25); // Vibrate on direct tap
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
          const isActive = index === activeIndex;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id, index)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer relative ${
                isActive 
                  ? 'text-sky-400 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Rounded floating pill background behind active icon */}
              <div className={`relative px-2.5 py-0.5 rounded-full transition-all duration-300 ${
                isActive 
                  ? 'bg-sky-500/15 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.35)] ring-1 ring-sky-400/40' 
                  : 'text-slate-400'
              }`}>
                <Icon 
                  size={19} 
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 text-sky-400 stroke-[2.4]' : 'stroke-[1.8]'
                  }`} 
                />
              </div>
              
              <span className={`text-[9.5px] mt-0.5 tracking-tight transition-colors ${
                isActive ? 'text-sky-400 font-bold' : 'text-slate-400 font-medium'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Round Scroller Track & Glowing Sliding Scroller Indicator (6 Tabs) */}
      <div className="relative w-52 sm:w-64 h-2 bg-slate-900/90 border border-slate-800 rounded-full mx-auto mt-1 mb-0.5 shadow-inner overflow-hidden flex items-center px-0.5">
        <div 
          className="h-1.5 w-[16.666%] rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(56,189,248,0.9)] transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
      </div>

      {/* Mobile Safe Area Home Bar */}
      <div className="w-20 h-0.5 bg-slate-700/60 rounded-full mx-auto mt-0.5" />
    </div>
  );
};
