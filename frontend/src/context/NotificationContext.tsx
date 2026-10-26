import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAppUpdate } from './UpdateContext';

export interface AppNotification {
  id: string;
  type: 'update' | 'system' | 'trip' | 'invoice';
  title: string;
  message: string;
  details?: string[];
  version?: string;
  timestamp: number;
  isRead: boolean;
  actionLabel?: string;
  actionType?: 'update_app' | 'dismiss';
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  hasPendingUpdate: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  requestPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'transportpro_notifications_v1';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { remoteVersion, isUpdateAvailable, currentVersion } = useAppUpdate();

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse notifications from localStorage:', e);
    }
    // Default initial welcome / system notification
    return [
      {
        id: 'system-welcome',
        type: 'system',
        title: 'TransportPro ERP Cloud Connected',
        message: 'System is online and operational. Offline synchronization is active.',
        timestamp: Date.now() - 3600000,
        isRead: true,
      }
    ];
  });

  // Persist notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications to localStorage:', e);
    }
  }, [notifications]);

  // Request browser desktop / mobile notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.warn('Notification permission request error:', e);
      }
    }
  }, []);

  // When an app update is detected or remote version is available, ensure an Update Notification exists
  useEffect(() => {
    if (isUpdateAvailable && remoteVersion) {
      const updateId = 'app-update-' + remoteVersion.version;

      setNotifications((prev) => {
        const existingIndex = prev.findIndex((n) => n.id === updateId);
        const updateNotif: AppNotification = {
          id: updateId,
          type: 'update',
          title: '✨ App Update Available: v' + remoteVersion.version,
          message: remoteVersion.description || 'A new version of TransportPro ERP is ready to install.',
          details: remoteVersion.features || [
            'Write customer name directly or select from list',
            '3D Loading Highway Truck animation',
            '3D Offline Parked Truck with radar dish',
            'In-app update notifications & 1-click update'
          ],
          version: remoteVersion.version,
          timestamp: remoteVersion.buildTimestamp || Date.now(),
          isRead: false,
          actionLabel: 'Update App Now',
          actionType: 'update_app'
        };

        if (existingIndex >= 0) {
          // Update existing item but keep read state if user already saw it
          const updated = [...prev];
          updated[existingIndex] = {
            ...updateNotif,
            isRead: prev[existingIndex].isRead
          };
          return updated;
        } else {
          // Prepend at top
          return [updateNotif, ...prev];
        }
      });

      // Also trigger browser push/desktop notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('TransportPro ERP Update Available', {
            body: 'New version v' + remoteVersion.version + ' is ready with new features! Tap to update.',
            icon: '/icon-192.png',
            tag: 'transportpro-app-update'
          });
        } catch (e) {
          console.warn('Native notification failed:', e);
        }
      }
    }
  }, [isUpdateAvailable, remoteVersion]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasPendingUpdate = notifications.some((n) => n.type === 'update' && isUpdateAvailable);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        hasPendingUpdate,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        requestPermission
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useAppNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useAppNotifications must be used within a NotificationProvider');
  }
  return context;
};
