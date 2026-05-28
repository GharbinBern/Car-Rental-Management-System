import React, { useEffect, useState } from 'react'
import { apiService } from '../services/api'
import { formatEuro } from '../utils/currency'
import { Search, Plus, AlertCircle, Clock } from 'lucide-react'

const inputCls = 'w-full px-4 py-3 text-sm bg-[#f7f7f7] border border-[#e5e5e5] rounded text-[#1a1a1a] placeholder-[#b0b0b0] focus:outline-none focus:border-[#1c69d4] focus:ring-2 focus:ring-[#1c69d4]/10 transition-all'

function Label({ children }) {
  return <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0a0a0]">{children}</p>
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.15em] text-[#5c5c5c] mb-2">{label}</label>
      {children}
    </div>
  )
}

function StatusBadge({ status }) {
  return (
    <span className="text-[10px] text-[#5c5c5c] border border-[#e5e5e5] rounded px-2 py-0.5 capitalize bg-white">
      {status}
    </span>
  )
}

function DaysBadge({ rental }) {
  if (rental.status?.toLowerCase() !== 'active' || !rental.expected_return_date) return null
  const diff = Math.ceil((new Date(rental.expected_return_date) - new Date()) / 86400000)
  if (diff < 0) return (
    <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium">
      <AlertCircle className="h-2.5 w-2.5" />{Math.abs(diff)}d overdue
    </span>
  )
  if (diff <= 2) return (
    <span className="flex items-center gap-1 text-[10px] text-orange-500 font-medium">
      <Clock className="h-2.5 w-2.5" />{diff}d left
    </span>
  )
  return <span className="text-[10px] text-[#a0a0a0] tabular-nums">{diff}d left</span>
}

