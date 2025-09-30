import axios from 'axios'
import { getCurrentUser } from './auth'

// Prefer env-configured API URL, fallback to local dev backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
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

// Global 401 handler: redirect to login when token is missing/expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Clear stored user and redirect to login
      try {
        localStorage.removeItem('user')
      } catch {}
      if (typeof window !== 'undefined' && window.location?.pathname !== '/login') {
        const from = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/login?from=${from}`
      }
    }
    return Promise.reject(error)
  }
)

// API service functions
export const apiService = {
  // Vehicles
  getVehicles: () => api.get('/vehicles/'),
  addVehicle: (data) => api.post('/vehicles/', data),
  updateVehicle: (id, data) => api.put(`/vehicles/${id}`, data),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}`),

  // Customers
  getCustomers: () => api.get('/customers/'),
  addCustomer: (data) => api.post('/customers/', data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),

  // Rentals
  getRentals: () => api.get('/rentals/'),
  addRental: (data) => api.post('/rentals/', data),
  updateRental: (id, data) => api.put(`/rentals/${id}`, data),
  returnVehicle: (id, data) => api.post(`/rentals/${id}/return`, data),
  deleteRental: (id) => api.delete(`/rentals/${id}`),

  // Analytics
  getDashboardAnalytics: () => api.get('/analytics/dashboard'),
  getRevenueAnalytics: (period = 'month') => api.get(`/analytics/revenue?period=${period}`),
  getFleetStatus: () => api.get('/analytics/fleet-status'),

  // Maintenance
  getMaintenance: () => api.get('/maintenance/'),
  scheduleMaintenance: (data) => api.post('/maintenance/', data),
  completeMaintenance: (id) => api.put(`/maintenance/${id}/complete`),

  // General API method for custom requests
  get: (url) => api.get(url),
  post: (url, data) => api.post(url, data),
  put: (url, data) => api.put(url, data),
  delete: (url) => api.delete(url),
}

export default api