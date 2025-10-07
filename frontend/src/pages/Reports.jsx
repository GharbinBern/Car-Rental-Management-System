import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { formatEuro } from '../utils/currency'
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  TruckIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

export default function Reports() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [revenueData, setRevenueData] = useState(null)
  const [fleetData, setFleetData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  useEffect(() => {
    // Temporarily fetch data without authentication check for testing
    fetchAllData()
  }, [selectedPeriod])

  const fetchAllData = async () => {
    try {
      const [analyticsRes, revenueRes, fleetRes] = await Promise.all([
        apiService.getDashboardAnalytics(),
        apiService.getRevenueAnalytics(selectedPeriod),
        apiService.getFleetStatus()
      ])
      
      setAnalytics(analyticsRes.data)
      setRevenueData(revenueRes.data)
      setFleetData(fleetRes.data)
    } catch (err) {
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (type) => {
    // Export as CSV for business use
    let csvContent = ''
    let filename = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`
    
    if (type === 'revenue' && revenueData?.data) {
      csvContent = [
        'Period,Revenue (€),Rental Count',
        ...revenueData.data.map(item => `${item.period || 'Unknown'},${item.revenue || 0},${item.rental_count || 0}`)
      ].join('\n')
    } else if (type === 'fleet' && fleetData) {
      csvContent = [
        'Branch,Total Vehicles,Available,Rented,In Maintenance',
        ...fleetData.fleet_by_branch.map(branch => 
          `${branch.branch_code || 'Unknown'},${branch.total_vehicles || 0},${branch.available || 0},${branch.rented || 0},${branch.in_maintenance || 0}`
        )
      ].join('\n')
    } else if (type === 'customer' && analytics) {
      csvContent = [
        'Metric,Value',
        `Active Customers (Month),${analytics.customer_insights?.active_customers_month || 0}`,
        `Total Revenue,€${revenueData?.data?.reduce((sum, item) => sum + (item.revenue || 0), 0).toFixed(2) || '0.00'}`,
        `Total Rentals,${revenueData?.data?.reduce((sum, item) => sum + (item.rental_count || 0), 0) || 0}`
      ].join('\n')
    } else {
      // Comprehensive report
      csvContent = [
        'Report Type,Car Rental Management System',
        `Generated,${new Date().toLocaleDateString()}`,
        '',
        'REVENUE SUMMARY',
        'Period,Revenue (€),Rental Count',
        ...(revenueData?.data?.map(item => `${item.period || 'Unknown'},${item.revenue || 0},${item.rental_count || 0}`) || []),
        '',
        'FLEET SUMMARY',
        'Branch,Total Vehicles,Available,Rented,In Maintenance',
        ...(fleetData?.fleet_by_branch?.map(branch => 
          `${branch.branch_code || 'Unknown'},${branch.total_vehicles || 0},${branch.available || 0},${branch.rented || 0},${branch.in_maintenance || 0}`
        ) || [])
      ].join('\n')
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (authLoading || loading) return (
    <div className="p-4 text-center">
      <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">Loading reports...</p>
    </div>
  )

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="h-8 w-8 text-purple-600" />
          <h2 className="text-2xl font-medium">Business Reports</h2>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
          <button
            onClick={() => exportReport('comprehensive')}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center space-x-2 transition-colors"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Revenue</p>
              <p className="text-2xl font-bold">
                {formatEuro(revenueData?.data ? 
                  revenueData.data.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0) 
                  : 0)}
              </p>
            </div>
            <CurrencyEuroIcon className="h-12 w-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Fleet Utilization</p>
              <p className="text-2xl font-bold">
                {fleetData?.fleet_overview?.total_vehicles > 0 ? 
                  Math.round((fleetData.fleet_overview.rented / fleetData.fleet_overview.total_vehicles) * 100) : 0}%
              </p>
            </div>
            <TruckIcon className="h-12 w-12 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Active Customers</p>
              <p className="text-2xl font-bold">
                {analytics?.customer_insights?.active_customers_month || 0}
              </p>
            </div>
            <UserGroupIcon className="h-12 w-12 text-orange-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Rentals</p>
              <p className="text-2xl font-bold">
                {revenueData?.data?.reduce((sum, item) => sum + (item.rental_count || 0), 0) || 0}
              </p>
            </div>
            <ClipboardDocumentListIcon className="h-12 w-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Revenue Trend</h3>
          <div className="space-y-4">
            {revenueData?.data && revenueData.data.length > 0 ? (
              revenueData.data.slice(0, 10).map((item, index) => {
                const maxRevenue = Math.max(...revenueData.data.map(d => d.revenue || 0));
                const percentage = maxRevenue > 0 ? Math.min((item.revenue / maxRevenue) * 100, 100) : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.period || 'Unknown'}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-20 text-right">{formatEuro(item.revenue || 0)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No revenue data available</p>
            )}
          </div>
        </div>

        {/* Fleet Utilization by Branch */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Fleet by Branch</h3>
          <div className="space-y-4">
            {fleetData?.fleet_by_branch && fleetData.fleet_by_branch.length > 0 ? (
              fleetData.fleet_by_branch.map((branch, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{branch.branch_code || 'Unknown Branch'}</span>
                    <span className="text-sm text-gray-600">{branch.total_vehicles || 0} vehicles</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-green-600">Available: {branch.available || 0}</div>
                    <div className="text-orange-600">Rented: {branch.rented || 0}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No fleet data available</p>
            )}
          </div>
        </div>

        {/* Popular Vehicles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Most Popular Vehicles</h3>
          <div className="space-y-3">
            {analytics?.popular_vehicles?.slice(0, 5).map((vehicle, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{vehicle.brand} {vehicle.model}</p>
                    <p className="text-xs text-gray-500">{vehicle.vehicle_type}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-600">{vehicle.rental_count} rentals</span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Alerts Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Maintenance Overview</h3>
          <div className="space-y-4">
            {analytics?.maintenance_alerts?.slice(0, 5).map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-red-900">{alert.brand} {alert.model}</p>
                  <p className="text-xs text-red-700">Code: {alert.vehicle_code}</p>
                </div>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  {alert.days_since_maintenance} days
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Export Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => exportReport('revenue')}
            className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <CurrencyEuroIcon className="h-5 w-5 text-gray-400" />
            <span>Revenue Report</span>
          </button>
          
          <button
            onClick={() => exportReport('fleet')}
            className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <TruckIcon className="h-5 w-5 text-gray-400" />
            <span>Fleet Report</span>
          </button>
          
          <button
            onClick={() => exportReport('customer')}
            className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <UserGroupIcon className="h-5 w-5 text-gray-400" />
            <span>Customer Report</span>
          </button>
        </div>
      </div>
    </div>
  )
}