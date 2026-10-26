import React, { useState, useEffect } from 'react';
import { Menu, Bell, Building, Smartphone, WifiOff, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../services/syncEngine';
import { useAppUpdate } from '../context/UpdateContext';
import { useAppNotifications } from '../context/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  title: string;
  onShowOfflineModal?: () => void;
  onShowLoadingModal?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ 
  onToggleSidebar, 
  title, 
  onShowOfflineModal,
  onShowLoadingModal 
}) => {
  const { organization, role } = useAuth();
  const { isOnline, pendingCount, isSyncing, syncNow } = useOfflineSync();
  const { currentVersion, remoteVersion, isUpdateAvailable, isChecking, setShowModal, checkForUpdates } = useAppUpdate();
  const { unreadCount, hasPendingUpdate } = useAppNotifications();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleCheckUpdate = async () => {
    if (isUpdateAvailable) {
      setShowModal(true);
      return;
    }
    const res = await checkForUpdates(true);
    if (res.updated) {
      setShowModal(true);
    } else {
      setToastMessage(`✓ App is up to date (v${currentVersion})`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

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
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Sync Pending Badge if offline entries exist */}
        {pendingCount > 0 && (
          <button
            onClick={() => syncNow()}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            title="Click to sync pending offline records to cloud"
          >
            <RefreshCw size={13} className={`text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : `Sync (${pendingCount})`}</span>
          </button>
        )}



        {/* Install Mobile App Button */}
        <button
          onClick={handleInstallClick}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-semibold transition-all shadow-2xs cursor-pointer"
          title="Install TransportPro ERP as an Android Mobile App"
        >
          <Smartphone size={14} className="text-slate-600" />
          <span>Install App</span>
        </button>

        {/* In-App Update Button */}
        {isUpdateAvailable ? (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer animate-pulse active:scale-95"
            title="New update ready! Click to view and update app"
          >
            <Sparkles size={13} className="text-yellow-300 animate-spin-slow" />
            <span>Update App</span>
            <span className="bg-white/25 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">v{remoteVersion?.version || 'new'}</span>
          </button>
        ) : (
          <button
            onClick={handleCheckUpdate}
            disabled={isChecking}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-medium transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-60"
            title="Click to check for newest version of TransportPro ERP"
          >
            <RefreshCw size={12} className={`text-slate-500 ${isChecking ? 'animate-spin text-blue-600' : ''}`} />
            <span className="font-semibold text-slate-800">v{currentVersion}</span>
            <span className="hidden sm:inline text-slate-500 text-[11px]">{isChecking ? 'Checking...' : 'Check'}</span>
          </button>
        )}

        {/* Organization pill */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
          <Building size={14} className="text-blue-600" />
          <span>{organization?.name || 'Apex Express Logistics'}</span>
          <span className="text-slate-300">|</span>
          <span className="text-blue-700 font-semibold">{role?.name || 'Company Owner'}</span>
        </div>

        {/* Notification bell & dropdown */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`p-2 rounded-full transition-all cursor-pointer relative ${
              notificationsOpen 
                ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Notifications & System Updates"
          >
            <Bell size={18} className={hasPendingUpdate ? 'animate-bounce text-blue-600' : ''} />
            
            {/* Unread count badge */}
            {unreadCount > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold rounded-full flex items-center justify-center text-white ring-2 ring-white shadow-xs ${
                hasPendingUpdate ? 'bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse' : 'bg-rose-500'
              }`}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          <NotificationDropdown
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        </div>
      </div>

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 bg-slate-900 text-emerald-400 border border-emerald-500/50 shadow-2xl px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </header>
  );
};
