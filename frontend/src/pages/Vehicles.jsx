import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { formatEuro } from '../utils/currency'
import { Search, Plus, Pencil, Wrench, CheckCircle, Fuel, Gauge } from 'lucide-react'

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
    <span className="text-[10px] text-[#5c5c5c] border border-[#e5e5e5] rounded px-2 py-0.5 capitalize font-normal bg-white">
      {status}
    </span>
  )
}

/* Clean SVG car silhouettes — one per vehicle type */
function CarSilhouette({ type }) {
  const t = (type || '').toLowerCase()

  if (t.includes('suv') || t.includes('van') || t.includes('mpv')) {
    return (
      <svg viewBox="0 0 280 110" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full max-w-[200px]">
        <path d="M30 75 L30 42 Q30 36 35 33 L58 22 Q72 14 110 13 L190 13 Q225 14 242 26 Q252 35 252 42 L252 75" />
        <line x1="30" y1="75" x2="252" y2="75" />
        <path d="M30 75 Q24 75 22 72 L22 62 Q22 58 26 58 L30 58" />
        <path d="M252 75 Q258 75 260 72 L260 62 Q260 58 256 58 L252 58" />
        <path d="M58 33 L55 72" strokeWidth="1" />
        <path d="M242 33 L245 72" strokeWidth="1" />
        <circle cx="78" cy="76" r="18" /><circle cx="78" cy="76" r="8" />
        <circle cx="210" cy="76" r="18" /><circle cx="210" cy="76" r="8" />
      </svg>
    )
  }

  if (t.includes('convert') || t.includes('cabrio') || t.includes('spider')) {
    return (
      <svg viewBox="0 0 280 110" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full max-w-[200px]">
        <path d="M25 72 Q28 72 30 65 L50 45 Q65 32 100 30 L185 30 Q215 32 230 45 L252 65 Q254 72 258 72" />
        <line x1="62" y1="72" x2="220" y2="72" />
        <path d="M25 72 Q20 72 18 69 L18 62 Q18 58 22 58 L25 58" />
        <path d="M258 72 Q263 72 265 69 L265 62 Q265 58 261 58 L258 58" />
        <path d="M100 30 Q90 22 100 20" strokeWidth="1" />
        <path d="M185 30 Q195 22 185 20" strokeWidth="1" />
        <path d="M100 20 L185 20" strokeWidth="1" strokeDasharray="4 3" />
        <circle cx="75" cy="73" r="17" /><circle cx="75" cy="73" r="7" />
        <circle cx="205" cy="73" r="17" /><circle cx="205" cy="73" r="7" />
      </svg>
    )
  }

  if (t.includes('sport') || t.includes('coupe') || t.includes('gt')) {
    return (
      <svg viewBox="0 0 280 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full max-w-[200px]">
        <path d="M18 68 Q20 68 24 60 L50 38 Q68 22 105 20 L185 20 Q220 22 242 38 L262 60 Q265 68 268 68" />
        <line x1="52" y1="68" x2="240" y2="68" />
        <path d="M18 68 Q12 68 10 65 L10 60 Q10 56 14 56 L18 56" />
        <path d="M268 68 Q274 68 276 65 L276 60 Q276 56 272 56 L268 56" />
        <path d="M52 38 L50 65" strokeWidth="1" />
        <path d="M240 38 L242 65" strokeWidth="1" />
        <path d="M105 20 L185 20" />
        <circle cx="72" cy="69" r="16" /><circle cx="72" cy="69" r="7" />
        <circle cx="210" cy="69" r="16" /><circle cx="210" cy="69" r="7" />
      </svg>
    )
  }

  /* Default — sedan / luxury / midsize / economy */
  return (
    <svg viewBox="0 0 280 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full max-w-[200px]">
      <path d="M22 70 Q24 70 27 62 L55 40 Q72 25 108 22 L178 22 Q215 24 232 38 L258 62 Q262 70 265 70" />
      <line x1="58" y1="70" x2="242" y2="70" />
      <path d="M22 70 Q16 70 14 67 L14 60 Q14 56 18 56 L22 56" />
      <path d="M265 70 Q271 70 273 67 L273 60 Q273 56 269 56 L265 56" />
      <path d="M62 40 L58 67 M228 40 L232 67" strokeWidth="1" />
      <path d="M112 22 Q102 38 108 40 L185 40 Q192 38 182 22 Z" strokeWidth="1" />
      <circle cx="80" cy="71" r="16" /><circle cx="80" cy="71" r="7" />
      <circle cx="205" cy="71" r="16" /><circle cx="205" cy="71" r="7" />
    </svg>
  )
}

