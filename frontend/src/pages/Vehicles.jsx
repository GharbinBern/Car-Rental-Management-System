import React, { useEffect, useState } from 'react'
import { apiService } from '../services/api'
import {
  TruckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'

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

  useEffect(() => {
    fetchVehicles()
  }, [])

  const handleAddVehicle = async (vehicleData) => {
    try {
      await apiService.addVehicle(vehicleData)
      fetchVehicles()
      setShowAddModal(false)
    } catch (err) {
      console.error('Error adding vehicle:', err)
      alert('Failed to add vehicle')
    }
  }

  const handleUpdateVehicle = async (vehicleCode, updates) => {
    try {
      await apiService.updateVehicle(vehicleCode, updates)
      fetchVehicles()
      setEditingVehicle(null)
    } catch (err) {
      console.error('Error updating vehicle:', err)
      alert('Failed to update vehicle')
    }
  }

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.vehicle_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    return matchesSearch && v.status.toLowerCase() === filter.toLowerCase()
  })

  if (loading) return <div className="p-4">Loading vehicles...</div>

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <TruckIcon className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-medium">Vehicle Fleet</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-xl font-semibold">{vehicles.filter(v => v.status?.toLowerCase() === 'available').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Rented</p>
              <p className="text-xl font-semibold">{vehicles.filter(v => v.status?.toLowerCase() === 'rented').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center">
            <WrenchScrewdriverIcon className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Maintenance</p>
              <p className="text-xl font-semibold">{vehicles.filter(v => v.status?.toLowerCase() === 'maintenance').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Fleet</p>
              <p className="text-xl font-semibold">{vehicles.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border pl-10 pr-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="rented">Rented</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div className="bg-white shadow rounded">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Status</th>
              <th className="p-3">Daily Rate</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map(v => (
              <tr key={v.vehicle_code} className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <TruckIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{v.vehicle_code}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="font-medium text-gray-900">{v.brand} {v.model}</p>
                    <p className="text-sm text-gray-500">{v.vehicle_type} • {v.seats} seats • {v.ac_available ? 'AC' : 'No AC'}</p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    {v.status?.toLowerCase() === 'available' && <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />}
                    {v.status?.toLowerCase() === 'rented' && <TruckIcon className="h-4 w-4 text-orange-500 mr-2" />}
                    {v.status?.toLowerCase() === 'maintenance' && <WrenchScrewdriverIcon className="h-4 w-4 text-red-500 mr-2" />}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      v.status?.toLowerCase() === 'available' ? 'bg-green-100 text-green-800' :
                      v.status?.toLowerCase() === 'rented' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-lg font-semibold text-gray-900">
                    {v.daily_rate ? `€${v.daily_rate}` : '-'}
                  </span>
                  <span className="text-sm text-gray-500">/day</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingVehicle(v)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit vehicle"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    {v.status?.toLowerCase() === 'maintenance' && (
                      <button
                        onClick={() => handleUpdateVehicle(v.vehicle_code, { status: 'available' })}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Mark as available"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    )}
                    {v.status?.toLowerCase() === 'available' && (
                      <button
                        onClick={() => handleUpdateVehicle(v.vehicle_code, { status: 'maintenance' })}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Mark for maintenance"
                      >
                        <WrenchScrewdriverIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <VehicleModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddVehicle}
        />
      )}

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <VehicleModal
          vehicle={editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onSave={(updates) => handleUpdateVehicle(editingVehicle.vehicle_code, updates)}
        />
      )}
    </div>
  )
}

function VehicleModal({ vehicle, onClose, onSave }) {
  const [formData, setFormData] = useState({
    vehicle_code: vehicle?.vehicle_code || '',
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    year: vehicle?.year || '',
    daily_rate: vehicle?.daily_rate || '',
    status: vehicle?.status || 'available'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-xl font-medium mb-4">
          {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle Code</label>
              <input
                type="text"
                value={formData.vehicle_code}
                onChange={(e) => setFormData({...formData, vehicle_code: e.target.value})}
                className="border p-2 rounded w-full"
                required
                disabled={!!vehicle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Daily Rate (€)</label>
              <input
                type="number"
                value={formData.daily_rate}
                onChange={(e) => setFormData({...formData, daily_rate: e.target.value})}
                className="border p-2 rounded w-full"
                required
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="border p-2 rounded w-full"
                required
              >
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {vehicle ? 'Update' : 'Add'} Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
