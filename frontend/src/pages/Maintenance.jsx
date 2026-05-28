import React, { useEffect, useState } from 'react'
import { apiService } from '../services/api'
import { formatEuro } from '../utils/currency'
import { Plus, AlertTriangle, Clock, CheckCircle, Wrench, Gauge } from 'lucide-react'

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

function StatusBadge({ s }) {
  return (
    <span className="text-[10px] text-[#5c5c5c] border border-[#e5e5e5] rounded px-2 py-0.5 capitalize bg-white">
      {s}
    </span>
  )
}

const STATUS_MAP = {
  'in-maintenance': { label: 'In service', Icon: Wrench },
  overdue:          { label: 'Overdue',    Icon: AlertTriangle },
  'due-soon':       { label: 'Due soon',   Icon: Clock },
  good:             { label: 'Good',       Icon: CheckCircle },
}

export default function Maintenance() {
  const [vehicles, setVehicles] = useState([])
  const [maintenanceRecords, setMaintenanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [vr, mr] = await Promise.all([apiService.getVehicles(), apiService.getMaintenance()])
      setVehicles(vr.data)
      setMaintenanceRecords(mr.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSchedule = async (data) => {
    try { await apiService.scheduleMaintenance(data); fetchData(); setShowAddModal(false); setSelectedVehicle(null) }
    catch (err) { if (err?.response?.status !== 403) alert('Failed to schedule maintenance') }
  }

  const daysSince = (date) => !date ? null : Math.ceil((new Date() - new Date(date)) / 86400000)

  const getStatus = (v) => {
    if (v.status?.toLowerCase() === 'maintenance') return 'in-maintenance'
    const d = daysSince(v.last_maintenance_date)
    if (d === null) return 'good'   // no history yet — not overdue
    if (d > 180) return 'overdue'
    if (d > 150) return 'due-soon'
    return 'good'
  }

  const openModal = (vehicle = null) => { setSelectedVehicle(vehicle); setShowAddModal(true) }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#a0a0a0]">Loading</p>
    </div>
  )

  const overdue = vehicles.filter(v => getStatus(v) === 'overdue')
  const dueSoon = vehicles.filter(v => getStatus(v) === 'due-soon')
  const inMaintenance = vehicles.filter(v => v.status?.toLowerCase() === 'maintenance')
  const upToDate = vehicles.filter(v => getStatus(v) === 'good' && v.status?.toLowerCase() !== 'maintenance')
  const alerts = [...overdue, ...dueSoon]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <Label>Vehicle service</Label>
          <h1 className="text-3xl font-semibold text-[#1a1a1a] mt-1.5 tracking-tight">Maintenance</h1>
        </div>
                  <button onClick={() => openModal()}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded text-sm font-medium hover:bg-[#333] transition-colors">
            <Plus className="h-4 w-4" /> Schedule
          </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Cumulative maintenance cost', value: formatEuro(maintenanceRecords.reduce((s, r) => s + (parseFloat(r.cost) || 0), 0)) },
          { label: 'In service',                  value: inMaintenance.length },
          { label: 'Good standing',               value: upToDate.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-[#e5e5e5] p-6">
            <Label>{label}</Label>
            <p className="text-2xl font-light text-[#1a1a1a] mt-3 tabular-nums truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white border border-[#e5e5e5] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#ebebeb] flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
            <Label>Vehicles requiring attention</Label>
          </div>
          <div className="divide-y divide-[#ebebeb]">
            {alerts.map(v => {
              const s = getStatus(v)
              const { Icon } = STATUS_MAP[s]
              const isOverdue = s === 'overdue'
              const d = daysSince(v.last_maintenance_date)
              return (
                <div key={v.vehicle_id} className="px-6 py-4 flex items-center justify-between hover:bg-[#fafafa] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded bg-[#f7f7f7] border border-[#e5e5e5] flex items-center justify-center">
                      <Icon className="h-4 w-4 text-[#5c5c5c]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1a1a]">{v.brand} {v.model}</p>
                      <p className="text-[10px] text-[#a0a0a0] mt-0.5">
                        {v.vehicle_code} · {isOverdue && d !== null ? `${d - 180} days past due` : d !== null ? `${180 - d} days until due` : 'Schedule first service'}
                      </p>
                    </div>
                  </div>
                                      <button onClick={() => openModal(v)}
                      className="text-xs text-[#1c69d4] hover:underline transition-colors">
                      Schedule
                    </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Fleet status table */}
      <div className="bg-white border border-[#e5e5e5] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#ebebeb]">
          <Label>Vehicle overview</Label>
          <p className="text-base font-medium text-[#1a1a1a] mt-0.5">All vehicles</p>
        </div>
        <div className="overflow-y-auto max-h-[860px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-[#ebebeb]">
              {['Vehicle', 'Status', 'Mileage', 'Last service', 'Days since', ''].map(h => (
                <th key={h} className="px-6 py-3 text-left text-[10px] font-medium text-[#a0a0a0] uppercase tracking-[0.1em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebebeb]">
            {vehicles.map(v => {
              const s = getStatus(v)
              const { label } = STATUS_MAP[s]
              const d = daysSince(v.last_maintenance_date)
              return (
                <tr key={v.vehicle_id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#1a1a1a]">{v.brand} {v.model}</p>
                    <p className="text-[10px] text-[#c0c0c0] font-mono mt-0.5">{v.vehicle_code}</p>
                  </td>
                  <td className="px-6 py-4"><StatusBadge s={label} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-[#a0a0a0]">
                      <Gauge className="h-3 w-3 text-[#c0c0c0]" strokeWidth={1.5} />
                      {v.mileage ? v.mileage.toLocaleString() + ' km' : '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#a0a0a0] tabular-nums">
                    {v.last_maintenance_date ? new Date(v.last_maintenance_date).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs tabular-nums ${d !== null && d > 180 ? 'text-red-500' : d !== null && d > 150 ? 'text-orange-500' : 'text-[#a0a0a0]'}`}>
                      {d !== null ? `${d}d` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {v.status?.toLowerCase() !== 'maintenance' && (
                      <button onClick={() => openModal(v)}
                        className="text-xs text-[#1c69d4] hover:underline transition-colors">
                        Schedule
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Service history */}
      {maintenanceRecords.length > 0 && (
        <div className="bg-white border border-[#e5e5e5] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#ebebeb]">
            <Label>Service history</Label>
            <p className="text-base font-medium text-[#1a1a1a] mt-0.5">Recent records</p>
          </div>
          <div className="overflow-y-auto max-h-[860px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-[#ebebeb]">
                {['Vehicle', 'Description', 'Date', 'Cost', 'Technician'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-medium text-[#a0a0a0] uppercase tracking-[0.1em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebebeb]">
              {maintenanceRecords.map(r => (
                <tr key={r.maintenance_id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-6 py-4 text-xs font-medium text-[#1a1a1a]">{r.vehicle_info}</td>
                  <td className="px-6 py-4 text-xs text-[#5c5c5c] max-w-xs truncate">{r.description}</td>
                  <td className="px-6 py-4 text-xs text-[#a0a0a0] tabular-nums">{new Date(r.maintenance_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-xs text-[#5c5c5c] tabular-nums">{r.cost ? `€${parseFloat(r.cost).toFixed(2)}` : '—'}</td>
                  <td className="px-6 py-4 text-xs text-[#a0a0a0]">{r.performed_by || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <MaintenanceModal vehicles={vehicles} selectedVehicle={selectedVehicle}
          onClose={() => { setShowAddModal(false); setSelectedVehicle(null) }}
          onSave={handleSchedule} />
      )}
    </div>
  )
}

function MaintenanceModal({ vehicles, selectedVehicle, onClose, onSave }) {
  const [f, setF] = useState({
    vehicle_id: selectedVehicle?.vehicle_id || '',
    description: '', maintenance_date: new Date().toISOString().split('T')[0],
    cost: '', performed_by: '',
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-[#e5e5e5] shadow-xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-[#ebebeb]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#a0a0a0]">Vehicle service</p>
          <h3 className="text-lg font-semibold text-[#1a1a1a] mt-1">Schedule maintenance</h3>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave({ ...f, cost: parseFloat(f.cost) || 0 }) }}>
          <div className="px-6 py-5 space-y-4">
            <Field label="Vehicle">
              <select value={f.vehicle_id} onChange={e => set('vehicle_id', parseInt(e.target.value))} className={inputCls} required>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.vehicle_id} value={v.vehicle_id}>{v.brand} {v.model} ({v.vehicle_code})</option>)}
              </select>
            </Field>
            <Field label="Description">
              <textarea value={f.description} onChange={e => set('description', e.target.value)}
                className={inputCls + ' h-20 resize-none'} required placeholder="Describe the service needed…" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date"><input type="date" value={f.maintenance_date} onChange={e => set('maintenance_date', e.target.value)} className={inputCls} required /></Field>
              <Field label="Cost (€)"><input type="number" value={f.cost} onChange={e => set('cost', e.target.value)} className={inputCls} step="0.01" min="0" placeholder="0.00" /></Field>
            </div>
            <Field label="Technician"><input type="text" value={f.performed_by} onChange={e => set('performed_by', e.target.value)} className={inputCls} placeholder="Name or service provider" /></Field>
          </div>
          <div className="px-6 py-4 border-t border-[#ebebeb] flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#5c5c5c] hover:text-[#1a1a1a] transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm bg-[#1a1a1a] text-white rounded font-medium hover:bg-[#333] transition-colors">Schedule</button>
          </div>
        </form>
      </div>
    </div>
  )
}
