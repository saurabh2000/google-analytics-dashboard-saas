'use client'

import { useParams } from 'next/navigation'
import { TenantProvider, FeatureGate } from '@/components/tenant/TenantProvider'
import TenantDashboardHeader from '@/components/tenant/TenantDashboardHeader'
import { useState, useEffect } from 'react'
import { cohorts } from '@/lib/cohorts'

// Inner cohorts component that uses tenant context
function TenantCohorts() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'retention' | 'revenue'>('retention')

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`

  const getCohortColor = (value: number, max: number) => {
    const intensity = value / max
    if (intensity > 0.7) return 'bg-blue-500 text-white'
    if (intensity > 0.5) return 'bg-blue-400 text-white'
    if (intensity > 0.3) return 'bg-blue-300 text-gray-800'
    if (intensity > 0.1) return 'bg-blue-200 text-gray-800'
    return 'bg-blue-100 text-gray-600'
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cohort Analysis</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Track user retention and lifetime value over time
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('retention')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'retention'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Retention
                </button>
                <button
                  onClick={() => setViewMode('revenue')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'revenue'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Revenue
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Day 1 Retention</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatPercentage(0.68)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Day 7 Retention</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatPercentage(0.42)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg LTV</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(247)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Cohorts</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {cohorts.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cohort Analysis Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {viewMode === 'retention' ? 'Retention' : 'Revenue'} Cohort Analysis
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-700">
                      Cohort
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Size
                    </th>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(week => (
                      <th key={week} className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {selectedPeriod === 'weekly' ? `W${week}` : selectedPeriod === 'monthly' ? `M${week}` : `Q${week}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {cohorts.map((cohort) => (
                    <tr key={cohort.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800">
                        <div>
                          <div className="font-medium">{cohort.name}</div>
                          <div className="text-gray-500 text-xs">{cohort.startDate}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">
                        {cohort.size.toLocaleString()}
                      </td>
                      {cohort.retention.map((value, index) => {
                        const maxValue = Math.max(...cohort.retention)
                        const displayValue = viewMode === 'retention' 
                          ? formatPercentage(value) 
                          : formatCurrency(value * 100) // Mock revenue calculation
                        
                        return (
                          <td key={index} className="px-3 py-4 whitespace-nowrap text-center">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getCohortColor(value, maxValue)}`}>
                              {displayValue}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cohort Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Performing Cohorts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Top Performing Cohorts
              </h3>
              <div className="space-y-4">
                {cohorts
                  .sort((a, b) => (b.retention[6] || 0) - (a.retention[6] || 0))
                  .slice(0, 5)
                  .map((cohort, index) => (
                    <div key={cohort.id} className="flex items-center justify-between">
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
                            {cohort.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {cohort.size.toLocaleString()} users
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatPercentage(cohort.retention[6] || 0)}
                        </div>
                        <div className="text-xs text-gray-500">6-period retention</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Retention Trends */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Retention Insights
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center">
                    <span className="text-green-500 text-xl mr-3">📈</span>
                    <div>
                      <div className="text-sm font-medium text-green-800 dark:text-green-300">
                        Improving Retention
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Recent cohorts show 15% better 30-day retention
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center">
                    <span className="text-blue-500 text-xl mr-3">💡</span>
                    <div>
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Key Drop-off Point
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Largest retention drop occurs between day 3-7
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center">
                    <span className="text-purple-500 text-xl mr-3">🎯</span>
                    <div>
                      <div className="text-sm font-medium text-purple-800 dark:text-purple-300">
                        Seasonal Pattern
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        Q4 cohorts consistently outperform others
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center">
                    <span className="text-orange-500 text-xl mr-3">⚡</span>
                    <div>
                      <div className="text-sm font-medium text-orange-800 dark:text-orange-300">
                        Quick Wins
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        Focus on day 1-3 onboarding improvements
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Main page component with tenant provider
export default function TenantCohortsPage() {
  const params = useParams()
  const tenantSlug = params.slug as string

  return (
    <TenantProvider tenantSlug={tenantSlug}>
      <FeatureGate 
        feature="cohorts" 
        upgradeMessage="Cohort analysis requires a Professional plan or higher."
      >
        <TenantCohorts />
      </FeatureGate>
    </TenantProvider>
  )
}