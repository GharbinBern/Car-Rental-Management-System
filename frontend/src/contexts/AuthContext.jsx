import React, { createContext, useState, useContext, useEffect } from 'react'
import { Car } from 'lucide-react'
import { getCurrentUser, login as authLogin, logout as authLogout } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const currentUser = getCurrentUser()
      if (currentUser) setUser(currentUser)
    } catch {}
    finally { setLoading(false) }
  }, [])

  const login = async (username, password) => {
    const userData = await authLogin(username, password)
    setUser(userData)
    return userData
  }

  const logout = () => { authLogout(); setUser(null) }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center animate-pulse">
            <Car className="h-5 w-5 text-white" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#a0a0a0]">Loading</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user, isDemo: user?.username === 'demo' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
