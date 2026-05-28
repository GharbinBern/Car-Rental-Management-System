import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { formatEuro } from '../utils/currency'
import { ArrowRight, AlertCircle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts'

function Label({ children }) {
  return <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0a0a0]">{children}</p>
}

function StatCard({ label, value, sub, alert }) {
  return (
    <div className="bg-white border border-[#e5e5e5] p-6">
      <Label>{label}</Label>
      <p className="text-2xl font-light text-[#1a1a1a] mt-3 tabular-nums tracking-tight truncate">{value}</p>
      {sub && <p className={`text-xs mt-2 ${alert ? 'text-red-500' : 'text-[#a0a0a0]'}`}>{sub}</p>}
    </div>
  )
}

function StatusBadge({ status }) {
  return (
    <span className="text-xs text-[#5c5c5c] border border-[#e5e5e5] rounded px-2 py-0.5 capitalize">
      {status}
    </span>
  )
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#e5e5e5] rounded px-3 py-2 text-xs shadow-lg">
      <p className="text-[#a0a0a0] mb-1">{label}</p>
      <p className="text-[#1a1a1a] font-semibold">{formatEuro(payload[0]?.value || 0)}</p>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalVehicles: 0, availableVehicles: 0, activeRentals: 0, totalCustomers: 0, revenueThisMonth: 0, overdueReturns: 0, avgDuration: 0 })
  const [recentRentals, setRecentRentals] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [vr, rr, cr, rev] = await Promise.all([
          apiService.getVehicles(),
          apiService.getRentals(),
          apiService.getCustomers(),
          apiService.getRevenueAnalytics('month').catch(() => ({ data: { data: [] } })),
        ])
        const vehicles = vr.data
        const rentals = rr.data
        const customers = cr.data
        const revenueData = rev.data?.data || []

        const available = vehicles.filter(v => v.status?.toLowerCase() === 'available').length
        const rented = vehicles.filter(v => v.status?.toLowerCase() === 'rented').length
        const active = rentals.filter(r => r.status?.toLowerCase() === 'active').length
        const revenue = revenueData.reduce((s, i) => s + (parseFloat(i.revenue) || 0), 0)
        const today = new Date(); today.setHours(0, 0, 0, 0)
        const overdue = rentals.filter(r => r.status?.toLowerCase() === 'active' && r.expected_return_date && new Date(r.expected_return_date) < today).length
        const completed = rentals.filter(r => r.status?.toLowerCase() === 'completed' && r.pickup_date && r.expected_return_date)
        const avgDuration = completed.length > 0
          ? Math.round(completed.reduce((s, r) => s + (new Date(r.expected_return_date) - new Date(r.pickup_date)) / 86400000, 0) / completed.length)
          : 0

        setStats({ totalVehicles: vehicles.length, availableVehicles: available, activeRentals: active, rentedVehicles: rented, totalCustomers: customers.length, revenueThisMonth: revenue, overdueReturns: overdue, avgDuration })
        setRecentRentals(rentals.sort((a, b) => new Date(b.pickup_date) - new Date(a.pickup_date)).slice(0, 6))
        const fmtPeriod = (p = '') => {
          if (!p) return ''
          const parts = p.split(' ')
          if (parts.length === 2) return parts[0].slice(0, 3) + " '" + parts[1].slice(2)
          try {
            const d = new Date(p.length <= 7 ? p + '-01' : p)
            if (isNaN(d)) return p
            return p.length > 7
              ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
              : d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }).replace(' ', " '")
          } catch { return p }
        }
        setChartData(revenueData.slice(-8).map(d => ({ period: fmtPeriod(d.period), revenue: parseFloat(d.revenue) || 0, rentals: d.rental_count || 0 })))
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#a0a0a0]">Loading</p>
    </div>
  )

  const utilizationPct = stats.totalVehicles > 0 ? Math.round(((stats.rentedVehicles ?? stats.activeRentals) / stats.totalVehicles) * 100) : 0
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <Label>Operations overview</Label>
          <h1 className="text-3xl font-semibold text-[#1a1a1a] mt-1.5 tracking-tight">Rental Overview</h1>
        </div>
        <p className="text-xs text-[#a0a0a0] pb-1">{today}</p>
      </div>

      {/* Hero — utilization */}
      <div className="bg-white border border-[#e5e5e5] p-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <Label>Occupancy rate</Label>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-6xl font-light text-[#1a1a1a] tabular-nums tracking-tight">{utilizationPct}</span>
              <span className="text-2xl font-light text-[#a0a0a0]">%</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#1a1a1a]">{stats.rentedVehicles ?? stats.activeRentals} vehicles on rent</p>
            <p className="text-xs text-[#a0a0a0] mt-1">{stats.availableVehicles} available · {Math.max(0, stats.totalVehicles - (stats.rentedVehicles ?? 0) - stats.availableVehicles)} other</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="w-full bg-[#f0f0f0] rounded-full h-1 overflow-hidden">
            <div className="bg-[#1a1a1a] h-full rounded-full transition-all duration-700" style={{ width: `${utilizationPct}%` }} />
          </div>
          <div className="flex justify-between">
            <span className="text-[9px] text-[#c0c0c0] uppercase tracking-widest">0%</span>
            <span className="text-[9px] text-[#c0c0c0] uppercase tracking-widest">100%</span>
          </div>
        </div>

        {stats.overdueReturns > 0 && (
          <div className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded w-fit">
            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs text-red-600">{stats.overdueReturns} overdue return{stats.overdueReturns > 1 ? 's' : ''} — action required</span>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total vehicles" value={stats.totalVehicles} sub={`${stats.availableVehicles} available now`} />
        <StatCard label="Customers" value={stats.totalCustomers} />
        <StatCard label="Monthly revenue" value={formatEuro(stats.revenueThisMonth)} />
        <StatCard label="Overdue returns" value={stats.overdueReturns}
          sub={stats.overdueReturns > 0 ? 'Needs attention' : 'All on schedule'} alert={stats.overdueReturns > 0} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-[#e5e5e5] p-6">
          <div className="mb-5">
            <Label>Revenue</Label>
            <p className="text-base font-medium text-[#1a1a1a] mt-1">Monthly breakdown</p>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: '#a0a0a0', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#a0a0a0', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `€${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip content={<ChartTip />} cursor={{ fill: '#f7f7f7' }} />
                <Bar dataKey="revenue" fill="#1a1a1a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-[#c0c0c0]">No revenue data yet</div>
          )}
        </div>

        <div className="bg-white border border-[#e5e5e5] p-6">
          <div className="mb-5">
            <Label>Rental volume</Label>
            <p className="text-base font-medium text-[#1a1a1a] mt-1">Count per period</p>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c69d4" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#1c69d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: '#a0a0a0', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#a0a0a0', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', color: '#1a1a1a', fontSize: 11 }} cursor={{ stroke: '#e5e5e5' }} />
                <Area type="monotone" dataKey="rentals" stroke="#1c69d4" strokeWidth={1.5} fill="url(#grad)" dot={false} activeDot={{ r: 3, fill: '#1c69d4', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-[#c0c0c0]">No data yet</div>
          )}
        </div>
      </div>

      {/* Secondary metrics */}
      {stats.avgDuration > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-[#e5e5e5] p-6">
            <Label>Avg rental duration</Label>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-4xl font-light text-[#1a1a1a] tabular-nums">{stats.avgDuration}</span>
              <span className="text-sm text-[#a0a0a0]">days</span>
            </div>
            <p className="text-xs text-[#c0c0c0] mt-2">Based on completed rentals</p>
          </div>
          <div className="bg-white border border-[#e5e5e5] p-6">
            <Label>Revenue per vehicle</Label>
            <div className="mt-3 overflow-hidden">
              <span className="text-2xl font-light text-[#1a1a1a] tabular-nums truncate block">
                {stats.totalVehicles > 0 ? formatEuro(stats.revenueThisMonth / stats.totalVehicles) : '—'}
              </span>
            </div>
            <p className="text-xs text-[#c0c0c0] mt-2">This month</p>
          </div>
          <div className="bg-white border border-[#e5e5e5] p-6">
            <Label>Active rentals</Label>
            <div className="mt-3">
              <span className="text-4xl font-light text-[#1a1a1a] tabular-nums">{stats.activeRentals}</span>
            </div>
            <p className="text-xs text-[#c0c0c0] mt-2">Currently ongoing</p>
          </div>
        </div>
      )}

      {/* Recent rentals */}
      <div className="bg-white border border-[#e5e5e5] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#ebebeb] flex items-center justify-between">
          <div>
            <Label>Recent activity</Label>
            <p className="text-base font-medium text-[#1a1a1a] mt-0.5">Latest rentals</p>
          </div>
          <button onClick={() => navigate('/rentals')}
            className="flex items-center gap-1.5 text-xs text-[#a0a0a0] hover:text-[#1c69d4] transition-colors">
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {recentRentals.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ebebeb]">
                {['Customer', 'Vehicle', 'Start', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-medium text-[#a0a0a0] uppercase tracking-[0.1em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebebeb]">
              {recentRentals.map(r => (
                <tr key={r.rental_id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-6 py-4 font-medium text-[#1a1a1a]">{r.customer_name}</td>
                  <td className="px-6 py-4 text-[#5c5c5c]">{r.vehicle_info}</td>
                  <td className="px-6 py-4 text-[#a0a0a0] tabular-nums text-xs">{r.pickup_date ? new Date(r.pickup_date).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center">
            <p className="text-xs text-[#c0c0c0] uppercase tracking-widest">No recent rentals</p>
          </div>
        )}
      </div>
    </div>
  )
}
