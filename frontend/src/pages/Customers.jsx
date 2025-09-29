import React, { useEffect, useState } from 'react'
import { apiService } from '../services/api'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchCustomers = () => {
    setLoading(true)
    apiService.getCustomers()
      .then(res => setCustomers(res.data))
      .catch(err => { console.error(err); setCustomers([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleAddCustomer = async (customerData) => {
    try {
      await apiService.addCustomer(customerData)
      fetchCustomers()
      setShowAddModal(false)
    } catch (err) {
      console.error('Error adding customer:', err)
      alert('Failed to add customer')
    }
  }

  const handleUpdateCustomer = async (customerId, updates) => {
    try {
      await apiService.updateCustomer(customerId, updates)
      fetchCustomers()
      setEditingCustomer(null)
    } catch (err) {
      console.error('Error updating customer:', err)
      alert('Failed to update customer')
    }
  }

  const filteredCustomers = customers.filter(c => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  )

  if (loading) return <div className="p-4">Loading customers...</div>

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium">Customers</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Customer
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-64"
        />
      </div>

      <div className="bg-white shadow rounded">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">License Number</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.customer_id} className="border-t">
                <td className="p-3">{`${customer.first_name} ${customer.last_name}`}</td>
                <td className="p-3">{customer.email}</td>
                <td className="p-3">{customer.phone}</td>
                <td className="p-3">{customer.license_number}</td>
                <td className="p-3">
                  <button
                    onClick={() => setEditingCustomer(customer)}
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

      {/* Add Customer Modal */}
      {showAddModal && (
        <CustomerModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCustomer}
        />
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={(updates) => handleUpdateCustomer(editingCustomer.customer_id, updates)}
        />
      )}
    </div>
  )
}

function CustomerModal({ customer, onClose, onSave }) {
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    license_number: customer?.license_number || '',
    country_of_residence: customer?.country_of_residence || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-xl font-medium mb-4">
          {customer ? 'Edit Customer' : 'Add New Customer'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License Number</label>
              <input
                type="text"
                value={formData.license_number}
                onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                type="text"
                value={formData.country_of_residence}
                onChange={(e) => setFormData({...formData, country_of_residence: e.target.value})}
                className="border p-2 rounded w-full"
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
              {customer ? 'Update' : 'Add'} Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}