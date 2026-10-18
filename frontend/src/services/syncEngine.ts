// TransportPro ERP - Automatic Offline-to-Cloud Background Sync Engine
import { useState, useEffect } from 'react';
import { 
  getSyncQueue, 
  removeSyncQueueItem, 
  updateSyncQueueItem, 
  SyncQueueItem 
} from './offlineStorage';
import axios from 'axios';
import { PRODUCTION_API_URL } from './api';

export interface SyncEngineState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: string | null;
}

type SyncListener = (state: SyncEngineState) => void;

class SyncEngine {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private pendingCount: number = 0;
  private isSyncing: boolean = false;
  private lastSyncTime: string | null = null;
  private listeners: Set<SyncListener> = new Set();
  private syncTimer: any = null;
  private heartbeatTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));

      // Initial queue check
      this.refreshPendingCount();

      // Active Heartbeat: Checks real internet connectivity every 4 seconds
      this.heartbeatTimer = setInterval(() => {
        this.checkConnectivity();
      }, 4000);

      // Periodic check every 45s when online
      this.syncTimer = setInterval(() => {
        if (this.isOnline && !this.isSyncing) {
          this.syncNow();
        }
      }, 45000);
    }
  }

  public async checkConnectivity(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (this.isOnline) {
        this.handleNetworkChange(false);
      }
      return false;
    }

    try {
      // Lightweight HEAD request with cache busting to test live connectivity
      const res = await fetch('/favicon.svg?t=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store'
      });
      if (res.ok || res.status === 200 || res.status === 304) {
        if (!this.isOnline) {
          this.handleNetworkChange(true);
        }
        return true;
      }
    } catch {
      if (this.isOnline) {
        this.handleNetworkChange(false);
      }
      return false;
    }
    return this.isOnline;
  }

  public setOnlineState(online: boolean) {
    if (this.isOnline !== online) {
      this.handleNetworkChange(online);
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState(): SyncEngineState {
    return {
      isOnline: this.isOnline,
      pendingCount: this.pendingCount,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  private handleNetworkChange(online: boolean) {
    this.isOnline = online;
    console.log(`[SyncEngine] Network status changed: ${online ? 'ONLINE' : 'OFFLINE'}`);
    this.refreshPendingCount();
    this.notify();

    if (online) {
      // Reconnected! Process queue automatically with a short delay to allow connection stabilization
      setTimeout(() => {
        this.syncNow();
      }, 1500);
    }
  }

  public async refreshPendingCount(): Promise<number> {
    const queue = await getSyncQueue();
    this.pendingCount = queue.filter(item => item.status !== 'syncing').length;
    this.notify();
    return this.pendingCount;
  }

  public async syncNow(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) {
      console.log('[SyncEngine] Sync already in progress, skipping.');
      return { synced: 0, failed: 0 };
    }

    if (!this.isOnline) {
      console.log('[SyncEngine] Device is offline. Cannot sync now.');
      return { synced: 0, failed: 0 };
    }

    const queue = await getSyncQueue();
    if (queue.length === 0) {
      this.pendingCount = 0;
      this.notify();
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.notify();

    let syncedCount = 0;
    let failedCount = 0;

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    const baseURL = (typeof localStorage !== 'undefined' && localStorage.getItem('custom_api_url')) 
      ? localStorage.getItem('custom_api_url')! 
      : PRODUCTION_API_URL;

    console.log(`[SyncEngine] Processing ${queue.length} queued offline mutations...`);

    for (const item of queue) {
      try {
        await updateSyncQueueItem(item.id, { status: 'syncing' });

        // Clean payload: remove client-side temporary flags
        const payload = { ...item.data };
        delete payload._isOffline;
        delete payload.temporary_id;

        const targetUrl = item.url.startsWith('http') 
          ? item.url 
          : `${baseURL.replace(/\/+$/, '')}/${item.url.replace(/^\/+/, '')}`;

        const res = await axios({
          method: item.method,
          url: targetUrl,
          data: payload,
          params: item.params,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          timeout: 25000
        });

        if (res.status >= 200 && res.status < 300) {
          console.log(`[SyncEngine] Successfully synced mutation ${item.id} (${item.url})`);
          await removeSyncQueueItem(item.id);
          syncedCount++;
        } else {
          console.warn(`[SyncEngine] Unexpected status ${res.status} for ${item.id}`);
          await updateSyncQueueItem(item.id, { status: 'pending', errorMsg: `Status: ${res.status}` });
          failedCount++;
        }
      } catch (err: any) {
        console.error(`[SyncEngine] Error syncing item ${item.id}:`, err?.message || err);
        // If network error, stop processing rest of queue
        if (!navigator.onLine || err?.code === 'ERR_NETWORK') {
          this.isOnline = false;
          await updateSyncQueueItem(item.id, { status: 'pending' });
          break;
        }

        // If validation error (400, 422), mark failed so it doesn't block other queue items
        if (err?.response?.status && err.response.status >= 400 && err.response.status < 500) {
          await updateSyncQueueItem(item.id, { 
            status: 'failed', 
            errorMsg: err.response.data?.detail || 'Validation error' 
          });
          failedCount++;
        } else {
          await updateSyncQueueItem(item.id, { status: 'pending' });
          failedCount++;
        }
      }
    }

    this.isSyncing = false;
    this.lastSyncTime = new Date().toLocaleTimeString();
    await this.refreshPendingCount();
    this.notify();

    // Broadcast global event so any active page (e.g. Trips, Expenses) refetches latest cloud data
    if (typeof window !== 'undefined' && syncedCount > 0) {
      window.dispatchEvent(new CustomEvent('transportpro:sync_completed', { 
        detail: { syncedCount, failedCount } 
      }));
    }

    return { synced: syncedCount, failed: failedCount };
  }
}

// Global Singleton
export const syncEngine = new SyncEngine();

// React Hook
export const useOfflineSync = () => {
  const [state, setState] = useState<SyncEngineState>(syncEngine.getState());

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const syncNow = () => syncEngine.syncNow();

  return {
    ...state,
    syncNow
  };
};
