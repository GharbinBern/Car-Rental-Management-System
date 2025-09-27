import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getCurrentUser, login as authLogin, logout as authLogout } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser())
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setUser(user)
    }
  }, [])

  const login = async (username, password) => {
    try {
      const userData = await authLogin(username, password)
      setUser(userData)
      
      // Navigate to the page they tried to visit or to dashboard
      const origin = location.state?.from?.pathname || '/'
      navigate(origin)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authLogout()
    setUser(null)
    navigate('/login')
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
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