import React, { useState } from 'react';
import { Sparkles, RefreshCw, X, ArrowUpCircle, Smartphone } from 'lucide-react';
import { useAppUpdate } from '../context/UpdateContext';

export const AppUpdatePrompt: React.FC = () => {
  const {
    currentVersion,
    remoteVersion,
    isUpdateAvailable,
    showModal,
    dismissUpdate,
    applyUpdate,
  } = useAppUpdate();

  const [isUpdating, setIsUpdating] = useState(false);

  if (!isUpdateAvailable || !showModal) {
    return null;
  }

  const handleUpdate = async () => {
    setIsUpdating(true);
    await applyUpdate();
  };

  const newVer = remoteVersion?.version || 'Latest';
  const features = remoteVersion?.features || [
    'Performance enhancements & bug fixes',
    'Customer name direct typing & auto-dispatch',
    'Offline capability updates'
  ];

  return (
    <div className="fixed bottom-5 right-5 z-[99999] max-w-sm w-full mx-auto p-1 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 border-2 border-blue-500/80 shadow-2xl shadow-blue-500/20 text-white p-5 backdrop-blur-xl">
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-blue-500/30 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold tracking-tight text-white">New App Update Ready</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  v{newVer}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Current installed: v{currentVersion}
              </p>
            </div>
          </div>

          <button
            onClick={dismissUpdate}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss for now"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
          <p className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <ArrowUpCircle size={13} className="text-blue-400" />
            What is new in this release:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {features.slice(0, 3).map((feat, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-tight">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span className="text-slate-200">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <RefreshCw size={14} className={isUpdating ? 'animate-spin' : ''} />
            <span>{isUpdating ? 'Applying Update...' : 'Update App Now'}</span>
          </button>

          <button
            onClick={dismissUpdate}
            disabled={isUpdating}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Later
          </button>
        </div>

        <p className="text-[10px] text-center text-slate-400 mt-2.5 flex items-center justify-center gap-1">
          <Smartphone size={10} className="text-slate-400" />
          Works on Android APK, PWA & Desktop browser
        </p>
      </div>
    </div>
  );
};
