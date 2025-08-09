'use client'

import { useState, useEffect, useRef } from 'react'
import { Users, Eye, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { WidgetErrorBoundary } from '@/components/ui/error-boundary'

interface RealtimeData {
  activeUsers: number
  pageViews: number
  topPages: { page: string; views: number }[]
  topCountries: { country: string; users: number }[]
  trend: 'up' | 'down' | 'stable'
  change: number
}

interface RealtimeCounterProps {
  title: string
  endpoint?: string
  updateInterval?: number
  showTrend?: boolean
  showTopPages?: boolean
  className?: string
}

function CounterCard({ 
  icon: Icon, 
  title, 
  value, 
  change, 
  trend,
  showTrend = true 
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  showTrend?: boolean
}) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
      <div className="flex items-center">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center mt-1">
            <p className="text-2xl font-bold text-gray-900">
              {value.toLocaleString()}
            </p>
            {showTrend && change !== undefined && (
              <div className={`ml-2 flex items-center ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : trend === 'down' ? (
                  <TrendingDown className="h-4 w-4 mr-1" />
                ) : (
                  <Activity className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function RealtimeCounterWidget({ 
  title, 
  endpoint,
  updateInterval = 5000,
  showTrend = true,
  showTopPages = true,
  className = ''
}: RealtimeCounterProps) {
  const [data, setData] = useState<RealtimeData>({
    activeUsers: 0,
    pageViews: 0,
    topPages: [],
    topCountries: [],
    trend: 'stable',
    change: 0
  })
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousData = useRef<RealtimeData | null>(null)

  // Generate realistic demo data
  const generateDemoData = (): RealtimeData => {
    const baseUsers = 147
    const variation = Math.floor(Math.random() * 20) - 10
    const activeUsers = Math.max(1, baseUsers + variation)
    
    const basePageViews = 892
    const pageViewsVariation = Math.floor(Math.random() * 100) - 50
    const pageViews = Math.max(1, basePageViews + pageViewsVariation)

    // Calculate trend based on previous data
    let trend: 'up' | 'down' | 'stable' = 'stable'
    let change = 0
    
    if (previousData.current) {
      const userDiff = activeUsers - previousData.current.activeUsers
      change = Math.abs(Math.round((userDiff / previousData.current.activeUsers) * 100))
      
      if (userDiff > 2) trend = 'up'
      else if (userDiff < -2) trend = 'down'
      else trend = 'stable'
    }

    const newData: RealtimeData = {
      activeUsers,
      pageViews,
      topPages: [
        { page: '/dashboard', views: Math.floor(Math.random() * 50) + 20 },
        { page: '/analytics', views: Math.floor(Math.random() * 30) + 15 },
        { page: '/reports', views: Math.floor(Math.random() * 25) + 10 },
        { page: '/settings', views: Math.floor(Math.random() * 20) + 5 },
        { page: '/billing', views: Math.floor(Math.random() * 15) + 3 },
      ],
      topCountries: [
        { country: 'United States', users: Math.floor(Math.random() * 30) + 20 },
        { country: 'United Kingdom', users: Math.floor(Math.random() * 20) + 15 },
        { country: 'Germany', users: Math.floor(Math.random() * 15) + 10 },
        { country: 'Canada', users: Math.floor(Math.random() * 12) + 8 },
      ],
      trend,
      change
    }

    previousData.current = newData
    return newData
  }

  const fetchRealtimeData = async () => {
    try {
      if (endpoint) {
        const response = await fetch(endpoint)
        if (response.ok) {
          const newData = await response.json()
          setData(newData)
          setIsConnected(true)
        } else {
          throw new Error('API request failed')
        }
      } else {
        // Use demo data
        setData(generateDemoData())
        setIsConnected(true)
      }
      setLastUpdate(new Date())
    } catch (error) {
      console.warn('Realtime data fetch failed, using demo data:', error)
      setData(generateDemoData())
      setIsConnected(false)
      setLastUpdate(new Date())
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchRealtimeData()
    
    // Set up interval
    intervalRef.current = setInterval(fetchRealtimeData, updateInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [endpoint, updateInterval])

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-500">
            {isConnected ? 'Live' : 'Demo'}
          </span>
        </div>
      </div>

      {/* Main Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <CounterCard
          icon={Users}
          title="Active Users"
          value={data.activeUsers}
          change={data.change}
          trend={data.trend}
          showTrend={showTrend}
        />
        <CounterCard
          icon={Eye}
          title="Page Views"
          value={data.pageViews}
          showTrend={false}
        />
      </div>

      {/* Top Pages */}
      {showTopPages && data.topPages.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Top Pages Right Now</h4>
          <div className="space-y-2">
            {data.topPages.slice(0, 5).map((page, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 font-mono">{page.page}</span>
                <span className="text-sm font-medium text-gray-900">{page.views} views</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Countries */}
      {data.topCountries.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Top Countries</h4>
          <div className="grid grid-cols-2 gap-2">
            {data.topCountries.slice(0, 4).map((country, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{country.country}</span>
                <span className="text-sm font-medium text-gray-900">{country.users}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Update */}
      {lastUpdate && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  )
}

export default function RealtimeCounter(props: RealtimeCounterProps) {
  return (
    <WidgetErrorBoundary widgetName="Realtime Counter">
      <RealtimeCounterWidget {...props} />
    </WidgetErrorBoundary>
  )
}