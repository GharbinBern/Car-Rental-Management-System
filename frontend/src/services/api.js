import axios from 'axios'
import { getCurrentUser } from './auth'

// Prefer env-configured API URL, fallback to local dev backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for CORS with credentials
  timeout: 90000, // 90s — Render free tier can take 60-80s to wake from sleep
})

// Add auth interceptor
api.interceptors.request.use(
  (config) => {
    // Normalize URL: if someone passes '/api/...', strip the extra '/api'
    if (typeof config.url === 'string' && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api\//, '/');
    }
    const user = getCurrentUser()
    if (user?.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Global response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      try { localStorage.removeItem('user') } catch {}
      if (typeof window !== 'undefined' && window.location?.pathname !== '/login') {
        const from = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/login?from=${from}`
      }
    }
    // 403 demo restriction — fire a global event so the UI can show a nice message
    if (status === 403) {
      const detail = error?.response?.data?.detail || ''
      if (detail.toLowerCase().includes('demo')) {
        window.dispatchEvent(new CustomEvent('demo-blocked', { detail }))
      }
    }
    return Promise.reject(error)
  }
)

// ── Response cache ────────────────────────────────────────────────────────────
// GET endpoints are cached for 3 minutes so navigating between pages doesn't
// re-fetch everything from scratch. Write operations clear the relevant entries.
const _cache = new Map()
const CACHE_TTL = 3 * 60 * 1000 // 3 minutes

function _cachedGet(url) {
  const hit = _cache.get(url)
  if (hit && Date.now() - hit.ts < CACHE_TTL) return Promise.resolve(hit.data)
  return api.get(url).then(res => {
    _cache.set(url, { data: res, ts: Date.now() })
    return res
  })
}

function _bust(...keys) {
  keys.forEach(k => {
    _cache.forEach((_, url) => { if (url.includes(k)) _cache.delete(url) })
  })
}

// ── API service functions
export const apiService = {
  // Vehicles — cached reads, bust on write
  getVehicles: () => _cachedGet('/vehicles/'),
  addVehicle: (data) => api.post('/vehicles/', data).then(r => { _bust('vehicles') ; return r }),
  updateVehicle: (id, data) => api.put(`/vehicles/${id}`, data).then(r => { _bust('vehicles') ; return r }),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}`).then(r => { _bust('vehicles') ; return r }),

  // Customers — cached reads, bust on write
  getCustomers: () => _cachedGet('/customers/'),
  addCustomer: (data) => api.post('/customers/', data).then(r => { _bust('customers') ; return r }),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data).then(r => { _bust('customers') ; return r }),
  deleteCustomer: (id) => api.delete(`/customers/${id}`).then(r => { _bust('customers') ; return r }),

  // Rentals — cached reads, bust on write
  getRentals: () => _cachedGet('/rentals/'),
  addRental: (data) => api.post('/rentals/', data).then(r => { _bust('rentals', 'vehicles') ; return r }),
  updateRental: (id, data) => api.put(`/rentals/${id}`, data).then(r => { _bust('rentals') ; return r }),
  returnVehicle: (id, data) => api.post(`/rentals/${id}/return`, data).then(r => { _bust('rentals', 'vehicles') ; return r }),
  deleteRental: (id) => api.delete(`/rentals/${id}`).then(r => { _bust('rentals') ; return r }),

  // Analytics — cached
  getDashboardAnalytics: () => _cachedGet('/analytics/dashboard'),
  getRevenueAnalytics: (period = 'month') => _cachedGet(`/analytics/revenue?period=${period}`),
  getFleetStatus: () => _cachedGet('/analytics/fleet-status'),

  // Maintenance — cached reads, bust on write
  getMaintenance: () => _cachedGet('/maintenance/'),
  scheduleMaintenance: (data) => api.post('/maintenance/', data).then(r => { _bust('maintenance', 'vehicles') ; return r }),
  completeMaintenance: (id) => api.put(`/maintenance/${id}/complete`).then(r => { _bust('maintenance') ; return r }),

  get: (url) => api.get(url),
  post: (url, data) => api.post(url, data),
  put: (url, data) => api.put(url, data),
  delete: (url) => api.delete(url),
}

export default api