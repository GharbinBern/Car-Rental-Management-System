import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { formatEuro } from '../utils/currency'
import { Download, TrendingUp, Users, Car, FileText } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

function Label({ children }) {
  return <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0a0a0]">{children}</p>
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#e5e5e5] rounded px-3 py-2 text-xs shadow-lg">
      <p className="text-[#a0a0a0] mb-1">{label}</p>
      <p className="text-[#1a1a1a] font-semibold">
        {payload[0]?.name === 'revenue' ? formatEuro(payload[0].value) : payload[0]?.value}
      </p>
    </div>
  )
}

const DONUT_COLORS = ['#1a1a1a', '#5c5c5c', '#a0a0a0', '#d0d0d0']

export default function Reports() {
  const [analytics, setAnalytics] = useState(null)
  const [revenueData, setRevenueData] = useState(null)
  const [fleetData, setFleetData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  useEffect(() => { fetchAllData() }, [selectedPeriod])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [analyticsRes, revenueRes, fleetRes] = await Promise.all([
        apiService.getDashboardAnalytics(),
        apiService.getRevenueAnalytics(selectedPeriod),
        apiService.getFleetStatus(),
      ])
      setAnalytics(analyticsRes.data)
      setRevenueData(revenueRes.data)
      setFleetData(fleetRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const exportReport = (type) => {
    let csvContent = ''
    const filename = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`
    if (type === 'revenue' && revenueData?.data) {
      csvContent = ['Period,Revenue (€),Rental Count', ...revenueData.data.map(i => `${i.period || 'Unknown'},${i.revenue || 0},${i.rental_count || 0}`)].join('\n')
    } else if (type === 'fleet' && fleetData) {
      csvContent = ['Branch,Total Vehicles,Available,Rented,In Maintenance', ...fleetData.fleet_by_branch.map(b => `${b.branch_code || 'Unknown'},${b.total_vehicles || 0},${b.available || 0},${b.rented || 0},${b.in_maintenance || 0}`)].join('\n')
    } else if (type === 'customer' && analytics) {
      csvContent = ['Metric,Value', `Active Customers (Month),${analytics.customer_insights?.active_customers_month || 0}`].join('\n')
    } else {
      csvContent = ['Report,Prestige Drive Rental Operations', `Generated,${new Date().toLocaleDateString()}`].join('\n')
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = filename
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#a0a0a0]">Loading</p>
    </div>
  )

  const totalRevenue = revenueData?.data?.reduce((s, i) => s + (parseFloat(i.revenue) || 0), 0) ?? 0
  const totalRentals = revenueData?.data?.reduce((s, i) => s + (i.rental_count || 0), 0) ?? 0
  const utilizationPct = fleetData?.fleet_overview?.total_vehicles > 0
    ? Math.round((fleetData.fleet_overview.rented / fleetData.fleet_overview.total_vehicles) * 100) : 0
  const activeCustomers = analytics?.customer_insights?.active_customers_month || 0

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
  const chartData = (revenueData?.data || []).slice(-8).map(d => ({
    period: fmtPeriod(d.period),
    revenue: parseFloat(d.revenue) || 0,
    rentals: d.rental_count || 0,
  }))

  const fleetOverview = fleetData?.fleet_overview
  const donutData = fleetOverview ? [
    { name: 'Available',   value: fleetOverview.available || 0 },
    { name: 'Rented',      value: fleetOverview.rented || 0 },
    { name: 'Maintenance', value: fleetOverview.in_maintenance || 0 },
    { name: 'Other',       value: Math.max(0, (fleetOverview.total_vehicles || 0) - (fleetOverview.available || 0) - (fleetOverview.rented || 0) - (fleetOverview.in_maintenance || 0)) },
  ].filter(d => d.value > 0) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <Label>Business intelligence</Label>
          <h1 className="text-3xl font-semibold text-[#1a1a1a] mt-1.5 tracking-tight">Reports</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 bg-[#f7f7f7] border border-[#e5e5e5] rounded p-1">
            {['day', 'week', 'month'].map(p => (
              <button key={p} onClick={() => setSelectedPeriod(p)}
                className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                  selectedPeriod === p ? 'bg-[#1a1a1a] text-white' : 'text-[#5c5c5c] hover:text-[#1a1a1a]'
                }`}>{p}</button>
            ))}
          </div>
          <button onClick={() => exportReport('comprehensive')}
            className="flex items-center gap-2 bg-white border border-[#e5e5e5] text-[#5c5c5c] px-4 py-2.5 rounded text-xs font-medium hover:text-[#1a1a1a] hover:border-[#c0c0c0] transition-colors">
            <Download className="h-3.5 w-3.5" /> Export all
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total revenue', value: formatEuro(totalRevenue), icon: TrendingUp },
          { label: 'Occupancy rate', value: `${utilizationPct}%`, icon: Car },
          { label: 'Active customers', value: activeCustomers, icon: Users },
          { label: 'Total rentals', value: totalRentals, icon: FileText },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-[#e5e5e5] p-6">
            <div className="flex items-center justify-between mb-3">
              <Label>{label}</Label>
              <div className="w-7 h-7 rounded bg-[#f7f7f7] border border-[#e5e5e5] flex items-center justify-center">
                <Icon className="h-3.5 w-3.5 text-[#b0b0b0]" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-2xl font-light text-[#1a1a1a] tabular-nums tracking-tight truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-[#e5e5e5] p-6">
          <div className="mb-5">
            <Label>Revenue trend</Label>
            <p className="text-base font-medium text-[#1a1a1a] mt-1">Period breakdown</p>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: '#a0a0a0', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#a0a0a0', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `€${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip content={<ChartTip />} cursor={{ fill: '#f7f7f7' }} />
                <Bar dataKey="revenue" name="revenue" fill="#1a1a1a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-[#c0c0c0]">No revenue data yet</div>
          )}
        </div>

        <div className="bg-white border border-[#e5e5e5] p-6">
          <div className="mb-5">
            <Label>Fleet composition</Label>
            <p className="text-base font-medium text-[#1a1a1a] mt-1">Status breakdown</p>
          </div>
          {donutData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0}>
                  {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={6}
                  formatter={v => <span style={{ color: '#5c5c5c', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{v}</span>} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-[#c0c0c0]">No vehicle data</div>
          )}
        </div>
      </div>

      {/* Popular vehicles + Branches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e5e5e5] p-6">
          <div className="mb-5">
            <Label>Performance</Label>
            <p className="text-base font-medium text-[#1a1a1a] mt-1">Most rented vehicles</p>
          </div>
          {analytics?.popular_vehicles?.length > 0 ? (
            <div className="space-y-4">
              {analytics.popular_vehicles.slice(0, 5).map((v, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-[11px] text-[#c0c0c0] w-5 tabular-nums font-mono shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">{v.brand} {v.model}</p>
                    <p className="text-[10px] text-[#a0a0a0] mt-0.5 uppercase tracking-wide">{v.vehicle_type}</p>
                  </div>
                  <span className="text-xs tabular-nums text-[#a0a0a0] shrink-0">{v.rental_count} rentals</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-[#c0c0c0]">No rental data yet</div>
          )}
        </div>

        <div className="bg-white border border-[#e5e5e5] p-6">
          <div className="mb-5">
            <Label>Locations</Label>
            <p className="text-base font-medium text-[#1a1a1a] mt-1">Fleet by branch</p>
          </div>
          {fleetData?.fleet_by_branch?.length > 0 ? (
            <div className="space-y-3">
              {fleetData.fleet_by_branch.map((b, i) => {
                const total = b.total_vehicles || 0
                const rentedPct = total > 0 ? Math.round(((b.rented || 0) / total) * 100) : 0
                return (
                  <div key={i} className="border border-[#ebebeb] rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-[#1a1a1a]">{b.branch_code || 'Unknown'}</p>
                      <span className="text-[10px] text-[#a0a0a0]">{total} vehicles</span>
                    </div>
                    <div className="w-full bg-[#f0f0f0] rounded-full h-0.5 mb-2">
                      <div className="bg-[#1a1a1a] h-0.5 rounded-full" style={{ width: `${rentedPct}%` }} />
                    </div>
                    <div className="flex gap-4 text-[10px] uppercase tracking-wide">
                      <span className="text-[#5c5c5c]">{b.available || 0} avail</span>
                      <span className="text-[#5c5c5c]">{b.rented || 0} rented</span>
                      {(b.in_maintenance > 0) && <span className="text-[#5c5c5c]">{b.in_maintenance} service</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-[#c0c0c0]">No branch data</div>
          )}
        </div>
      </div>

      {/* Export */}
      <div className="bg-white border border-[#e5e5e5] p-6">
        <div className="mb-5">
          <Label>Data export</Label>
          <p className="text-base font-medium text-[#1a1a1a] mt-0.5">Download as CSV</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { type: 'revenue',  label: 'Revenue report',  sub: 'Revenue by period' },
            { type: 'fleet',    label: 'Vehicle report',    sub: 'Branch breakdown' },
            { type: 'customer', label: 'Customer report', sub: 'Activity metrics' },
          ].map(({ type, label, sub }) => (
            <button key={type} onClick={() => exportReport(type)}
              className="flex items-center gap-3 px-5 py-4 border border-[#e5e5e5] text-left hover:border-[#c0c0c0] hover:bg-[#fafafa] transition-colors group">
              <div className="w-8 h-8 rounded bg-[#f7f7f7] border border-[#e5e5e5] flex items-center justify-center shrink-0 group-hover:border-[#c0c0c0] transition-colors">
                <Download className="h-3.5 w-3.5 text-[#a0a0a0]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1a1a1a]">{label}</p>
                <p className="text-[10px] text-[#a0a0a0] mt-0.5">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
