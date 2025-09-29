import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Customers from './pages/Customers'
import Rentals from './pages/Rentals'
import Maintenance from './pages/Maintenance'
import Reports from './pages/Reports'
import Login from './pages/Login'

function NavLink({ to, children }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
        isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  )
}

function Header() {
  const { logout } = useAuth()

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-semibold">Car Rental Management</h1>
            </div>
            <nav className="ml-6 flex space-x-8">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/vehicles">Vehicles</NavLink>
              <NavLink to="/customers">Customers</NavLink>
              <NavLink to="/rentals">Rentals</NavLink>
              <NavLink to="/maintenance">Maintenance</NavLink>
              <NavLink to="/reports">Reports</NavLink>
            </nav>
          </div>
          <div className="flex items-center">
            <button
              onClick={logout}
              className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

function ProtectedLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Vehicles />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Customers />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentals"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Rentals />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Maintenance />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Reports />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  )
}
