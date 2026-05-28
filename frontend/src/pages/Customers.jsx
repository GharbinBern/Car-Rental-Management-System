import React, { useEffect, useState } from 'react'
import { apiService } from '../services/api'
import { Search, Plus, Pencil, Star, User } from 'lucide-react'

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

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLoyalty, setFilterLoyalty] = useState('all')

  const fetchCustomers = () => {
    setLoading(true)
    apiService.getCustomers()
      .then(res => setCustomers(res.data))
      .catch(err => { console.error(err); setCustomers([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCustomers() }, [])

  const handleAdd = async (data) => {
    try { await apiService.addCustomer(data); fetchCustomers(); setShowAddModal(false) }
    catch (err) { if (err?.response?.status !== 403) alert('Failed to add customer') }
  }

  const handleUpdate = async (id, updates) => {
    try { await apiService.updateCustomer(id, updates); fetchCustomers(); setEditingCustomer(null) }
    catch (err) { if (err?.response?.status !== 403) alert('Failed to update customer') }
  }

  const loyaltyCount = customers.filter(c => c.is_loyalty_member).length

  const filtered = customers
    .filter(c => filterLoyalty === 'all' || (filterLoyalty === 'loyalty' ? c.is_loyalty_member : !c.is_loyalty_member))
    .filter(c =>
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || '').includes(searchTerm)
    )

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
          <Label>Client management</Label>
          <h1 className="text-3xl font-semibold text-[#1a1a1a] mt-1.5 tracking-tight">Customers</h1>
        </div>
                  <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded text-sm font-medium hover:bg-[#333] transition-colors">
            <Plus className="h-4 w-4" /> Add customer
          </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e5e5] p-6">
          <Label>Total customers</Label>
          <p className="text-4xl font-light text-[#1a1a1a] mt-3 tabular-nums">{customers.length}</p>
        </div>
        <div className="bg-white border border-[#e5e5e5] p-6">
          <Label>Loyalty members</Label>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl font-light text-[#1a1a1a] tabular-nums">{loyaltyCount}</span>
            <span className="text-sm text-[#a0a0a0]">{customers.length > 0 ? Math.round((loyaltyCount / customers.length) * 100) : 0}%</span>
          </div>
        </div>
        <div className="bg-white border border-[#e5e5e5] p-6">
          <Label>Standard members</Label>
          <p className="text-4xl font-light text-[#1a1a1a] mt-3 tabular-nums">{customers.length - loyaltyCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5 bg-[#f7f7f7] border border-[#e5e5e5] rounded p-1">
          {[
            { key: 'all', label: `All (${customers.length})` },
            { key: 'loyalty', label: `Loyalty (${loyaltyCount})` },
            { key: 'standard', label: `Standard (${customers.length - loyaltyCount})` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilterLoyalty(key)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filterLoyalty === key ? 'bg-[#1a1a1a] text-white' : 'text-[#5c5c5c] hover:text-[#1a1a1a]'
              }`}>{label}</button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c0c0c0]" />
          <input type="text" placeholder="Name, email, phone…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#e5e5e5] rounded text-[#1a1a1a] placeholder-[#b0b0b0] focus:outline-none focus:border-[#1c69d4] focus:ring-2 focus:ring-[#1c69d4]/10 transition-all" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e5e5e5] overflow-hidden">
        <div className="overflow-y-auto max-h-[860px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-[#ebebeb]">
              {['Customer', 'Contact', 'License', 'Country', 'Membership', ''].map(h => (
                <th key={h} className="px-6 py-3 text-left text-[10px] font-medium text-[#a0a0a0] uppercase tracking-[0.1em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebebeb]">
            {filtered.map(c => (
              <tr key={c.customer_id} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-[#f7f7f7] border border-[#e5e5e5] flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-[#b0b0b0]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-medium text-[#1a1a1a]">{c.first_name} {c.last_name}</p>
                      <p className="text-[10px] text-[#c0c0c0] mt-0.5">ID {c.customer_id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-[#5c5c5c] text-xs">{c.email || '—'}</p>
                  <p className="text-[10px] text-[#a0a0a0] mt-0.5">{c.phone || '—'}</p>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-[#a0a0a0]">{c.license_number || '—'}</td>
                <td className="px-6 py-4 text-xs text-[#a0a0a0]">{c.country_of_residence || '—'}</td>
                <td className="px-6 py-4">
                  {c.is_loyalty_member
                    ? <span className="flex items-center gap-1 text-[10px] text-[#5c5c5c] border border-[#e5e5e5] rounded px-2 py-0.5 w-fit bg-white">
                        <Star className="h-2.5 w-2.5" />Member
                      </span>
                    : <span className="text-[10px] text-[#c0c0c0]">Standard</span>}
                </td>
                <td className="px-6 py-4">
                                      <button onClick={() => setEditingCustomer(c)}
                      className="p-1.5 text-[#c0c0c0] hover:text-[#1a1a1a] hover:bg-[#f7f7f7] rounded transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-16 text-center text-[10px] uppercase tracking-widest text-[#c0c0c0]">No customers found</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {showAddModal && <CustomerModal onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
      {editingCustomer && (
        <CustomerModal customer={editingCustomer} onClose={() => setEditingCustomer(null)}
          onSave={updates => handleUpdate(editingCustomer.customer_id, updates)} />
      )}
    </div>
  )
}

function CustomerModal({ customer, onClose, onSave }) {
  const [f, setF] = useState({
    customer_code: customer?.customer_code || '', first_name: customer?.first_name || '',
    last_name: customer?.last_name || '', email: customer?.email || '',
    phone: customer?.phone || '', date_of_birth: customer?.date_of_birth || '',
    license_number: customer?.license_number || '', country_of_residence: customer?.country_of_residence || '',
    is_loyalty_member: customer?.is_loyalty_member || false,
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-[#e5e5e5] shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-[#ebebeb]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#a0a0a0]">Client management</p>
          <h3 className="text-lg font-semibold text-[#1a1a1a] mt-1">{customer ? 'Edit customer' : 'Add customer'}</h3>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(f) }} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
            <Field label="Customer code">
              <input type="text" value={f.customer_code} onChange={e => set('customer_code', e.target.value)} className={inputCls} placeholder="Auto-generated if empty" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name"><input type="text" value={f.first_name} onChange={e => set('first_name', e.target.value)} className={inputCls} required /></Field>
              <Field label="Last name"><input type="text" value={f.last_name} onChange={e => set('last_name', e.target.value)} className={inputCls} required /></Field>
            </div>
            <Field label="Email"><input type="email" value={f.email} onChange={e => set('email', e.target.value)} className={inputCls} /></Field>
            <Field label="Phone"><input type="tel" value={f.phone} onChange={e => set('phone', e.target.value)} className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date of birth"><input type="date" value={f.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} className={inputCls} /></Field>
              <Field label="Country"><input type="text" value={f.country_of_residence} onChange={e => set('country_of_residence', e.target.value)} className={inputCls} /></Field>
            </div>
            <Field label="License number"><input type="text" value={f.license_number} onChange={e => set('license_number', e.target.value)} className={inputCls} /></Field>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${f.is_loyalty_member ? 'bg-[#1a1a1a] border-[#1a1a1a]' : 'border-[#d0d0d0] bg-white'}`}
                onClick={() => set('is_loyalty_member', !f.is_loyalty_member)}>
                {f.is_loyalty_member && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-sm text-[#5c5c5c] group-hover:text-[#1a1a1a] transition-colors">Loyalty member</span>
            </label>
          </div>
          <div className="px-6 py-4 border-t border-[#ebebeb] flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#5c5c5c] hover:text-[#1a1a1a] transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm bg-[#1a1a1a] text-white rounded font-medium hover:bg-[#333] transition-colors">
              {customer ? 'Update' : 'Add customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
