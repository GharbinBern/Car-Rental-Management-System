import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Rentals() {
  const [rentals, setRentals] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchRentals = async () => {
    try {
      const [rentalsRes, vehiclesRes, customersRes] = await Promise.all([
        axios.get('http://localhost:8000/api/rentals/'),
        axios.get('http://localhost:8000/api/vehicles/?status=available'),
        axios.get('http://localhost:8000/api/customers/')
      ])
      setRentals(rentalsRes.data)
      setVehicles(vehiclesRes.data)
      setCustomers(customersRes.data)
    } catch (err) {
      console.error('Error fetching data:', err)
      setRentals([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRentals()
  }, [])

  const handleCreateRental = async (rentalData) => {
    try {
      await axios.post('http://localhost:8000/api/rentals/', rentalData)
      fetchRentals()
      setShowAddModal(false)
    } catch (err) {
      console.error('Error creating rental:', err)
      alert('Failed to create rental')
    }
  }

  const handleReturnVehicle = async (rentalId) => {
    try {
      await axios.post(`http://localhost:8000/api/rentals/${rentalId}/return`)
      fetchRentals()
    } catch (err) {
      console.error('Error returning vehicle:', err)
      alert('Failed to return vehicle')
    }
  }

  const filteredRentals = rentals.filter(rental =>
    rental.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rental.vehicle_info.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rental.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const calculateTotalCost = (rental) => {
    if (rental.status === 'ongoing') {
      const start = new Date(rental.start_date)
      const now = new Date()
      const days = Math.ceil((now - start) / (1000 * 60 * 60 * 24))
      return days * rental.daily_rate
    }
    return rental.total_cost || 0
  }

  if (loading) return <div className="p-4">Loading rentals...</div>

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium">Rentals</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          New Rental
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search rentals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-64"
        />
      </div>

      <div className="bg-white shadow rounded">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Start Date</th>
              <th className="p-3">End Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total Cost</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRentals.map(rental => (
              <tr key={rental.rental_id} className="border-t">
                <td className="p-3">{rental.customer_name}</td>
                <td className="p-3">{rental.vehicle_info}</td>
                <td className="p-3">{new Date(rental.start_date).toLocaleDateString()}</td>
                <td className="p-3">
                  {rental.end_date ? new Date(rental.end_date).toLocaleDateString() : '-'}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    rental.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    rental.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {rental.status}
                  </span>
                </td>
                <td className="p-3">€{calculateTotalCost(rental).toFixed(2)}</td>
                <td className="p-3">
                  {rental.status === 'ongoing' && (
                    <button
                      onClick={() => handleReturnVehicle(rental.rental_id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Return Vehicle
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <RentalModal
          vehicles={vehicles}
          customers={customers}
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateRental}
        />
      )}
    </div>
  )
}

function RentalModal({ vehicles, customers, onClose, onSave }) {
  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_code: '',
    start_date: new Date().toISOString().split('T')[0],
    expected_end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-xl font-medium mb-4">Create New Rental</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle</label>
              <select
                value={formData.vehicle_code}
                onChange={(e) => setFormData({...formData, vehicle_code: e.target.value})}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v.vehicle_code} value={v.vehicle_code}>
                    {v.brand} {v.model} (€{v.daily_rate}/day)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="border p-2 rounded w-full"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expected Return Date</label>
              <input
                type="date"
                value={formData.expected_end_date}
                onChange={(e) => setFormData({...formData, expected_end_date: e.target.value})}
                className="border p-2 rounded w-full"
                min={formData.start_date}
                required
              />
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
              Create Rental
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}