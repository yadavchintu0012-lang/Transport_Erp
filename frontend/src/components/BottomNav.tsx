import React from 'react';
import { Home, MapPin, Truck, Users, Menu } from 'lucide-react';

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
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'trips', label: 'Trips', icon: MapPin },
    { id: 'vehicles', label: 'Fleet', icon: Truck },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'more', label: 'More', icon: Menu },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            item.id === 'more' 
              ? isSidebarOpen 
              : item.id === 'vehicles'
              ? currentTab === 'vehicles' || currentTab === 'drivers'
              : item.id === 'customers'
              ? currentTab === 'customers'
              : currentTab === item.id && !isSidebarOpen;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'more') {
                  onOpenMore();
                } else {
                  onNavigateTab(item.id);
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'text-blue-500 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon 
                  size={22} 
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 text-blue-500 stroke-[2.4]' : 'text-slate-400 stroke-[1.8]'
                  }`} 
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'text-blue-500 font-bold' : 'text-slate-400 font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Safe Area Home Bar */}
      <div className="w-32 h-1 bg-white/70 rounded-full mx-auto mt-1 mb-0.5" />
    </div>
  );
};
