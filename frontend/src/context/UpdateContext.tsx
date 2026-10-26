import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface VersionInfo {
  version: string;
  buildDate?: string;
  buildTimestamp?: number;
  title?: string;
  description?: string;
  features?: string[];
}

// Current embedded version of this build
export const CURRENT_APP_VERSION = '2.4.5';
export const CURRENT_BUILD_TIMESTAMP = 1793051760000;

interface UpdateContextType {
  currentVersion: string;
  remoteVersion: VersionInfo | null;
  isUpdateAvailable: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  checkForUpdates: (manual?: boolean) => Promise<{ updated: boolean; version?: string }>;
  applyUpdate: () => Promise<void>;
  dismissUpdate: () => void;
}

const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

export const UpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [remoteVersion, setRemoteVersion] = useState<VersionInfo | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [dismissedUntil, setDismissedUntil] = useState<number>(0);

  // Check version.json on server
  const checkForUpdates = useCallback(async (manual: boolean = false): Promise<{ updated: boolean; version?: string }> => {
    setIsChecking(true);
    try {
      // 1. Also ping Service Worker for update
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) {
            await reg.update();
            if (reg.waiting) {
              setIsUpdateAvailable(true);
              setShowModal(true);
            }
          }
        } catch (swErr) {
          console.warn('[Update] Service worker update check failed:', swErr);
        }
      }

      // 2. Fetch fresh version manifest from server (cache-busting)
      const res = await fetch('/version.json?t=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });

      if (!res.ok) {
        return { updated: false, version: CURRENT_APP_VERSION };
      }

      const data: VersionInfo = await res.json();
      setRemoteVersion(data);
      setLastChecked(new Date());

      // Compare versions
      const isNewer = 
        (data.buildTimestamp && data.buildTimestamp > CURRENT_BUILD_TIMESTAMP) ||
        (data.version && data.version !== CURRENT_APP_VERSION);

      if (isNewer) {
        setIsUpdateAvailable(true);
        // Only auto-show banner if not dismissed in last 30 minutes, or if manual check
        if (manual || Date.now() > dismissedUntil) {
          setShowModal(true);
        }
        return { updated: true, version: data.version };
      } else {
        setIsUpdateAvailable(false);
        return { updated: false, version: CURRENT_APP_VERSION };
      }
    } catch (err) {
      console.warn('[Update] Version check error:', err);
      return { updated: false, version: CURRENT_APP_VERSION };
    } finally {
      setIsChecking(false);
    }
  }, [dismissedUntil]);

  // Apply update immediately
  const applyUpdate = useCallback(async () => {
    try {
      // Purge all browser caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Tell waiting service worker to skipWaiting
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }

      // Record update applied in local storage
      if (remoteVersion?.version) {
        localStorage.setItem('transportpro_app_version', remoteVersion.version);
      }
    } catch (e) {
      console.error('[Update] Error during update cleanup:', e);
    }

    // Force hard reload bypassing cache
    window.location.href = window.location.origin + window.location.pathname + '?v=' + Date.now();
  }, [remoteVersion]);

  const dismissUpdate = useCallback(() => {
    setShowModal(false);
    // Dismiss for 20 minutes
    setDismissedUntil(Date.now() + 20 * 60 * 1000);
  }, []);

  // Listen to Service Worker waiting events
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update installed in background
                setIsUpdateAvailable(true);
                setShowModal(true);
              }
            });
          }
        });

        if (reg.waiting) {
          setIsUpdateAvailable(true);
          setShowModal(true);
        }
      });
    }
  }, []);

  // Periodic check (on mount, focus, and every 60s)
  useEffect(() => {
    checkForUpdates(false);

    const onFocus = () => checkForUpdates(false);
    window.addEventListener('focus', onFocus);

    const interval = setInterval(() => {
      checkForUpdates(false);
    }, 60000);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [checkForUpdates]);

  return (
    <UpdateContext.Provider
      value={{
        currentVersion: CURRENT_APP_VERSION,
        remoteVersion,
        isUpdateAvailable,
        isChecking,
        lastChecked,
        showModal,
        setShowModal,
        checkForUpdates,
        applyUpdate,
        dismissUpdate,
      }}
    >
      {children}
    </UpdateContext.Provider>
  );
};

export const useAppUpdate = () => {
  const context = useContext(UpdateContext);
  if (!context) {
    throw new Error('useAppUpdate must be used within an UpdateProvider');
  }
  return context;
};
