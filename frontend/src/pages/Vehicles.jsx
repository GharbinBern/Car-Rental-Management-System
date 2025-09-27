import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchVehicles = () => {
    setLoading(true)
    axios.get('http://localhost:8000/api/vehicles/')
      .then(res => setVehicles(res.data))
      .catch(err => { console.error(err); setVehicles([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  const handleAddVehicle = async (vehicleData) => {
    try {
      await axios.post('http://localhost:8000/api/vehicles/', vehicleData)
      fetchVehicles()
      setShowAddModal(false)
    } catch (err) {
      console.error('Error adding vehicle:', err)
      alert('Failed to add vehicle')
    }
  }

  const handleUpdateVehicle = async (vehicleCode, updates) => {
    try {
      await axios.put(`http://localhost:8000/api/vehicles/${vehicleCode}`, updates)
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
        <h2 className="text-2xl font-medium">Vehicles</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Vehicle
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search vehicles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded"
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
              <tr key={v.vehicle_code} className="border-t">
                <td className="p-3">{v.vehicle_code}</td>
                <td className="p-3">{v.brand} {v.model}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    v.status === 'available' ? 'bg-green-100 text-green-800' :
                    v.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {v.status}
                  </span>
                </td>
                <td className="p-3">{v.daily_rate ? `€${v.daily_rate}` : '-'}</td>
                <td className="p-3">
                  <button
                    onClick={() => setEditingVehicle(v)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    Edit
                  </button>
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
