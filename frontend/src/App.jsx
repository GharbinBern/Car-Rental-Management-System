import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LayoutDashboard, Car, Users, FileText, Wrench, BarChart3, LogOut } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Customers from './pages/Customers'
import Rentals from './pages/Rentals'
import Maintenance from './pages/Maintenance'
import Reports from './pages/Reports'
import Login from './pages/Login'

const NAV = [
  { to: '/',             label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/vehicles',    label: 'Vehicles',     icon: Car },
  { to: '/customers',   label: 'Customers',    icon: Users },
  { to: '/rentals',     label: 'Rentals',      icon: FileText },
  { to: '/maintenance', label: 'Maintenance',  icon: Wrench },
  { to: '/reports',     label: 'Reports',      icon: BarChart3 },
]

function Sidebar() {
  const location = useLocation()
  const { logout } = useAuth()

  return (
    <aside className="w-[220px] shrink-0 bg-white border-r border-[#e5e5e5] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#ebebeb]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#1a1a1a] rounded flex items-center justify-center shrink-0">
            <Car className="h-3.5 w-3.5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a] leading-none tracking-tight">Prestige Drive</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#a0a0a0] mt-0.5">Car Rental</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                active
                  ? 'bg-[#f0f5ff] text-[#1c69d4] font-medium'
                  : 'text-[#5c5c5c] hover:text-[#1a1a1a] hover:bg-[#f7f7f7]'
              }`}>
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2 : 1.5} />
              <span>{label}</span>
              {active && <span className="ml-auto w-1 h-1 rounded-full bg-[#1c69d4]" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-[#ebebeb]">
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded text-sm text-[#a0a0a0] hover:text-[#1a1a1a] hover:bg-[#f7f7f7] transition-colors">
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

function DemoToast() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = () => {
      setVisible(true)
      setTimeout(() => setVisible(false), 4000)
    }
    window.addEventListener('demo-blocked', handler)
    return () => window.removeEventListener('demo-blocked', handler)
  }, [])

  if (!visible) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1a1a1a] text-white px-5 py-3 text-sm shadow-xl animate-fade-in">
      <span className="text-[#a0a0a0] text-xs uppercase tracking-[0.15em]">Demo</span>
      <span className="w-px h-4 bg-[#3a3a3a]" />
      This is read-only.
    </div>
  )
}

function DemoBanner() {
  const { isDemo } = useAuth()
  if (!isDemo) return null
  return (
    <div className="w-full bg-[#1a1a1a] text-white text-center py-2 text-xs tracking-[0.1em]">
      <span className="text-[#a0a0a0] uppercase mr-2">Demo mode</span>
      Read-only · Changes are not permitted
    </div>
  )
}

function ProtectedLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#f2f2f2]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <DemoBanner />
        <main className="flex-1">
          <div className="max-w-[1200px] mx-auto px-10 py-10">
            {children}
          </div>
        </main>
      </div>
      <DemoToast />
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          {[
            { path: '/',             element: <Dashboard /> },
            { path: '/vehicles',    element: <Vehicles /> },
            { path: '/customers',   element: <Customers /> },
            { path: '/rentals',     element: <Rentals /> },
            { path: '/maintenance', element: <Maintenance /> },
            { path: '/reports',     element: <Reports /> },
          ].map(({ path, element }) => (
            <Route key={path} path={path}
              element={<ProtectedRoute><ProtectedLayout>{element}</ProtectedLayout></ProtectedRoute>} />
          ))}
        </Routes>
      </AuthProvider>
    </Router>
  )
}
