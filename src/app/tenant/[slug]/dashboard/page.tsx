'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { TenantProvider, FeatureGate, useTenantBranding } from '@/components/tenant/TenantProvider'
import TenantDashboardHeader from '@/components/tenant/TenantDashboardHeader'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import DrillDownChart from '@/components/charts/DrillDownChart'
import KpiCard from '@/components/dashboard/KpiCard'
import CustomizationPanel from '@/components/dashboard/CustomizationPanel'
import UserJourneyFlow from '@/components/analytics/UserJourneyFlow'
import JourneySourceSelector from '@/components/analytics/JourneySourceSelector'
import ActivityFeed from '@/components/collaboration/ActivityFeed'
import AlertPanel from '@/components/alerts/AlertPanel'
import GoogleAnalyticsModal from '@/components/analytics/GoogleAnalyticsModal'
import { getAnalyticsData, fetchAnalyticsData, type AnalyticsData } from '@/lib/analytics-data'
import { getDrillDownData, getAvailableKpiCards } from '@/lib/drill-down-data'

// Inner dashboard component that uses tenant context
function TenantDashboard() {
  const [selectedDateRange, setSelectedDateRange] = useState('30d')
  const [connectedProperty, setConnectedProperty] = useState<string | null>(null)
  const [connectedPropertyId, setConnectedPropertyId] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRealData, setIsRealData] = useState(false)
  const [dataMessage, setDataMessage] = useState<string>('')
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false)
  const [showGAModal, setShowGAModal] = useState(false)
  const [enabledKpiCards, setEnabledKpiCards] = useState<string[]>([
    'total-users', 'sessions', 'page-views', 'avg-session'
  ])
  const [drillDownData, setDrillDownData] = useState(() => getDrillDownData(null))
  const [selectedJourneySource, setSelectedJourneySource] = useState('reddit-ads')

  // Alert system state
  const [showAlertPanel, setShowAlertPanel] = useState(false)

  // Apply tenant branding
  useTenantBranding()

  // Load analytics data using new API integration
  const fetchData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const result = await fetchAnalyticsData(connectedPropertyId, connectedProperty, selectedDateRange)
      setAnalyticsData(result.data)
      setIsRealData(result.isReal)
      setDataMessage(result.message)
      setDrillDownData(getDrillDownData(connectedProperty))
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      // Fallback to mock data
      const data = getAnalyticsData(connectedProperty, selectedDateRange)
      setAnalyticsData(data)
      setIsRealData(false)
      setDataMessage('Using fallback data due to error')
      setDrillDownData(getDrillDownData(connectedProperty))
      setLastUpdated(new Date())
    } finally {
      setIsRefreshing(false)
    }
  }, [connectedProperty, connectedPropertyId, selectedDateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle Google Analytics connection
  const handleGAConnect = (propertyId: string, propertyName: string) => {
    setConnectedPropertyId(propertyId)
    setConnectedProperty(propertyName)
    // Save to sessionStorage so it persists during the browser session
    sessionStorage.setItem('connectedGAProperty', propertyName)
    sessionStorage.setItem('connectedGAPropertyId', propertyId)
    setShowGAModal(false)
  }

  // Load saved connection
  useEffect(() => {
    const savedProperty = sessionStorage.getItem('connectedGAProperty')
    const savedPropertyId = sessionStorage.getItem('connectedGAPropertyId')
    if (savedProperty) {
      setConnectedProperty(savedProperty)
      setConnectedPropertyId(savedPropertyId)
    }
  }, [])

  const handleKpiCardsUpdate = (newCards: string[]) => {
    setEnabledKpiCards(newCards)
  }

  const handleRemoveKpiCard = (cardId: string) => {
    const newCards = enabledKpiCards.filter(id => id !== cardId)
    setEnabledKpiCards(newCards)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Tenant-aware Header */}
      <TenantDashboardHeader
        onShowAlerts={() => setShowAlertPanel(true)}
        onShowCustomization={() => setShowCustomizationPanel(true)}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={setSelectedDateRange}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards - Always shown for basic analytics */}
        <FeatureGate feature="basic-analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {enabledKpiCards.map(cardId => {
              const cardConfig = getAvailableKpiCards().find(card => card.id === cardId)
              if (!cardConfig) return null
              
              return (
                <KpiCard
                  key={cardId}
                  id={cardConfig.id}
                  name={cardConfig.name}
                  icon={cardConfig.icon}
                  color={cardConfig.color as 'blue' | 'green' | 'purple' | 'orange'}
                  analyticsData={analyticsData}
                  onRemove={handleRemoveKpiCard}
                  isCustomizable={true}
                />
              )
            })}
            
            {/* Add Card Button */}
            {enabledKpiCards.length < getAvailableKpiCards().length && (
              <button
                onClick={() => setShowCustomizationPanel(true)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
              >
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">➕</div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Add Card</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {getAvailableKpiCards().length - enabledKpiCards.length} available
                    </p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </FeatureGate>

        {/* Basic Charts - Always shown */}
        <FeatureGate feature="basic-analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Users Over Time Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Users Over Time</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedDateRange === '7d' ? 'Last 7 days' :
                     selectedDateRange === '30d' ? 'Last 30 days' :
                     selectedDateRange === '90d' ? 'Last 90 days' :
                     selectedDateRange === '1y' ? 'Last year' : 'Last 30 days'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Live Data</span>
                </div>
              </div>
              {analyticsData ? (
                <LineChart
                  title="Users"
                  data={analyticsData.users.trend}
                  labels={analyticsData.users.labels}
                  color="rgb(59, 130, 246)"
                  height={280}
                />
              ) : (
                <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Top Pages Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Pages</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Most visited pages</p>
                </div>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  View All
                </button>
              </div>
              {analyticsData ? (
                <BarChart
                  title="Page Views"
                  data={analyticsData.topPages.data}
                  labels={analyticsData.topPages.labels}
                  color="rgb(34, 197, 94)"
                  height={280}
                />
              ) : (
                <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </FeatureGate>

        {/* Traffic Sources and Device Types */}
        <FeatureGate feature="basic-analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Traffic Sources Drill-Down Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Traffic Sources</h3>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  Export
                </button>
              </div>
              {drillDownData ? (
                <DrillDownChart
                  title="Traffic Sources"
                  data={drillDownData}
                  height={350}
                />
              ) : (
                <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading drill-down data...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Device Types Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Device Types</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Visitor device breakdown</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {analyticsData?.realTimeUsers || 0} online
                  </span>
                </div>
              </div>
              {analyticsData ? (
                <PieChart
                  title="Device Types"
                  data={analyticsData.deviceTypes.data}
                  labels={analyticsData.deviceTypes.labels}
                  colors={['rgb(34, 197, 94)', 'rgb(59, 130, 246)', 'rgb(251, 191, 36)']}
                  height={280}
                />
              ) : (
                <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </FeatureGate>

        {/* Advanced Features - Gated by subscription plan */}
        <FeatureGate 
          feature="advanced-segmentation"
          upgradeMessage="User journey analysis requires a Professional plan or higher."
        >
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    User Journey & Conversion Funnel
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Track user flow from traffic source to event registration with drop-off analysis
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <JourneySourceSelector
                    propertyName={connectedProperty}
                    selectedSource={selectedJourneySource}
                    onSourceChange={setSelectedJourneySource}
                    className="min-w-[200px]"
                  />
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    Export Flow
                  </button>
                </div>
              </div>
              
              <UserJourneyFlow
                propertyName={connectedProperty}
                selectedSource={selectedJourneySource}
              />
            </div>
          </div>
        </FeatureGate>

        {/* Google Analytics Connection Status Banner */}
        <div className="mb-8">
          {!connectedProperty ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-blue-500 text-lg">📊</span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Demo Mode:</strong> {dataMessage || 'This dashboard shows sample data.'} 
                    Connect your Google Analytics account to view real data from your properties.
                  </p>
                </div>
                <div className="ml-auto">
                  <button 
                    onClick={() => setShowGAModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Connect Google Analytics
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className={`text-lg ${isRealData ? '✅' : '📊'}`}></span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>{isRealData ? 'Connected:' : 'Demo Mode:'}</strong> {dataMessage || `Showing ${isRealData ? 'real' : 'sample'} data from ${connectedProperty}`}
                  </p>
                  {connectedPropertyId && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Property ID: {connectedPropertyId}
                    </p>
                  )}
                </div>
                <div className="ml-auto">
                  <button 
                    onClick={() => setShowGAModal(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Change Property
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Google Analytics Modal */}
      <GoogleAnalyticsModal
        isOpen={showGAModal}
        onClose={() => setShowGAModal(false)}
        onConnect={handleGAConnect}
        currentProperty={connectedProperty || undefined}
      />

      {/* Customization Panel */}
      <CustomizationPanel
        enabledCards={enabledKpiCards}
        onUpdateCards={handleKpiCardsUpdate}
        isOpen={showCustomizationPanel}
        onClose={() => setShowCustomizationPanel(false)}
      />

      {/* Alert Panel - Feature Gated */}
      <FeatureGate feature="alerts">
        <AlertPanel
          isOpen={showAlertPanel}
          onClose={() => setShowAlertPanel(false)}
          analyticsData={analyticsData}
        />
      </FeatureGate>

      {/* Activity Feed for Collaboration - Feature Gated */}
      <FeatureGate feature="collaboration">
        <ActivityFeed />
      </FeatureGate>
    </div>
  )
}

// Main page component with tenant provider
export default function TenantDashboardPage() {
  const params = useParams()
  const tenantSlug = params.slug as string

  return (
    <TenantProvider tenantSlug={tenantSlug}>
      <TenantDashboard />
    </TenantProvider>
  )
}