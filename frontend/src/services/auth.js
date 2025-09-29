import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const login = async (username, password) => {
  try {
    // Create URLSearchParams for faster form encoding
    const params = new URLSearchParams()
    params.append('username', username.trim())
    params.append('password', password)
    
    const response = await axios.post(`${API_URL}/auth/login`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000 // 10 second timeout
    })
    
    if (response.data.access_token) {
      // Store user data with additional info
      const userData = {
        ...response.data,
        username: username.trim(),
        login_time: new Date().toISOString()
      }
      localStorage.setItem('user', JSON.stringify(userData))
      return userData
    }
    
    throw new Error('No access token received')
  } catch (error) {
    console.error('Login error:', error)
    
    if (error.code === 'ECONNABORTED') {
      throw 'Connection timeout. Please check your network.'
    }
    
    if (error.response?.status === 401) {
      throw 'Invalid username or password'
    }
    
    if (error.response?.status >= 500) {
      throw 'Server error. Please try again later.'
    }
    
    throw error.response?.data?.detail || error.message || 'Login failed'
  }
}

export const logout = () => {
  localStorage.removeItem('user')
}

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) return JSON.parse(userStr)
  return null
}

// Add authorization header to requests
axios.interceptors.request.use(
  (config) => {
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