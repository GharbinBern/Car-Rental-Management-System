import React, { createContext, useState, useContext, useEffect } from 'react'
import { getCurrentUser, login as authLogin, logout as authLogout } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const currentUser = getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    try {
      const userData = await authLogin(username, password)
      setUser(userData)
      return userData
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authLogout()
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
    }
  }, [isAuthenticated, location, navigate])

  return isAuthenticated ? children : null
}