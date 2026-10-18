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
const getCacheKey = (config: AxiosRequestConfig) => {
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  return `api_cache:${url}:${params}`;
};

// Request interceptor: Attach JWT token and handle proactive offline checks
api.interceptors.request.use(async (config) => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }

  // If the browser is definitely offline and it's a GET, try to resolve from cache early
  if (typeof navigator !== 'undefined' && !navigator.onLine && config.method?.toLowerCase() === 'get') {
    const cacheKey = getCacheKey(config);
    const cached = await getCachedData(cacheKey);
    if (cached) {
      // Return synthetic resolved promise by throwing a handled adapter response
      config.adapter = async () => ({
        data: cached,
        status: 200,
        statusText: "OK (Offline Cache)",
        headers: {},
        config,
        request: {}
      });
    }
  }

  return config;
});

// Response interceptor: Cache GETs on success & handle offline mutations/fallbacks on failure
api.interceptors.response.use(
  (response: AxiosResponse) => {
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
    const isOffline = typeof navigator !== 'undefined' && (!navigator.onLine || isNetworkError);

    // 1. FALLBACK FOR GET REQUESTS: Return cached data if available
    if (config.method?.toLowerCase() === 'get' && isOffline) {
      const cacheKey = getCacheKey(config);
      const cached = await getCachedData(cacheKey);
      if (cached) {
        console.log(`[OfflineApi] Serving cached response for ${config.url}`);
        return {
          data: cached,
          status: 200,
          statusText: "OK (Offline Cache)",
          headers: {},
          config,
          request: {}
        };
      }
      // Return safe empty list response so tables do not crash
      return {
        data: { items: [], total: 0 },
        status: 200,
        statusText: "OK (Empty Offline)",
        headers: {},
        config,
        request: {}
      };
    }

    // 2. OFFLINE MUTATION FALLBACK: POST / PUT / DELETE
    const method = config.method?.toUpperCase() as any;
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) && isOffline) {
      // Don't intercept login/register auth requests offline (needs server verification)
      if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
        return Promise.reject(error);
      }

      console.log(`[OfflineApi] Device offline. Enqueuing mutation for ${config.url}`);

      let payload = config.data;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch {}
      }

      // Generate a realistic temporary optimistic entity
      const tempId = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const optimisticEntity = {
        ...payload,
        id: tempId,
        _isOffline: true,
        sync_status: 'pending',
        created_at: new Date().toISOString()
      };

      // If it's a Trip, give it an offline trip number & structure
      if (config.url?.includes('/trips')) {
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

        // Prepend to cached trips list in IndexedDB
        getCachedData('api_cache:/trips/:{}').then((cached: any) => {
          if (cached && Array.isArray(cached.items)) {
            cached.items.unshift(optimisticEntity);
            cached.total = (cached.total || 0) + 1;
            saveCachedData('api_cache:/trips/:{}', cached).catch(() => {});
          }
        }).catch(() => {});
      }

      // If it's an Expense, structure it
      if (config.url?.includes('/expenses')) {
        optimisticEntity.expense_number = `OFFLINE-EXP-${Date.now().toString().slice(-4)}`;
        optimisticEntity.expense_date = payload.expense_date || new Date().toISOString();
        optimisticEntity.category = payload.category || 'other';

        // Prepend to cached expenses list in IndexedDB
        getCachedData('api_cache:/expenses/:{}').then((cached: any) => {
          if (Array.isArray(cached)) {
            cached.unshift(optimisticEntity);
            saveCachedData('api_cache:/expenses/:{}', cached).catch(() => {});
          }
        }).catch(() => {});
      }

      // Add to IndexedDB sync queue
      await addToSyncQueue({
        url: config.url || '',
        method,
        data: payload,
        params: config.params
      });

      // Update sync count indicator in UI
      syncEngine.refreshPendingCount();

      // Return synthetic success response so the form/modal completes normally
      return {
        data: optimisticEntity,
        status: 201,
        statusText: "Created (Offline Pending Sync)",
        headers: {},
        config,
        request: {}
      };
    }

    // 3. Handle 401 Unauthorized
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