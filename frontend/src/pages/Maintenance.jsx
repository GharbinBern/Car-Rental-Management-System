import React, { useEffect, useState } from 'react'
import { apiService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import {
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
  TruckIcon,
  PlusIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function Maintenance() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [maintenanceRecords, setMaintenanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  useEffect(() => {
    // Temporarily fetch data without authentication check for testing
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [vehiclesRes, maintenanceRes] = await Promise.all([
        apiService.getVehicles(),
        // Use base-relative path (baseURL already includes /api)
        apiService.getMaintenance()
      ])
      setVehicles(vehiclesRes.data)
      setMaintenanceRecords(maintenanceRes.data || [])
    } catch (err) {
      console.error('Error fetching maintenance data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleMaintenance = async (maintenanceData) => {
    try {
      await apiService.scheduleMaintenance(maintenanceData)
      fetchData()
      setShowAddModal(false)
      setSelectedVehicle(null)
    } catch (err) {
      console.error('Error scheduling maintenance:', err)
      alert('Failed to schedule maintenance')
    }
  }

  const handleScheduleForVehicle = (vehicle) => {
    setSelectedVehicle(vehicle)
    setShowAddModal(true)
  }

  const getDaysOverdue = (lastMaintenanceDate) => {
    const today = new Date()
    const lastMaintenance = new Date(lastMaintenanceDate)
    const diffTime = today - lastMaintenance
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getMaintenanceStatus = (vehicle) => {
    if (vehicle.status?.toLowerCase() === 'maintenance') return 'In Maintenance'
    
    const daysOverdue = getDaysOverdue(vehicle.last_maintenance_date)
    if (daysOverdue > 180) return 'Overdue'
    if (daysOverdue > 150) return 'Due Soon'
    return 'Good'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Good': return 'text-green-600 bg-green-100'
      case 'Due Soon': return 'text-yellow-600 bg-yellow-100'
      case 'Overdue': return 'text-red-600 bg-red-100'
      case 'In Maintenance': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Good': return <CheckCircleIcon className="h-4 w-4" />
      case 'Due Soon': return <ClockIcon className="h-4 w-4" />
      case 'Overdue': return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'In Maintenance': return <WrenchScrewdriverIcon className="h-4 w-4" />
      default: return <TruckIcon className="h-4 w-4" />
    }
  }

  if (authLoading || loading) return (
    <div className="p-4 text-center">
      <WrenchScrewdriverIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">Loading maintenance data...</p>
    </div>
  )

  const overdueVehicles = vehicles.filter(v => getMaintenanceStatus(v) === 'Overdue')
  const dueSoonVehicles = vehicles.filter(v => getMaintenanceStatus(v) === 'Due Soon')
  const inMaintenanceVehicles = vehicles.filter(v => v.status === 'maintenance')

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <WrenchScrewdriverIcon className="h-8 w-8 text-red-600" />
          <h2 className="text-2xl font-medium">Maintenance Management</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Schedule Maintenance</span>
        </button>
      </div>

      {/* Maintenance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-xl font-semibold text-red-600">{overdueVehicles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Due Soon</p>
              <p className="text-xl font-semibold text-yellow-600">{dueSoonVehicles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">In Maintenance</p>
              <p className="text-xl font-semibold text-blue-600">{inMaintenanceVehicles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Up to Date</p>
              <p className="text-xl font-semibold text-green-600">
                {vehicles.length - overdueVehicles.length - dueSoonVehicles.length - inMaintenanceVehicles.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Alerts */}
      {(overdueVehicles.length > 0 || dueSoonVehicles.length > 0) && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-red-200 bg-red-50">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-medium text-red-900">Maintenance Alerts</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {overdueVehicles.map(vehicle => (
                <div key={vehicle.vehicle_id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-red-900">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-sm text-red-700">Code: {vehicle.vehicle_code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-900">
                      {getDaysOverdue(vehicle.last_maintenance_date)} days overdue
                    </p>
                    <button 
                      onClick={() => handleScheduleForVehicle(vehicle)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Schedule Now
                    </button>
                  </div>
                </div>
              ))}
              {dueSoonVehicles.map(vehicle => (
                <div key={vehicle.vehicle_id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <ClockIcon className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-sm text-yellow-700">Code: {vehicle.vehicle_code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-900">
                      Due in {180 - getDaysOverdue(vehicle.last_maintenance_date)} days
                    </p>
                    <button 
                      onClick={() => handleScheduleForVehicle(vehicle)}
                      className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Maintenance Records */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Recent Maintenance Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {maintenanceRecords.length > 0 ? (
                maintenanceRecords.slice(0, 10).map(record => (
                  <tr key={record.maintenance_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                          <WrenchScrewdriverIcon className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{record.vehicle_info}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 max-w-xs truncate">{record.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.maintenance_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.cost ? `€${parseFloat(record.cost).toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.performed_by || 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No maintenance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet Maintenance Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Fleet Maintenance Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Mileage</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Maintenance</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Days Since</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.map(vehicle => {
                const status = getMaintenanceStatus(vehicle)
                const daysSince = getDaysOverdue(vehicle.last_maintenance_date)
                return (
                  <tr key={vehicle.vehicle_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <TruckIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{vehicle.brand} {vehicle.model}</p>
                          <p className="text-sm text-gray-500">{vehicle.vehicle_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span className="ml-1">{status}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.mileage?.toLocaleString() || 'N/A'} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.last_maintenance_date 
                        ? new Date(vehicle.last_maintenance_date).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {daysSince} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {vehicle.status !== 'maintenance' ? (
                        <button 
                          onClick={() => handleScheduleForVehicle(vehicle)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Schedule
                        </button>
                      ) : (
                        <button className="text-green-600 hover:text-green-900">
                          Complete
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

      {/* Maintenance Modal */}
      {showAddModal && (
        <MaintenanceModal
          vehicles={vehicles}
          selectedVehicle={selectedVehicle}
          onClose={() => {
            setShowAddModal(false)
            setSelectedVehicle(null)
          }}
          onSave={handleScheduleMaintenance}
        />
      )}
    </div>
  )
}

function MaintenanceModal({ vehicles, selectedVehicle, onClose, onSave }) {
  const [formData, setFormData] = useState({
    vehicle_id: selectedVehicle?.vehicle_id || '',
    description: '',
    maintenance_date: new Date().toISOString().split('T')[0],
    cost: '',
    performed_by: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...formData,
      cost: parseFloat(formData.cost) || 0
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-xl font-medium mb-4">Schedule Maintenance</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                  <option key={v.vehicle_id || v.vehicle_code} value={v.vehicle_id}>
                    {v.brand} {v.model} ({v.vehicle_code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="border p-2 rounded w-full h-20"
                required
                placeholder="Describe the maintenance work needed..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Maintenance Date</label>
              <input
                type="date"
                value={formData.maintenance_date}
                onChange={(e) => setFormData({...formData, maintenance_date: e.target.value})}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Cost (€)</label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
                className="border p-2 rounded w-full"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Performed By</label>
              <input
                type="text"
                value={formData.performed_by}
                onChange={(e) => setFormData({...formData, performed_by: e.target.value})}
                className="border p-2 rounded w-full"
                placeholder="Service provider or technician"
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
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Schedule Maintenance
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}