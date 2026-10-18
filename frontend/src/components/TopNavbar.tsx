import React, { useState, useEffect } from 'react';
import { Menu, Bell, Building, Smartphone, Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../services/syncEngine';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  title: string;
  onShowOfflineModal?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar, title, onShowOfflineModal }) => {
  const { organization, role } = useAuth();
  const { isOnline, pendingCount, isSyncing, syncNow } = useOfflineSync();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install on Android: Open browser menu (3 dots at top right) and tap "Install app" or "Add to Home screen".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

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

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Offline / Cloud Sync Status Pill */}
        {isOnline ? (
          pendingCount > 0 ? (
            <button
              onClick={() => syncNow()}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-semibold transition-all shadow-2xs"
              title="Click to sync pending offline records to cloud"
            >
              <RefreshCw size={13} className={`text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : `Sync (${pendingCount})`}</span>
            </button>
          ) : (
            <div 
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium"
              title="All records are synced with Neon Cloud Database"
            >
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Cloud Synced</span>
            </div>
          )
        ) : (
          <button 
            onClick={onShowOfflineModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-full text-xs font-semibold animate-pulse cursor-pointer shadow-xs"
            title="Click to view 3D Offline Connection Status"
          >
            <WifiOff size={13} className="text-rose-600" />
            <span>Offline {pendingCount > 0 ? `(${pendingCount} pending)` : ''}</span>
          </button>
        )}

        {/* Install Mobile App Button */}
        <button
          onClick={handleInstallClick}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-xs font-bold transition-all shadow-2xs"
          title="Install TransportPro ERP as an Android Mobile App"
        >
          <Smartphone size={14} className="text-blue-600" />
          <span>Install App</span>
        </button>

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