function VehicleCard({ v, onEdit, onStatusChange }) {
  return (
    <div className="bg-white border border-[#e5e5e5] overflow-hidden hover:shadow-md hover:border-[#d0d0d0] transition-all duration-200 group flex flex-col">
      {/* Top strip */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <StatusBadge status={v.status} />
        <span className="text-[9px] text-[#c0c0c0] font-mono tracking-[0.12em] uppercase">{v.vehicle_code}</span>
      </div>

      {/* Car visual */}
      <div className="bg-[#f7f7f7] mx-4 h-44 flex items-center justify-center">
        <div className="text-[#c0c0c0] group-hover:text-[#a8a8a8] transition-colors duration-200 px-4 w-full flex justify-center">
          <CarSilhouette type={v.vehicle_type || v.type} />
        </div>
      </div>

      {/* Info */}
      <div className="px-5 pt-5 pb-3 flex-1">
        <h3 className="text-base font-semibold text-[#1a1a1a] tracking-tight">{v.brand} {v.model}</h3>

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {v.vehicle_type && <span className="text-[10px] text-[#a0a0a0] uppercase tracking-wide">{v.vehicle_type}</span>}
          {v.vehicle_type && v.transmission && <span className="text-[#d0d0d0] text-[10px]">·</span>}
          {v.transmission && <span className="text-[10px] text-[#a0a0a0] uppercase tracking-wide">{v.transmission}</span>}
          {v.seating_capacity && <><span className="text-[#d0d0d0] text-[10px]">·</span><span className="text-[10px] text-[#a0a0a0]">{v.seating_capacity} seats</span></>}
        </div>

        <div className="flex items-center gap-4 mt-3">
          {v.fuel_type && (
            <div className="flex items-center gap-1">
              <Fuel className="h-3 w-3 text-[#c0c0c0]" strokeWidth={1.5} />
              <span className="text-[10px] text-[#a0a0a0] uppercase tracking-wide">{v.fuel_type}</span>
            </div>
          )}
          {v.mileage != null && (
            <div className="flex items-center gap-1">
              <Gauge className="h-3 w-3 text-[#c0c0c0]" strokeWidth={1.5} />
              <span className="text-[10px] text-[#a0a0a0] tabular-nums">{Number(v.mileage).toLocaleString()} km</span>
            </div>
          )}
        </div>
      </div>

      {/* Rate + actions */}
      <div className="px-5 py-4 border-t border-[#ebebeb] flex items-center justify-between">
        <div>
          <span className="text-xl font-semibold text-[#1a1a1a] tabular-nums">{v.daily_rate ? formatEuro(v.daily_rate) : '—'}</span>
          <span className="text-xs text-[#a0a0a0] ml-1">/day</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => onEdit(v)} title="Edit"
            className="p-2 text-[#b0b0b0] hover:text-[#1a1a1a] hover:bg-[#f7f7f7] rounded transition-colors">
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          {v.status?.toLowerCase() === 'maintenance' && (
            <button onClick={() => onStatusChange(v.vehicle_code, { status: 'available' })} title="Mark available"
              className="p-2 text-[#b0b0b0] hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
              <CheckCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          )}
          {v.status?.toLowerCase() === 'available' && (
            <button onClick={() => onStatusChange(v.vehicle_code, { status: 'maintenance' })} title="Send to maintenance"
              className="p-2 text-[#b0b0b0] hover:text-orange-600 hover:bg-orange-50 rounded transition-colors">
              <Wrench className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchVehicles = () => {
    setLoading(true)
    apiService.getVehicles()
      .then(res => setVehicles(res.data))
      .catch(err => { console.error(err); setVehicles([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchVehicles() }, [])

  const handleAdd = async (data) => {
    try { await apiService.addVehicle(data); fetchVehicles(); setShowAddModal(false) }
    catch (err) { if (err?.response?.status !== 403) alert('Failed to add vehicle') }
  }

  const handleUpdate = async (code, updates) => {
    try { await apiService.updateVehicle(code, updates); fetchVehicles(); setEditingVehicle(null) }
    catch (err) { if (err?.response?.status !== 403) alert('Failed to update vehicle') }
  }

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Available' },
    { key: 'rented', label: 'Rented' },
    { key: 'maintenance', label: 'Maintenance' },
  ]

  const filtered = vehicles.filter(v => {
    const q = searchTerm.toLowerCase()
    const m = !q || (v.vehicle_code || '').toLowerCase().includes(q) || (v.brand || '').toLowerCase().includes(q) || (v.model || '').toLowerCase().includes(q)
    return filter === 'all' ? m : m && v.status?.toLowerCase() === filter
  })

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#a0a0a0]">Loading</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <Label>Vehicle inventory</Label>
          <h1 className="text-3xl font-semibold text-[#1a1a1a] mt-1.5 tracking-tight">Vehicles</h1>
        </div>
                  <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded text-sm font-medium hover:bg-[#333] transition-colors">
            <Plus className="h-4 w-4" strokeWidth={2} /> Add vehicle
          </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total',       count: vehicles.length },
          { label: 'Available',   count: vehicles.filter(v => v.status?.toLowerCase() === 'available').length },
          { label: 'On rent',     count: vehicles.filter(v => v.status?.toLowerCase() === 'rented').length },
          { label: 'In service',  count: vehicles.filter(v => v.status?.toLowerCase() === 'maintenance').length },
        ].map(({ label, count }) => (
          <div key={label} className="bg-white border border-[#e5e5e5] p-5">
            <Label>{label}</Label>
            <p className="text-3xl font-light text-[#1a1a1a] mt-2 tabular-nums">{count}</p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5 bg-[#f7f7f7] border border-[#e5e5e5] rounded p-1">
          {FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
                filter === key ? 'bg-[#1a1a1a] text-white' : 'text-[#5c5c5c] hover:text-[#1a1a1a]'
              }`}>
              {label}
              <span className={`ml-1.5 text-[10px] ${filter === key ? 'text-white/60' : 'text-[#c0c0c0]'}`}>
                {key === 'all' ? vehicles.length : vehicles.filter(v => v.status?.toLowerCase() === key).length}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c0c0c0]" strokeWidth={1.5} />
          <input type="text" placeholder="Brand, model or code…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#e5e5e5] rounded text-[#1a1a1a] placeholder-[#b0b0b0] focus:outline-none focus:border-[#1c69d4] focus:ring-2 focus:ring-[#1c69d4]/10 transition-all" />
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(v => (
            <VehicleCard key={v.vehicle_code} v={v} onEdit={setEditingVehicle} onStatusChange={handleUpdate} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-white border border-[#e5e5e5]">
          <p className="text-[10px] uppercase tracking-widest text-[#c0c0c0]">No vehicles found</p>
        </div>
      )}

      {showAddModal && <VehicleModal onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
      {editingVehicle && (
        <VehicleModal vehicle={editingVehicle} onClose={() => setEditingVehicle(null)}
          onSave={updates => handleUpdate(editingVehicle.vehicle_code, updates)} />
      )}
    </div>
  )
}

function VehicleModal({ vehicle, onClose, onSave }) {
  const [f, setF] = useState({
    vehicle_code: vehicle?.vehicle_code || '', brand: vehicle?.brand || '',
    model: vehicle?.model || '', type: vehicle?.type || '',
    fuel_type: vehicle?.fuel_type || '', transmission: vehicle?.transmission || '',
    daily_rate: vehicle?.daily_rate || '', status: vehicle?.status || 'available',
    seating_capacity: vehicle?.seating_capacity || '',
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white border border-[#e5e5e5] shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-[#ebebeb]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#a0a0a0]">{vehicle ? 'Edit vehicle' : 'New vehicle'}</p>
          <h3 className="text-lg font-semibold text-[#1a1a1a] mt-1">{vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Add vehicle'}</h3>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(f) }} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
            <Field label="Vehicle code">
              <input type="text" value={f.vehicle_code} onChange={e => set('vehicle_code', e.target.value)} className={inputCls} required disabled={!!vehicle} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand"><input type="text" value={f.brand} onChange={e => set('brand', e.target.value)} className={inputCls} required /></Field>
              <Field label="Model"><input type="text" value={f.model} onChange={e => set('model', e.target.value)} className={inputCls} required /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select value={f.type} onChange={e => set('type', e.target.value)} className={inputCls}>
                  <option value="">Select type</option>
                  {['Economy','Midsize','Luxury','Luxury SUV','SUV','Van','Convertible','Sports','Coupe'].map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Fuel">
                <select value={f.fuel_type} onChange={e => set('fuel_type', e.target.value)} className={inputCls}>
                  <option value="">Select fuel</option>
                  {['Gasoline','Hybrid','Electric','Diesel'].map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Transmission">
                <select value={f.transmission} onChange={e => set('transmission', e.target.value)} className={inputCls}>
                  <option value="">Select</option>
                  <option>Automatic</option><option>Manual</option>
                </select>
              </Field>
              <Field label="Seats">
                <input type="number" value={f.seating_capacity} onChange={e => set('seating_capacity', parseInt(e.target.value) || '')} className={inputCls} min="1" max="15" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Daily rate (€)">
                <input type="number" value={f.daily_rate} onChange={e => set('daily_rate', e.target.value)} className={inputCls} required step="0.01" />
              </Field>
              <Field label="Status">
                <select value={f.status} onChange={e => set('status', e.target.value)} className={inputCls} required>
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </Field>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-[#ebebeb] flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#5c5c5c] hover:text-[#1a1a1a] transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm bg-[#1a1a1a] text-white rounded font-medium hover:bg-[#333] transition-colors">
              {vehicle ? 'Update' : 'Add vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
