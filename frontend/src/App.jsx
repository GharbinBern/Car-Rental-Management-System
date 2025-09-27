import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthProvider, RequireAuth, useAuth } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Customers from './pages/Customers'
import Rentals from './pages/Rentals'
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
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/vehicles"
            element={
              <RequireAuth>
                <ProtectedLayout>
                  <Vehicles />
                </ProtectedLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/customers"
            element={
              <RequireAuth>
                <ProtectedLayout>
                  <Customers />
                </ProtectedLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/rentals"
            element={
              <RequireAuth>
                <ProtectedLayout>
                  <Rentals />
                </ProtectedLayout>
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  )
}
