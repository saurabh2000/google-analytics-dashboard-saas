'use client'

import { useParams } from 'next/navigation'
import { TenantProvider, FeatureGate } from '@/components/tenant/TenantProvider'
import TenantDashboardHeader from '@/components/tenant/TenantDashboardHeader'
import { useState, useEffect } from 'react'
import { segments } from '@/lib/segments'

// Inner segments component that uses tenant context
function TenantSegments() {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [segmentData, setSegmentData] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    // Load segment data with analytics
    const processedSegments = segments.map(segment => ({
      ...segment,
      conversionRate: (segment.conversions / segment.users * 100).toFixed(2),
      avgSessionDuration: Math.floor(segment.avgSessionDuration / 60) + 'm ' + (segment.avgSessionDuration % 60) + 's',
      bounceRate: (segment.bounceRate * 100).toFixed(1) + '%'
    }))
    setSegmentData(processedSegments)
  }, [])

  const getSegmentTypeColor = (type: string) => {
    switch (type) {
      case 'behavioral':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
      case 'demographic':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
      case 'geographic':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
      case 'technographic':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
    }
  }

  const getPerformanceColor = (value: number, metric: 'conversion' | 'bounce' | 'session') => {
    if (metric === 'conversion') {
      return value > 5 ? 'text-green-600 dark:text-green-400' : 
             value > 2 ? 'text-yellow-600 dark:text-yellow-400' : 
             'text-red-600 dark:text-red-400'
    }
    if (metric === 'bounce') {
      return value < 40 ? 'text-green-600 dark:text-green-400' : 
             value < 60 ? 'text-yellow-600 dark:text-yellow-400' : 
             'text-red-600 dark:text-red-400'
    }
    return 'text-gray-900 dark:text-white'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <TenantDashboardHeader
        onShowAlerts={() => {}}
        onShowCustomization={() => {}}
        selectedDateRange="30d"
        onDateRangeChange={() => {}}
        isRefreshing={false}
        lastUpdated={new Date()}
      />

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Segments</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Analyze user behavior patterns and create targeted segments
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Create Segment</span>
            </button>
          </div>

          {/* Segment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Segments</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {segmentData?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {segmentData?.reduce((sum: number, segment: any) => sum + segment.users, 0).toLocaleString() || '0'} {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Conversion</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {segmentData?.length > 0 
                      ? (segmentData.reduce((sum: number, segment: any) => sum + parseFloat(segment.conversionRate), 0) / segmentData.length).toFixed(1) + '%' /* eslint-disable-line @typescript-eslint/no-explicit-any */
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Best Performer</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {segmentData?.length > 0 
                      ? Math.max(...segmentData.map((s: any) => parseFloat(s.conversionRate))).toFixed(1) + '%' /* eslint-disable-line @typescript-eslint/no-explicit-any */
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Segments Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Segment Performance</h2>
              <div className="flex items-center space-x-4">
                <select className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm">
                  <option>All Types</option>
                  <option>Behavioral</option>
                  <option>Demographic</option>
                  <option>Geographic</option>
                  <option>Technographic</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Segment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Avg Session
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bounce Rate
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {segmentData?.map((segment: any) => ( /* eslint-disable-line @typescript-eslint/no-explicit-any */
                    <tr key={segment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {segment.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSegmentTypeColor(segment.type)}`}>
                          {segment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                        {segment.users.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`text-sm font-medium ${getPerformanceColor(parseFloat(segment.conversionRate), 'conversion')}`}>
                          {segment.conversionRate}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                        {segment.avgSessionDuration}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`text-sm ${getPerformanceColor(parseFloat(segment.bounceRate), 'bounce')}`}>
                          {segment.bounceRate}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedSegment(segment.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          Analyze
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Segment Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Performing Segments */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Top Performing Segments
              </h3>
              <div className="space-y-4">
                {segmentData?.slice()
                  .sort((a: any, b: any) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate)) /* eslint-disable-line @typescript-eslint/no-explicit-any */
                  .slice(0, 5)
                  .map((segment: any, index: number) => ( /* eslint-disable-line @typescript-eslint/no-explicit-any */
                    <div key={segment.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {segment.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {segment.users.toLocaleString()} users
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                          {segment.conversionRate}%
                        </div>
                        <div className="text-xs text-gray-500">conversion</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Segment Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Optimization Recommendations
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center">
                    <span className="text-green-500 text-xl mr-3">🚀</span>
                    <div>
                      <div className="text-sm font-medium text-green-800 dark:text-green-300">
                        High-Value Opportunity
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Mobile users have 40% higher conversion potential
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center">
                    <span className="text-blue-500 text-xl mr-3">🎯</span>
                    <div>
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Targeting Suggestion
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Create campaigns for "Returning Visitors" segment
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-xl mr-3">⚠️</span>
                    <div>
                      <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        Attention Needed
                      </div>
                      <div className="text-xs text-yellow-600 dark:text-yellow-400">
                        Desktop users showing declining engagement
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center">
                    <span className="text-purple-500 text-xl mr-3">✨</span>
                    <div>
                      <div className="text-sm font-medium text-purple-800 dark:text-purple-300">
                        New Segment Idea
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        Consider creating "Weekend Browsers" segment
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Segment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create New Segment
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Segment Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., High-Value Mobile Users"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Segment Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>Behavioral</option>
                    <option>Demographic</option>
                    <option>Geographic</option>
                    <option>Technographic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Conditions
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <select className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>Device Type</option>
                        <option>Location</option>
                        <option>Page Views</option>
                        <option>Session Duration</option>
                        <option>Traffic Source</option>
                      </select>
                      <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>equals</option>
                        <option>contains</option>
                        <option>greater than</option>
                        <option>less than</option>
                      </select>
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Value"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Condition
                  </button>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Create Segment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main page component with tenant provider
export default function TenantSegmentsPage() {
  const params = useParams()
  const tenantSlug = params.slug as string

  return (
    <TenantProvider tenantSlug={tenantSlug}>
      <FeatureGate 
        feature="segments" 
        upgradeMessage="Advanced segmentation requires a Professional plan or higher."
      >
        <TenantSegments />
      </FeatureGate>
    </TenantProvider>
  )
}