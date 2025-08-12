'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Database,
  Users,
  Eye,
  FileText,
  Code,
  HardDrive
} from 'lucide-react'

interface UsageMetrics {
  currentPeriod: string
  metrics: {
    apiCalls: number
    dataProcessed: number
    storageUsed: number
    userSessions: number
    dashboardViews: number
    reportGenerations: number
    customQueries: number
  }
  limits: {
    maxApiCalls: number
    maxDataProcessed: number
    maxStorage: number
    maxUsers: number
    maxDashboards: number
  }
  overages: {
    apiCalls: number
    dataProcessed: number
    storage: number
  }
  costs: {
    baseCost: number
    overageCost: number
    totalCost: number
  }
  utilization: {
    apiCalls: string
    dataProcessed: string
    storage: string
    users: string
    dashboards: string
  }
  alerts?: Array<{
    type: string
    metric: string
    current: number
    limit: number
    percentage: string
  }>
}

interface UsageHistory {
  period: string
  metrics: any
  costs: any
}

export default function UsageDashboard() {
  const [usageData, setUsageData] = useState<UsageMetrics | null>(null)
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    fetchUsageData()
  }, [])

  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/billing/usage?includeHistory=true&includeAlerts=true')
      if (response.ok) {
        const data = await response.json()
        setUsageData(data)
        setUsageHistory(data.history || [])
        setSelectedPeriod(data.currentPeriod)
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateInvoice = async () => {
    if (!selectedPeriod) return

    try {
      const response = await fetch('/api/billing/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          period: selectedPeriod,
          tenantId: 'default' // In real app, get from context
        })
      })

      if (response.ok) {
        const invoice = await response.json()
        // Handle invoice generation success
        console.log('Invoice generated:', invoice)
        alert('Invoice generated successfully!')
      }
    } catch (error) {
      console.error('Error generating invoice:', error)
      alert('Failed to generate invoice')
    }
  }

  const getUtilizationColor = (percentage: string) => {
    const num = parseFloat(percentage)
    if (num >= 90) return 'text-red-600'
    if (num >= 75) return 'text-yellow-600'
    if (num >= 50) return 'text-blue-600'
    return 'text-green-600'
  }

  const getUtilizationBgColor = (percentage: string) => {
    const num = parseFloat(percentage)
    if (num >= 90) return 'bg-red-100'
    if (num >= 75) return 'bg-yellow-100'
    if (num >= 50) return 'bg-blue-100'
    return 'bg-green-100'
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!usageData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600">No usage data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Usage Dashboard</h2>
          <p className="text-gray-600">
            Monitor your usage and billing for {usageData.currentPeriod}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {usageHistory.map((period) => (
              <option key={period.period} value={period.period}>
                {period.period}
              </option>
            ))}
          </select>
          <button
            onClick={generateInvoice}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Generate Invoice
          </button>
        </div>
      </div>

      {/* Usage Alerts */}
      {usageData.alerts && usageData.alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Usage Alerts</h3>
          </div>
          <div className="space-y-2">
            {usageData.alerts.map((alert, index) => (
              <div key={index} className="text-sm text-yellow-700">
                <strong>{alert.metric}:</strong> {alert.current.toLocaleString()} / {alert.limit.toLocaleString()} ({alert.percentage}%)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* API Calls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationBgColor(usageData.utilization.apiCalls)} ${getUtilizationColor(usageData.utilization.apiCalls)}`}>
              {usageData.utilization.apiCalls}%
            </span>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-gray-900">
              {usageData.metrics.apiCalls.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">API Calls</div>
          </div>
          <div className="text-xs text-gray-500">
            Limit: {usageData.limits.maxApiCalls.toLocaleString()}
          </div>
        </div>

        {/* Data Processed */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationBgColor(usageData.utilization.dataProcessed)} ${getUtilizationColor(usageData.utilization.dataProcessed)}`}>
              {usageData.utilization.dataProcessed}%
            </span>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-gray-900">
              {formatBytes(usageData.metrics.dataProcessed)}
            </div>
            <div className="text-sm text-gray-600">Data Processed</div>
          </div>
          <div className="text-xs text-gray-500">
            Limit: {formatBytes(usageData.limits.maxDataProcessed)}
          </div>
        </div>

        {/* Storage Used */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-purple-600" />
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationBgColor(usageData.utilization.storage)} ${getUtilizationColor(usageData.utilization.storage)}`}>
              {usageData.utilization.storage}%
            </span>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-gray-900">
              {formatBytes(usageData.metrics.storageUsed)}
            </div>
            <div className="text-sm text-gray-600">Storage Used</div>
          </div>
          <div className="text-xs text-gray-500">
            Limit: {formatBytes(usageData.limits.maxStorage)}
          </div>
        </div>

        {/* User Sessions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationBgColor(usageData.utilization.users)} ${getUtilizationColor(usageData.utilization.users)}`}>
              {usageData.utilization.users === 'Unlimited' ? '∞' : usageData.utilization.users + '%'}
            </span>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-gray-900">
              {usageData.metrics.userSessions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">User Sessions</div>
          </div>
          <div className="text-xs text-gray-500">
            Limit: {usageData.limits.maxUsers === -1 ? 'Unlimited' : usageData.limits.maxUsers}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dashboard Views */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Dashboard Views</div>
              <div className="text-sm text-gray-600">
                {usageData.metrics.dashboardViews.toLocaleString()} views
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Limit: {usageData.limits.maxDashboards === -1 ? 'Unlimited' : usageData.limits.maxDashboards}
          </div>
        </div>

        {/* Report Generations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Reports Generated</div>
              <div className="text-sm text-gray-600">
                {usageData.metrics.reportGenerations.toLocaleString()} reports
              </div>
            </div>
          </div>
        </div>

        {/* Custom Queries */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Custom Queries</div>
              <div className="text-sm text-gray-600">
                {usageData.metrics.customQueries.toLocaleString()} queries
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              ${usageData.costs.baseCost.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Base Cost</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              ${usageData.costs.overageCost.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Overage Charges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${usageData.costs.totalCost.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Cost</div>
          </div>
        </div>

        {/* Overage Details */}
        {usageData.overages.apiCalls > 0 || usageData.overages.dataProcessed > 0 || usageData.overages.storage > 0 ? (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Overage Details</h4>
            <div className="space-y-2 text-sm">
              {usageData.overages.apiCalls > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">API Calls Overage:</span>
                  <span className="font-medium">{usageData.overages.apiCalls.toLocaleString()} calls</span>
                </div>
              )}
              {usageData.overages.dataProcessed > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Processing Overage:</span>
                  <span className="font-medium">{formatBytes(usageData.overages.dataProcessed)}</span>
                </div>
              )}
              {usageData.overages.storage > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Storage Overage:</span>
                  <span className="font-medium">{formatBytes(usageData.overages.storage)}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <div className="text-green-600 font-medium">No overages this period</div>
            <div className="text-sm text-gray-600">You're within your plan limits</div>
          </div>
        )}
      </div>

      {/* Usage History Toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          {showHistory ? 'Hide' : 'Show'} Usage History
          {showHistory ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Usage History */}
      {showHistory && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Calls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Processed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Storage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usageHistory.map((period) => (
                  <tr key={period.period}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {period.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {period.metrics.apiCalls.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatBytes(period.metrics.dataProcessed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatBytes(period.metrics.storageUsed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${period.costs.totalCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
