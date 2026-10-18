import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { saveCachedData, getCachedData, addToSyncQueue } from "./offlineStorage";
import { syncEngine } from "./syncEngine";

// Central Cloud Backend URL (used by Android APK, iOS, PWA, and Web)
export const PRODUCTION_API_URL = "https://transport-erp-gjf2.onrender.com/api/v1";

export const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    const raw = String(import.meta.env.VITE_API_URL).trim().replace(/\/+$/, '');
    return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
  }
  const customUrl = typeof window !== "undefined" ? localStorage.getItem("custom_api_url") : null;
  if (customUrl) {
    const raw = customUrl.trim().replace(/\/+$/, '');
    return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
  }
  return PRODUCTION_API_URL;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 45000
});

// Helper to construct normalized cache keys
export const getCacheKey = (config: AxiosRequestConfig) => {
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  return `api_cache:${url}:${params}`;
};

// Safe offline fallback values matching each endpoint schema
export const getSafeOfflineFallback = (url: string = '') => {
  if (url.includes('/auth/me')) {
    const userStr = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
    const orgStr = typeof localStorage !== 'undefined' ? localStorage.getItem('organization') : null;
    const roleStr = typeof localStorage !== 'undefined' ? localStorage.getItem('role') : null;
    const permsStr = typeof localStorage !== 'undefined' ? localStorage.getItem('permissions') : null;
    return {
      user: userStr ? JSON.parse(userStr) : null,
      organization: orgStr ? JSON.parse(orgStr) : null,
      role: roleStr ? JSON.parse(roleStr) : null,
      permissions: permsStr ? JSON.parse(permsStr) : {}
    };
  }

  if (url.includes('/dashboard/metrics')) {
    return {
      kpis: {
        total_trips: 0,
        active_trips: 0,
        delivered_trips: 0,
        total_revenue: 0,
        total_expenses: 0,
        net_profit: 0,
        active_vehicles: 0,
        active_drivers: 0,
        total_invoiced: 0,
        total_paid: 0,
        total_receivables: 0
      },
      charts: {
        revenue_trend: [],
        expense_breakdown: []
      },
      widgets: {
        recent_trips: [],
        top_routes: [],
        fleet_utilization: 0
      }
    };
  }

  if (url.includes('/trips')) {
    return { items: [], total: 0 };
  }

  // Master lists (/vehicles, /drivers, /customers, /expenses, /invoices, /staff)
  return [];
};

// Helper: Synthesize optimistic offline entity and persist to IndexedDB
const handleOfflineMutation = async (config: AxiosRequestConfig) => {
  const method = (config.method || 'POST').toUpperCase() as any;
  let payload = config.data;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch {}
  }
  payload = payload || {};

  const tempId = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const optimisticEntity: any = {
    ...payload,
    id: tempId,
    _isOffline: true,
    sync_status: 'pending',
    created_at: new Date().toISOString()
  };

  const url = config.url || '';

  // 1. Structure Trip Entity & update cache
  if (url.includes('/trips')) {
    optimisticEntity.trip_number = `OFFLINE-TRP-${Date.now().toString().slice(-4)}`;
    optimisticEntity.status = optimisticEntity.status || 'scheduled';
    optimisticEntity.route = {
      pickup_city: payload.pickup_city || 'Origin',
      delivery_city: payload.delivery_city || 'Destination'
    };
    optimisticEntity.cargo = {
      description: payload.cargo_description || 'General freight',
      weight_tonnes: payload.cargo_weight_tonnes || 0
    };
    const rev = (payload.freight_charges || 0) + (payload.additional_charges || 0) + (payload.tax_amount || 0) - (payload.discount || 0);
    const paid = payload.amount_paid || 0;
    optimisticEntity.financials = {
      freight_charges: payload.freight_charges || 0,
      total_revenue: rev,
      amount_paid: paid,
      due_amount: Math.max(0, rev - paid),
      total_expenses: (payload.diesel_expense || 0) + (payload.toll_expense || 0) + (payload.driver_allowance || 0) + (payload.loading_unloading_expense || 0) + (payload.other_direct_expense || 0)
    };

    // Prepend to cached trips list
    getCachedData('api_cache:/trips/:{}').then((cached: any) => {
      const target = cached && Array.isArray(cached.items) ? cached : { items: [], total: 0 };
      target.items.unshift(optimisticEntity);
      target.total = (target.total || 0) + 1;
      saveCachedData('api_cache:/trips/:{}', target).catch(() => {});
    }).catch(() => {});
  }

  // 2. Structure Expense Entity & update cache
  if (url.includes('/expenses')) {
    optimisticEntity.expense_number = `OFFLINE-EXP-${Date.now().toString().slice(-4)}`;
    optimisticEntity.expense_date = payload.expense_date || new Date().toISOString();
    optimisticEntity.category = payload.category || 'other';

    getCachedData('api_cache:/expenses/:{}').then((cached: any) => {
      const target = Array.isArray(cached) ? cached : [];
      target.unshift(optimisticEntity);
      saveCachedData('api_cache:/expenses/:{}', target).catch(() => {});
    }).catch(() => {});
  }

  // 3. Structure Vehicle Entity
  if (url.includes('/vehicles')) {
    getCachedData('api_cache:/vehicles/:{}').then((cached: any) => {
      const target = Array.isArray(cached) ? cached : [];
      target.unshift(optimisticEntity);
      saveCachedData('api_cache:/vehicles/:{}', target).catch(() => {});
    }).catch(() => {});
  }

  // 4. Structure Driver Entity
  if (url.includes('/drivers')) {
    getCachedData('api_cache:/drivers/:{}').then((cached: any) => {
      const target = Array.isArray(cached) ? cached : [];
      target.unshift(optimisticEntity);
      saveCachedData('api_cache:/drivers/:{}', target).catch(() => {});
    }).catch(() => {});
  }

  // 5. Structure Customer Entity
  if (url.includes('/customers')) {
    getCachedData('api_cache:/customers/:{}').then((cached: any) => {
      const target = Array.isArray(cached) ? cached : [];
      target.unshift(optimisticEntity);
      saveCachedData('api_cache:/customers/:{}', target).catch(() => {});
    }).catch(() => {});
  }

  // Add to IndexedDB sync queue
  await addToSyncQueue({
    url,
    method,
    data: payload,
    params: config.params
  });

  // Update sync count indicator in UI
  syncEngine.refreshPendingCount();

  return optimisticEntity;
};

