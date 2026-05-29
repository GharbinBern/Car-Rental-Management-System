import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const fromQuery = new URLSearchParams(location.search).get('from')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) { setError('Please enter both fields'); return }
    setLoading(true)
    try {
      await login(username, password)
      navigate(location.state?.from?.pathname || fromQuery || '/')
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 px-14 py-12 bg-[#f7f7f7] border-r border-[#e5e5e5]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1a1a1a] rounded flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M19 17H5M4 7l2.5 6h11L20 7H4Z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="7.5" cy="17" r="2" /><circle cx="16.5" cy="17" r="2" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#1a1a1a] tracking-tight">Prestige Drive</span>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#a0a0a0] mb-5">Luxury Car Rental</p>
          <h1 className="text-[48px] font-light text-[#1a1a1a] leading-[1.1] tracking-tight">
            Your rentals,<br />always on time.
          </h1>
          <p className="text-sm text-[#5c5c5c] mt-6 max-w-xs leading-relaxed">
            Complete visibility over every booking, vehicle, and client. In one precision-built rental platform.
          </p>
        </div>

        <div className="flex items-center gap-10">
          {['Vehicles tracked', 'Active bookings', 'Uptime guarantee'].map(label => (
            <div key={label}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#a0a0a0]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-8 bg-white">
        <div className="w-full max-w-[360px]">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 bg-[#1a1a1a] rounded flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M19 17H5M4 7l2.5 6h11L20 7H4Z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="7.5" cy="17" r="2" /><circle cx="16.5" cy="17" r="2" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[#1a1a1a]">Prestige Drive</span>
          </div>

          {/* <p className="text-[10px] uppercase tracking-[0.25em] text-[#a0a0a0] mb-2">Secure access</p> */}
          <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-6 tracking-tight">Sign in</h2>

          {/* Demo access banner */}
          <div className="mb-6 px-4 py-3 bg-[#f7f7f7] border border-[#e5e5e5] flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0a0a0] mb-0.5">Demo access</p>
              <p className="text-xs text-[#5c5c5c]">demo &nbsp;·&nbsp; demo123</p>
            </div>
            <button
              type="button"
              onClick={() => { setUsername('demo'); setPassword('demo123') }}
              className="text-[10px] uppercase tracking-[0.1em] text-[#1c69d4] hover:underline shrink-0">
              Use demo
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-[#5c5c5c] mb-2">Username</label>
              <input
                type="text" required autoFocus value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 text-sm bg-[#f7f7f7] border border-[#e5e5e5] rounded text-[#1a1a1a] placeholder-[#b0b0b0] focus:outline-none focus:border-[#1c69d4] focus:ring-2 focus:ring-[#1c69d4]/10 transition-all"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-[#5c5c5c] mb-2">Password</label>
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 text-sm bg-[#f7f7f7] border border-[#e5e5e5] rounded text-[#1a1a1a] placeholder-[#b0b0b0] focus:outline-none focus:border-[#1c69d4] focus:ring-2 focus:ring-[#1c69d4]/10 transition-all"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#1a1a1a] text-white text-sm font-medium rounded hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-2">
              {loading ? 'Signing in…' : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
