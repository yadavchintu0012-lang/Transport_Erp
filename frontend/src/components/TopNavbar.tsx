import React from 'react';
import { Menu, Bell, Calendar, Shield, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  title: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar, title }) => {
  const { organization, role } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Organization pill */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
          <Building size={14} className="text-blue-600" />
          <span>{organization?.name || 'Platform Admin'}</span>
          <span className="text-slate-300">|</span>
          <span className="text-blue-700 font-semibold">{role?.name || 'Administrator'}</span>
        </div>

        {/* Status notification */}
        <div className="relative">
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
