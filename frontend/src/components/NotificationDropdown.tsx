import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Sparkles, 
  RefreshCw, 
  CheckCheck, 
  X, 
  ArrowUpCircle, 
  CheckCircle2, 
  Info
} from 'lucide-react';
import { useAppNotifications } from '../context/NotificationContext';
import { useAppUpdate } from '../context/UpdateContext';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification
  } = useAppNotifications();

  const { currentVersion, applyUpdate, checkForUpdates, isChecking } = useAppUpdate();
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUpdateClick = async (notifId: string) => {
    markAsRead(notifId);
    setIsUpdating(true);
    await applyUpdate();
  };

  const formatTimestamp = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-600/30 rounded-lg text-blue-400">
            <Bell size={16} />
          </div>
          <h3 className="text-sm font-bold tracking-tight">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500 text-white">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer flex items-center space-x-1"
              title="Mark all as read"
            >
              <CheckCheck size={13} />
              <span>Mark read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-10 px-4 text-center text-slate-500">
            <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-700">All caught up!</p>
            <p className="text-xs text-slate-400 mt-0.5">No pending notifications or updates.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isUpdate = notif.type === 'update';

            return (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-4 transition-colors ${
                  !notif.isRead
                    ? isUpdate
                      ? 'bg-blue-50/70 border-l-4 border-l-blue-600'
                      : 'bg-slate-50/80 border-l-4 border-l-slate-400'
                    : 'bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                    {isUpdate ? (
                      <div className="p-1.5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                        <Sparkles size={15} />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-slate-100 text-slate-600 rounded-xl shrink-0 mt-0.5">
                        <Info size={15} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {formatTimestamp(notif.timestamp)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* What's new bullet points */}
                      {isUpdate && notif.details && notif.details.length > 0 && (
                        <div className="mt-2 p-2.5 bg-white/90 rounded-xl border border-blue-200/80 shadow-2xs">
                          <p className="text-[11px] font-bold text-blue-900 mb-1 flex items-center gap-1">
                            <ArrowUpCircle size={12} className="text-blue-600" />
                            New Features in this Update:
                          </p>
                          <ul className="space-y-1 text-[11px] text-slate-700">
                            {notif.details.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 leading-tight">
                                <span className="text-emerald-600 font-extrabold shrink-0">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* In-Notification Action Button */}
                      {isUpdate && notif.actionType === 'update_app' && (
                        <div className="mt-3 flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateClick(notif.id);
                            }}
                            disabled={isUpdating}
                            className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                          >
                            <RefreshCw size={12} className={isUpdating ? 'animate-spin' : ''} />
                            <span>{isUpdating ? 'Applying Update...' : 'Update App Now (1-Click)'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notif.id);
                    }}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
                    title="Remove notification"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
        <span className="font-medium">Installed: v{currentVersion}</span>
        <button
          onClick={() => checkForUpdates(true)}
          disabled={isChecking}
          className="font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={11} className={isChecking ? 'animate-spin' : ''} />
          <span>{isChecking ? 'Checking...' : 'Check Server'}</span>
        </button>
      </div>
    </div>
  );
};
