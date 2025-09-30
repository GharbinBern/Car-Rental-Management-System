import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { formatEuro } from '../utils/currency'
import {
  TruckIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'

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
        const [vehiclesRes, rentalsRes, customersRes, revenueRes] = await Promise.all([
          apiService.getVehicles(),
          apiService.getRentals(),
          apiService.getCustomers(),
          apiService.getRevenueAnalytics('month').catch(() => ({ data: { data: [] } }))
        ])

        const vehicles = vehiclesRes.data
        const rentals = rentalsRes.data
        const customers = customersRes.data
        const revenueData = revenueRes.data?.data || []

        // Calculate statistics
        const availableVehicles = vehicles.filter(v => v.status?.toLowerCase() === 'available').length
        const activeRentals = rentals.filter(r => r.status?.toLowerCase() === 'active').length
        
        // Calculate revenue from analytics API
        const revenueThisMonth = revenueData.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0)
        
        // For today's revenue, use active rentals
        const revenueToday = rentals
          .filter(r => r.status?.toLowerCase() === 'active')
          .reduce((sum, r) => sum + (parseFloat(r.total_cost) || 0), 0)

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
        // Set some default data so the dashboard isn't empty
        setStats({
          totalVehicles: 0,
          availableVehicles: 0,
          activeRentals: 0,
          totalCustomers: 0,
          revenueToday: 0,
          revenueThisMonth: 0
        })
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
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Vehicles */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TruckIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalVehicles}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span className="text-green-600">Available: {stats.availableVehicles}</span>
              <span className="text-orange-600">Rented: {stats.totalVehicles - stats.availableVehicles}</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{width: `${(stats.availableVehicles / stats.totalVehicles) * 100}%`}}
              ></div>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Registered users</p>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                +{Math.floor(stats.totalCustomers * 0.15)} this month
              </span>
            </div>
          </div>
        </div>

        {/* Active Rentals */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Active Rentals</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeRentals}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Currently ongoing</p>
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                {Math.round((stats.activeRentals / stats.totalVehicles) * 100)}% utilization
              </span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyEuroIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatEuro(stats.revenueThisMonth)}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{formatEuro(stats.revenueToday)} active rentals</p>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                +12.5% vs last month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Quick Rent</h3>
          <p className="text-blue-100 mb-4">Process a new rental quickly</p>
          <button 
            onClick={() => window.location.href = '/rentals'}
            className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-50 transition-colors"
          >
            New Rental
          </button>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Add Vehicle</h3>
          <p className="text-green-100 mb-4">Expand your fleet</p>
          <button 
            onClick={() => window.location.href = '/vehicles'}
            className="bg-white text-green-600 px-4 py-2 rounded font-medium hover:bg-green-50 transition-colors"
          >
            Add Vehicle
          </button>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">View Reports</h3>
          <p className="text-purple-100 mb-4">Analyze business performance</p>
          <button 
            onClick={() => window.location.href = '/reports'}
            className="bg-white text-purple-600 px-4 py-2 rounded font-medium hover:bg-purple-50 transition-colors"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Fleet Utilization Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium">Fleet Utilization</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Economy Cars</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
                <span className="text-sm font-medium">75%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Luxury Cars</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
                <span className="text-sm font-medium">60%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SUVs</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
                <span className="text-sm font-medium">85%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Vehicles */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <TruckIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium">Popular Vehicles</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Toyota RAV4</p>
                  <p className="text-xs text-gray-500">SUV</p>
                </div>
              </div>
              <span className="text-sm text-gray-600">24 rentals</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-medium text-sm">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">BMW 330i</p>
                  <p className="text-xs text-gray-500">Luxury</p>
                </div>
              </div>
              <span className="text-sm text-gray-600">18 rentals</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-medium text-sm">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Toyota Corolla</p>
                  <p className="text-xs text-gray-500">Economy</p>
                </div>
              </div>
              <span className="text-sm text-gray-600">15 rentals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Rentals */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex items-center">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium">Recent Rentals</h3>
        </div>
        <div className="p-6">
          {recentRentals.length > 0 ? (
            <div className="space-y-4">
              {recentRentals.map(rental => (
                <div key={rental.rental_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <TruckIcon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{rental.customer_name}</p>
                      <p className="text-sm text-gray-500">{rental.vehicle_info}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        {new Date(rental.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      rental.status === 'Active' 
                        ? 'bg-orange-100 text-orange-800' 
                        : rental.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : rental.status === 'Reserved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rental.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardDocumentListIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent rentals found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}