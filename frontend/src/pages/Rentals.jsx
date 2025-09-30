import React, { useEffect, useState } from 'react'
import { apiService } from '../services/api'
import { formatEuro } from '../utils/currency'
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  TruckIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

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
        apiService.getRentals(),
        apiService.getVehicles(),
        apiService.getCustomers()
      ])
      setRentals(rentalsRes.data)
      setVehicles(vehiclesRes.data.filter(v => v.status && v.status.toLowerCase() === 'available'))
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
      await apiService.addRental(rentalData)
      fetchRentals()
      setShowAddModal(false)
    } catch (err) {
      console.error('Error creating rental:', err)
      alert('Failed to create rental')
    }
  }

  const handleReturnVehicle = async (rentalId) => {
    try {
      const returnData = {
        actual_return_datetime: new Date().toISOString(),
        additional_charges: 0,
        notes: 'Returned via web interface'
      }
      await apiService.returnVehicle(rentalId, returnData)
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
    if (rental.status?.toLowerCase() === 'active') {
      const start = new Date(rental.start_date)
      const now = new Date()
      const days = Math.ceil((now - start) / (1000 * 60 * 60 * 24))
      return days * rental.daily_rate
    }
    return rental.total_cost || 0
  }

  if (loading) return (
    <div className="p-4 text-center">
      <ClipboardDocumentListIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">Loading rentals...</p>
    </div>
  )

  const activeRentals = rentals.filter(r => r.status?.toLowerCase() === 'active')
  const completedRentals = rentals.filter(r => r.status?.toLowerCase() === 'completed')
  const reservedRentals = rentals.filter(r => r.status?.toLowerCase() === 'reserved')

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-medium">Rental Management</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>New Rental</span>
        </button>
      </div>

      {/* Rental Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Active Rentals</p>
              <p className="text-xl font-semibold">{activeRentals.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-semibold">{completedRentals.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Reserved</p>
              <p className="text-xl font-semibold">{reservedRentals.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <CurrencyEuroIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-semibold">
                {formatEuro(rentals.reduce((sum, r) => sum + (parseFloat(r.total_cost) || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search rentals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border pl-10 pr-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
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
              <tr key={rental.rental_id} className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <UserIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{rental.customer_name}</p>
                      <p className="text-sm text-gray-500">ID: {rental.customer_id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <TruckIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">{rental.vehicle_info}</p>
                      <p className="text-sm text-gray-500">{rental.vehicle_code}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">{new Date(rental.start_date).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">
                      {rental.end_date ? new Date(rental.end_date).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    {rental.status?.toLowerCase() === 'active' && <ClockIcon className="h-4 w-4 text-orange-500 mr-2" />}
                    {rental.status?.toLowerCase() === 'completed' && <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />}
                    {rental.status?.toLowerCase() === 'reserved' && <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2" />}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      rental.status?.toLowerCase() === 'active' ? 'bg-orange-100 text-orange-800' :
                      rental.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                      rental.status?.toLowerCase() === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {rental.status}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <CurrencyEuroIcon className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="font-semibold text-gray-900">
                      {calculateTotalCost(rental).toFixed(2)}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  {rental.status?.toLowerCase() === 'active' && (
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
  // Function to get local datetime string for datetime-local input
  const getLocalDateTimeString = (date) => {
    const tzoffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(date - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  }

  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_id: '',
    pickup_datetime: getLocalDateTimeString(new Date()),
    return_datetime: getLocalDateTimeString(new Date(Date.now() + 24 * 60 * 60 * 1000))
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
                onChange={(e) => setFormData({...formData, customer_id: parseInt(e.target.value)})}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {`${c.first_name} ${c.last_name}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle</label>
              <select
                value={formData.vehicle_id}
                onChange={(e) => setFormData({...formData, vehicle_id: parseInt(e.target.value)})}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v.vehicle_id} value={v.vehicle_id}>
                    {v.brand} {v.model} ({formatEuro(v.daily_rate)}/day)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pickup Date & Time</label>
              <input
                type="datetime-local"
                value={formData.pickup_datetime}
                onChange={(e) => setFormData({...formData, pickup_datetime: e.target.value})}
                className="border p-2 rounded w-full"
                min={getLocalDateTimeString(new Date())}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Return Date & Time</label>
              <input
                type="datetime-local"
                value={formData.return_datetime}
                onChange={(e) => setFormData({...formData, return_datetime: e.target.value})}
                className="border p-2 rounded w-full"
                min={formData.pickup_datetime}
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