import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    activeRentals: 0,
    totalCustomers: 0,
    revenueToday: 0,
    revenueThisMonth: 0
  })
  const [recentRentals, setRecentRentals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [vehiclesRes, rentalsRes, customersRes] = await Promise.all([
          axios.get('http://localhost:8000/api/vehicles/'),
          axios.get('http://localhost:8000/api/rentals/'),
          axios.get('http://localhost:8000/api/customers/')
        ])

        const vehicles = vehiclesRes.data
        const rentals = rentalsRes.data
        const customers = customersRes.data

        // Calculate statistics
        const availableVehicles = vehicles.filter(v => v.status === 'available').length
        const activeRentals = rentals.filter(r => r.status === 'ongoing').length
        
        // Calculate revenue
        const today = new Date().toISOString().split('T')[0]
        const thisMonth = today.substring(0, 7)
        
        const revenueToday = rentals
          .filter(r => r.end_date === today)
          .reduce((sum, r) => sum + (r.total_cost || 0), 0)
        
        const revenueThisMonth = rentals
          .filter(r => r.end_date?.startsWith(thisMonth))
          .reduce((sum, r) => sum + (r.total_cost || 0), 0)

        setStats({
          totalVehicles: vehicles.length,
          availableVehicles,
          activeRentals,
          totalCustomers: customers.length,
          revenueToday,
          revenueThisMonth
        })

        // Get recent rentals
        setRecentRentals(
          rentals
            .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
            .slice(0, 5)
        )

      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) return <div className="p-4">Loading dashboard...</div>

  return (
    <div className="p-4">
      <h2 className="text-2xl font-medium mb-6">Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Vehicles</h3>
          <div className="mt-2 flex justify-between items-end">
            <p className="text-3xl font-semibold">{stats.totalVehicles}</p>
            <p className="text-sm text-green-600">
              {stats.availableVehicles} available
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Active Rentals</h3>
          <div className="mt-2 flex justify-between items-end">
            <p className="text-3xl font-semibold">{stats.activeRentals}</p>
            <p className="text-sm text-blue-600">
              {stats.totalCustomers} total customers
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Revenue</h3>
          <div className="mt-2 flex justify-between items-end">
            <p className="text-3xl font-semibold">€{stats.revenueToday}</p>
            <p className="text-sm text-gray-600">
              €{stats.revenueThisMonth} this month
            </p>
          </div>
        </div>
      </div>

      {/* Recent Rentals */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Recent Rentals</h3>
        </div>
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm">
                <th className="pb-3">Customer</th>
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Start Date</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRentals.map(rental => (
                <tr key={rental.rental_id} className="border-t">
                  <td className="py-3">{rental.customer_name}</td>
                  <td className="py-3">{rental.vehicle_info}</td>
                  <td className="py-3">
                    {new Date(rental.start_date).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      rental.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {rental.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}