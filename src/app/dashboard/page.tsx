'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
// import GAConnectionModal from '@/components/analytics/GAConnectionModal' // TODO: Use GA connection modal
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import DrillDownChart from '@/components/charts/DrillDownChart'
import KpiCard from '@/components/dashboard/KpiCard'
import CustomizationPanel from '@/components/dashboard/CustomizationPanel'
import UserJourneyFlow from '@/components/analytics/UserJourneyFlow'
import JourneySourceSelector from '@/components/analytics/JourneySourceSelector'
import GoogleAnalyticsModal from '@/components/analytics/GoogleAnalyticsModal'
import { getAnalyticsData, fetchAnalyticsData, type AnalyticsData } from '@/lib/analytics-data'
import { getDrillDownData, getAvailableKpiCards } from '@/lib/drill-down-data'
import collaborationManager, { type DashboardState } from '@/lib/socket'

export default function Dashboard() {
  const router = useRouter()
  const [selectedDateRange, setSelectedDateRange] = useState('30d')
  const { data: session } = useSession()

  // Personal dashboard for regular users
  const [showGAModal, setShowGAModal] = useState(false)
  const [isRealData, setIsRealData] = useState(false)
  const [connectedProperty, setConnectedProperty] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false)
  const [enabledKpiCards, setEnabledKpiCards] = useState<string[]>([
    'total-users', 'sessions', 'page-views', 'avg-session'
  ])
  const [drillDownData, setDrillDownData] = useState(() => getDrillDownData(null))
  const [selectedJourneySource, setSelectedJourneySource] = useState('reddit-ads')
  const [collaborationConnected, setCollaborationConnected] = useState(false)

  // Load saved connection and analytics data
  useEffect(() => {
    const savedProperty = sessionStorage.getItem('connectedGAProperty')
    if (savedProperty) {
      setConnectedProperty(savedProperty)
    }
  }, [])

  // Update analytics data when property changes or date range changes
  useEffect(() => {
    const fetchData = () => {
      setIsRefreshing(() => true)
      // Simulate API call delay
      setTimeout(() => {
        const data = getAnalyticsData(connectedProperty, selectedDateRange)
        setAnalyticsData(() => data)
        setDrillDownData(() => getDrillDownData(connectedProperty))
        setLastUpdated(() => new Date())
        setIsRefreshing(() => false)
      }, 300)
    }

    fetchData()
  }, [connectedProperty, selectedDateRange])

  // Real-time data refresh every 30 seconds
  useEffect(() => {
    if (!connectedProperty) return

    const interval = setInterval(() => {
      setAnalyticsData(prevData => {
        if (!prevData) return prevData
        
        // Update real-time users with some variation
        const baseUsers = connectedProperty === 'E-commerce Site' ? 147 : 
                          connectedProperty === 'My Website' ? 23 : 8
        const variation = Math.floor(Math.random() * 10) - 5 // -5 to +5
        const newRealTimeUsers = Math.max(1, baseUsers + variation)
        
        return {
          ...prevData,
          realTimeUsers: newRealTimeUsers
        }
      })
      setLastUpdated(() => new Date()) // Use functional update
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [connectedProperty])

  // Initialize collaboration when user is authenticated
  useEffect(() => {
    if (session?.user) {
      const sessionWithId = session as any // eslint-disable-line @typescript-eslint/no-explicit-any
      const dashboardId = `dashboard-${sessionWithId.user.id || 'anonymous'}`
      
      collaborationManager.connect({
        id: sessionWithId.user.id || Date.now().toString(),
        name: session.user.name || 'Anonymous User',
        email: session.user.email || 'anonymous@example.com',
        avatar: session.user.image || undefined
      }, dashboardId)

      setCollaborationConnected(true)

      // Subscribe to remote state updates
      const unsubscribeState = collaborationManager.onStateUpdated((newState: DashboardState) => {
        // Update local state to match remote changes with functional updates to prevent dependency loops
        if (newState.selectedDateRange !== undefined) {
          setSelectedDateRange(current => current !== newState.selectedDateRange ? newState.selectedDateRange : current)
        }
        if (newState.enabledKpiCards !== undefined) {
          setEnabledKpiCards(current => JSON.stringify(current) !== JSON.stringify(newState.enabledKpiCards) ? newState.enabledKpiCards : current)
        }
        if (newState.selectedJourneySource !== undefined) {
          setSelectedJourneySource(current => current !== newState.selectedJourneySource ? newState.selectedJourneySource : current)
        }
        if (newState.connectedProperty !== undefined) {
          setConnectedProperty(current => current !== newState.connectedProperty ? newState.connectedProperty : current)
        }
      })

      return () => {
        unsubscribeState()
        collaborationManager.disconnect()
        setCollaborationConnected(false)
      }
    }
  }, [session?.user?.id])

  // Broadcast state changes to other users
  const broadcastStateChange = (changes: Partial<DashboardState>) => {
    if (collaborationConnected) {
      collaborationManager.updateDashboardState(changes)
    }
  }

  const handleGAConnect = (propertyId: string, propertyName: string) => {
    setConnectedProperty(propertyName)
    // Save to sessionStorage so it persists during the browser session
    sessionStorage.setItem('connectedGAProperty', propertyName)
    // Broadcast change to other users
    broadcastStateChange({ connectedProperty: propertyName })
    console.log('Connected to GA property:', propertyId, propertyName)
  }

  const handleDateRangeChange = (newRange: string) => {
    setSelectedDateRange(newRange)
    broadcastStateChange({ selectedDateRange: newRange })
  }

  const handleJourneySourceChange = (source: string) => {
    setSelectedJourneySource(source)
    broadcastStateChange({ selectedJourneySource: source })
  }

  const handleKpiCardsUpdate = (newCards: string[]) => {
    setEnabledKpiCards(newCards)
    broadcastStateChange({ enabledKpiCards: newCards })
  }

  // const handleAddKpiCard = (cardId: string) => {
  //   const newCards = [...enabledKpiCards, cardId]
  //   setEnabledKpiCards(newCards)
  //   collaborationManager.addKpiCard(cardId)
  //   broadcastStateChange({ enabledKpiCards: newCards })
  // }

  const handleRemoveKpiCard = (cardId: string) => {
    const newCards = enabledKpiCards.filter(id => id !== cardId)
    setEnabledKpiCards(newCards)
    collaborationManager.removeKpiCard(cardId)
    broadcastStateChange({ enabledKpiCards: newCards })
  }

  const openModal = () => {
    setShowGAModal(true)
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Personal Analytics
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back, {session?.user?.name || 'User'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <Link href="/pricing" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Upgrade Plan
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Profile
                </Link>
              </div>
              
              {/* Customize Button */}
              <button
                onClick={() => setShowCustomizationPanel(true)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors"
              >
                <span>⚙️</span>
                <span>Customize</span>
              </button>
              
              {/* Refresh Indicator */}
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                <span>
                  Updated {lastUpdated.toLocaleTimeString('en-US', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  })}
                </span>
              </div>
              
              {/* Date Range Picker */}
              <select 
                value={selectedDateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                disabled={isRefreshing}
                data-tutorial="date-range"
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              {/* User Avatar */}
              <div className="flex items-center space-x-2">
                {session?.user ? (
                  <>
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {session.user.name || session.user.email}
                      </span>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">?</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Demo User</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Customizable KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-tutorial="kpi-cards">
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

        {/* Chart Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8" data-tutorial="charts">
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

        {/* Traffic Sources and Device Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        {/* User Journey Flow Analysis */}
        <div className="mb-8" data-tutorial="user-journey">
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
                  onSourceChange={handleJourneySourceChange}
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

        {/* Upgrade Prompt for Personal Users */}
        {session?.user && !(session.user as any).tenantId && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Ready to grow your team?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Upgrade to a team plan for collaboration, A/B testing, and advanced analytics features.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Link 
                    href="/pricing"
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                  >
                    View Plans
                  </Link>
                  <Link 
                    href="/auth/register?plan=startup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Start Team Trial
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GA Connection Banner */}
        {!connectedProperty ? (
          <div className="mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-blue-400 text-lg">ℹ️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Demo Mode:</strong> This dashboard shows sample data. 
                  Connect your Google Analytics account to view real data from your properties.
                </p>
              </div>
              <div className="ml-auto">
                <button 
                  onClick={openModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  Connect Google Analytics
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-green-400 text-lg">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Connected:</strong> Showing real data from {connectedProperty}
                </p>
              </div>
              <div className="ml-auto">
                <button 
                  onClick={() => setShowGAModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  Change Property
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Simple Modal Test */}
      {showGAModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Connect Google Analytics
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Select a Google Analytics property to connect:
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  <label className="flex items-center">
                    <input type="radio" name="property" className="mr-3" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">My Website</div>
                      <div className="text-sm text-gray-500">properties/123456789</div>
                    </div>
                  </label>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  <label className="flex items-center">
                    <input type="radio" name="property" className="mr-3" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">E-commerce Site</div>
                      <div className="text-sm text-gray-500">properties/987654321</div>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    handleGAConnect('123456789', 'My Website')
                    setShowGAModal(false)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Connect
                </button>
                <button
                  onClick={() => setShowGAModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customization Panel */}
      <CustomizationPanel
        enabledCards={enabledKpiCards}
        onUpdateCards={handleKpiCardsUpdate}
        isOpen={showCustomizationPanel}
        onClose={() => setShowCustomizationPanel(false)}
      />
    </div>
  )
}