export default function Rentals() {
  const [rentals, setRentals] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchRentals = async () => {
    try {
      const [rr, vr, cr] = await Promise.all([apiService.getRentals(), apiService.getVehicles(), apiService.getCustomers()])
      setRentals(rr.data)
      setVehicles(vr.data.filter(v => v.status?.toLowerCase() === 'available'))
      setCustomers(cr.data)
    } catch (err) { console.error(err); setRentals([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRentals() }, [])

  const handleCreateRental = async (data) => {
    try { await apiService.addRental(data); fetchRentals(); setShowAddModal(false) }
    catch (err) { if (err?.response?.status !== 403) alert('Failed to create rental') }
  }

  const handleReturn = async (id) => {
    try {
      const now = new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '')
      await apiService.returnVehicle(id, { actual_return_datetime: now, additional_charges: 0, notes: 'Returned via web interface' })
      fetchRentals()
    } catch (err) { if (err?.response?.status !== 403) alert('Failed to return vehicle') }
  }

  const calcCost = (r) => {
    if (r.status?.toLowerCase() === 'active') return Math.ceil((new Date() - new Date(r.pickup_date)) / 86400000) * r.daily_rate
    return r.total_cost || 0
  }

  const calcDuration = (r) => {
    if (!r.pickup_date || !r.expected_return_date) return null
    return Math.ceil((new Date(r.expected_return_date) - new Date(r.pickup_date)) / 86400000)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#a0a0a0]">Loading</p>
    </div>
  )

  const active = rentals.filter(r => r.status?.toLowerCase() === 'active').length
  const completed = rentals.filter(r => r.status?.toLowerCase() === 'completed').length
  const reserved = rentals.filter(r => r.status?.toLowerCase() === 'reserved').length
  const totalRevenue = rentals.reduce((s, r) => s + (parseFloat(r.total_cost) || 0), 0)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const overdue = rentals.filter(r => r.status?.toLowerCase() === 'active' && r.expected_return_date && new Date(r.expected_return_date) < today).length

  const FILTERS = ['all', 'active', 'completed', 'reserved', 'cancelled']
  const filtered = rentals
    .filter(r => filterStatus === 'all' || r.status?.toLowerCase() === filterStatus)
    .filter(r =>
      (r.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.vehicle_info || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.status || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.pickup_date) - new Date(a.pickup_date))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <Label>Rental operations</Label>
          <h1 className="text-3xl font-semibold text-[#1a1a1a] mt-1.5 tracking-tight">Rentals</h1>
        </div>
                  <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded text-sm font-medium hover:bg-[#333] transition-colors">
            <Plus className="h-4 w-4" /> New rental
          </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Active', value: active },
          { label: 'Completed', value: completed },
          { label: 'Reserved', value: reserved },
          { label: 'Overdue', value: overdue, warn: overdue > 0 },
          { label: 'Total revenue', value: formatEuro(totalRevenue) },
        ].map(({ label, value, warn }) => (
          <div key={label} className="bg-white border border-[#e5e5e5] p-5">
            <Label>{label}</Label>
            <p className={`text-2xl font-light mt-2 tabular-nums tracking-tight truncate ${warn ? 'text-red-500' : 'text-[#1a1a1a]'}`}>{value}</p>
          </div>
        ))}
      </div>

      {overdue > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded w-fit">
          <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <span className="text-xs text-red-600">{overdue} rental{overdue > 1 ? 's' : ''} past return date</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-0.5 bg-[#f7f7f7] border border-[#e5e5e5] rounded p-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                filterStatus === f ? 'bg-[#1a1a1a] text-white' : 'text-[#5c5c5c] hover:text-[#1a1a1a]'
              }`}>
              {f === 'all' ? `All (${rentals.length})` : f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c0c0c0]" />
          <input type="text" placeholder="Search customer, vehicle…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#e5e5e5] rounded text-[#1a1a1a] placeholder-[#b0b0b0] focus:outline-none focus:border-[#1c69d4] focus:ring-2 focus:ring-[#1c69d4]/10 transition-all" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e5e5e5] overflow-hidden">
        <div className="overflow-y-auto max-h-[860px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-[#ebebeb]">
              {['Customer', 'Vehicle', 'Duration', 'Start', 'Return', 'Status', 'Cost', ''].map(h => (
                <th key={h} className="px-6 py-3 text-left text-[10px] font-medium text-[#a0a0a0] uppercase tracking-[0.1em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebebeb]">
            {filtered.map(r => (
              <tr key={r.rental_id} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-[#1a1a1a]">{r.customer_name}</p>
                  <p className="text-[10px] text-[#c0c0c0] mt-0.5">ID {r.customer_id}</p>
                </td>
                <td className="px-6 py-4 text-[#5c5c5c] text-xs">{r.vehicle_info}</td>
                <td className="px-6 py-4 tabular-nums text-xs text-[#a0a0a0]">
                  {calcDuration(r) !== null ? `${calcDuration(r)}d` : '—'}
                </td>
                <td className="px-6 py-4 text-[#a0a0a0] tabular-nums text-xs">{r.pickup_date ? new Date(r.pickup_date).toLocaleDateString() : '—'}</td>
                <td className="px-6 py-4">
                  <p className="text-[#a0a0a0] tabular-nums text-xs">{r.expected_return_date ? new Date(r.expected_return_date).toLocaleDateString() : '—'}</p>
                  <DaysBadge rental={r} />
                </td>
                <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                <td className="px-6 py-4 font-medium text-[#1a1a1a] tabular-nums text-xs">{formatEuro(calcCost(r))}</td>
                <td className="px-6 py-4">
                  {r.status?.toLowerCase() === 'active' && (
                    <button onClick={() => handleReturn(r.rental_id)}
                      className="text-[10px] text-[#1c69d4] hover:underline transition-colors">
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-16 text-center text-[10px] uppercase tracking-widest text-[#c0c0c0]">No rentals found</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {showAddModal && <RentalModal vehicles={vehicles} customers={customers} onClose={() => setShowAddModal(false)} onSave={handleCreateRental} />}
    </div>
  )
}

function RentalModal({ vehicles, customers, onClose, onSave }) {
  const toLocal = (d) => new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  const [f, setF] = useState({
    customer_id: '', vehicle_id: '',
    pickup_datetime: toLocal(new Date()),
    return_datetime: toLocal(new Date(Date.now() + 86400000)),
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-[#e5e5e5] shadow-xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-[#ebebeb]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#a0a0a0]">Rental operations</p>
          <h3 className="text-lg font-semibold text-[#1a1a1a] mt-1">New rental</h3>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(f) }}>
          <div className="px-6 py-5 space-y-4">
            <Field label="Customer">
              <select value={f.customer_id} onChange={e => set('customer_id', parseInt(e.target.value))} className={inputCls} required>
                <option value="">Select customer</option>
                {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </Field>
            <Field label="Vehicle">
              <select value={f.vehicle_id} onChange={e => set('vehicle_id', parseInt(e.target.value))} className={inputCls} required>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.vehicle_id} value={v.vehicle_id}>{v.brand} {v.model} — {formatEuro(v.daily_rate)}/day</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pickup">
                <input type="datetime-local" value={f.pickup_datetime} onChange={e => set('pickup_datetime', e.target.value)} min={toLocal(new Date())} className={inputCls} required />
              </Field>
              <Field label="Return">
                <input type="datetime-local" value={f.return_datetime} onChange={e => set('return_datetime', e.target.value)} min={f.pickup_datetime} className={inputCls} required />
              </Field>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-[#ebebeb] flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#5c5c5c] hover:text-[#1a1a1a] transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm bg-[#1a1a1a] text-white rounded font-medium hover:bg-[#333] transition-colors">Create rental</button>
          </div>
        </form>
      </div>
    </div>
  )
}