// -------------------------------------------------------------
// REQUEST INTERCEPTOR: Auth header & proactive offline bypass
// -------------------------------------------------------------
api.interceptors.request.use(async (config) => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  if (isOffline) {
    const method = (config.method || 'GET').toLowerCase();

    // Proactive offline GET handling
    if (method === 'get') {
      const cacheKey = getCacheKey(config);
      const cached = await getCachedData(cacheKey);
      const responseData = cached !== null ? cached : getSafeOfflineFallback(config.url);

      config.adapter = async () => ({
        data: responseData,
        status: 200,
        statusText: "OK (Offline Cache)",
        headers: {},
        config,
        request: {}
      });
      return config;
    }

    // Proactive offline Mutation handling (POST, PUT, DELETE)
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
      if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
        return config; // Let it attempt or fail with auth error
      }

      const optimistic = await handleOfflineMutation(config);
      config.adapter = async () => ({
        data: optimistic,
        status: 201,
        statusText: "Created (Offline Pending Sync)",
        headers: {},
        config,
        request: {}
      });
      return config;
    }
  }

  return config;
});

// -------------------------------------------------------------
// RESPONSE INTERCEPTOR: Auto-cache GETs & Reactive Offline Fallback
// -------------------------------------------------------------
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // If request succeeded from network, update online status
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      syncEngine.setOnlineState(true);
    }
    // When online and request succeeded, cache GET requests in background
    if (response.config.method?.toLowerCase() === 'get' && response.data) {
      const cacheKey = getCacheKey(response.config);
      saveCachedData(cacheKey, response.data).catch(() => {});
    }
    return response;
  },
  async (error) => {
    const config = error.config as AxiosRequestConfig;
    if (!config) return Promise.reject(error);

    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
    if (isNetworkError) {
      syncEngine.setOnlineState(false);
    }
    const isOffline = typeof navigator !== 'undefined' && (!navigator.onLine || isNetworkError);

    // 1. Reactive GET fallback on network failure
    if (config.method?.toLowerCase() === 'get' && isOffline) {
      const cacheKey = getCacheKey(config);
      const cached = await getCachedData(cacheKey);
      const responseData = cached !== null ? cached : getSafeOfflineFallback(config.url);

      return {
        data: responseData,
        status: 200,
        statusText: "OK (Offline Fallback)",
        headers: {},
        config,
        request: {}
      };
    }

    // 2. Reactive Mutation fallback on network failure
    const method = (config.method || 'GET').toUpperCase() as any;
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) && isOffline) {
      if (!config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
        const optimistic = await handleOfflineMutation(config);
        return {
          data: optimistic,
          status: 201,
          statusText: "Created (Offline Fallback)",
          headers: {},
          config,
          request: {}
        };
      }
    }

    // 3. Handle 401 Unauthorized (ONLY if real response from backend)
    if (error.response && error.response.status === 401) {
      const url = config.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("organization");
        localStorage.removeItem("role");
        localStorage.removeItem("permissions");
      }
    }

    return Promise.reject(error);
  }
);

export default api;