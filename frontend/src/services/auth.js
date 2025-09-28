import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

export const login = async (username, password) => {
  try {
    // Create form data for OAuth2PasswordRequestForm
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    
    const response = await axios.post(`${API_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    
    if (response.data.access_token) {
      // Store user data with additional info
      const userData = {
        ...response.data,
        username: username
      }
      localStorage.setItem('user', JSON.stringify(userData))
    }
    
    return response.data
  } catch (error) {
    throw error.response?.data?.detail || 'Login failed'
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