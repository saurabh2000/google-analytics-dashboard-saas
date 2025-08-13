'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Info, TrendingDown, TrendingUp } from 'lucide-react'

interface RealDataFunnelProps {
  propertyId: string | null
  propertyName: string | null
  dateRange?: string
}

interface FunnelData {
  data: any
  isReal: boolean
  message: string
  source: string
  dataTypes?: any
  availableWithRealData?: any
  error?: string
}

export default function RealDataFunnel({ 
  propertyId, 
  propertyName, 
  dateRange = '30d' 
}: RealDataFunnelProps) {
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (propertyId) {
      fetchFunnelData()
    }
  }, [propertyId, dateRange])

  const fetchFunnelData = async () => {
    if (!propertyId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/analytics/funnel?propertyId=${propertyId}&dateRange=${dateRange}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch funnel data')
      }

      setFunnelData(result)
    } catch (err) {
      console.error('Failed to fetch funnel data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch funnel data')
    } finally {
      setLoading(false)
    }
  }

  const processLandingPagesData = (landingPages: any) => {
    if (!landingPages?.rows) return []
    
    return landingPages.rows.slice(0, 10).map((row: any, index: number) => ({
      page: row.dimensionValues[0]?.value || 'Unknown',
      views: parseInt(row.metricValues[0]?.value || '0'),
      sessions: parseInt(row.metricValues[1]?.value || '0'),
      users: parseInt(row.metricValues[2]?.value || '0'),
      rank: index + 1
    }))
  }

  const processEventsData = (events: any) => {
    if (!events?.rows) return []
    
    return events.rows.map((row: any) => ({
      event: row.dimensionValues[0]?.value || 'Unknown',
      count: parseInt(row.metricValues[0]?.value || '0'),
      users: parseInt(row.metricValues[1]?.value || '0')
    }))
  }

  const processTrafficData = (traffic: any) => {
    if (!traffic?.rows) return []
    
    return traffic.rows.map((row: any) => ({
      channel: row.dimensionValues[0]?.value || 'Unknown',
      source: row.dimensionValues[1]?.value || 'Unknown',
      sessions: parseInt(row.metricValues[0]?.value || '0'),
      users: parseInt(row.metricValues[1]?.value || '0'),
      bounceRate: parseFloat(row.metricValues[2]?.value || '0') * 100
    }))
  }

  if (!propertyId || !propertyName) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            Connect Google Analytics Property
          </p>
        </div>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
          Please connect a Google Analytics property to view real funnel data.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">
            Fetching real Google Analytics data...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-200 font-medium">
            Error Fetching Real Data
          </p>
        </div>
        <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (!funnelData) return null

  const landingPagesData = funnelData.data ? processLandingPagesData(funnelData.data.landingPages) : []
  const engagementData = funnelData.data ? processEventsData(funnelData.data.engagementEvents) : []
  const conversionData = funnelData.data ? processEventsData(funnelData.data.conversionEvents) : []
  const trafficData = funnelData.data ? processTrafficData(funnelData.data.trafficSources) : []

  return (
    <div className="space-y-6">
      {/* Header with Data Source Indicator */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Real Google Analytics Funnel Data
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Property: {propertyName} • {funnelData.data?.dateRange || dateRange}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {funnelData.isReal ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-800 dark:text-green-200 font-medium">
                  Real GA4 Data
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  Data Unavailable
                </span>
              </>
            )}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-blue-800 dark:text-blue-200 font-medium text-sm">
                What This Shows vs. Traditional Funnels
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                Google Analytics 4 provides event-based data rather than traditional step-by-step funnels. 
                This view shows actual user interactions that can be analyzed to understand user behavior patterns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {funnelData.isReal && funnelData.data ? (
        <>
          {/* Landing Pages Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                🎯 Entry Points (Landing Pages)
              </h4>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">Real Data</span>
            </div>
            
            <div className="space-y-3">
              {landingPagesData.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{page.rank}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {page.page.length > 50 ? `${page.page.substring(0, 50)}...` : page.page}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">{page.views.toLocaleString()}</div>
                      <div className="text-gray-500 dark:text-gray-400">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">{page.sessions.toLocaleString()}</div>
                      <div className="text-gray-500 dark:text-gray-400">Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">{page.users.toLocaleString()}</div>
                      <div className="text-gray-500 dark:text-gray-400">Users</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Events */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                👀 User Engagement Events
              </h4>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">Real Data</span>
            </div>
            
            {engagementData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {engagementData.map((event, index) => (
                  <div key={index} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {event.count.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                        {event.event.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {event.users.toLocaleString()} users
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No engagement events found for this period
              </div>
            )}
          </div>

          {/* Conversion Events */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                🎉 Conversion Events
              </h4>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">Real Data</span>
            </div>
            
            {conversionData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {conversionData.map((event, index) => (
                  <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {event.count.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-800 dark:text-green-200 font-medium">
                        {event.event.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {event.users.toLocaleString()} users
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No conversion events found for this period
              </div>
            )}
          </div>

          {/* Traffic Sources */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                🚀 Traffic Sources
              </h4>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">Real Data</span>
            </div>
            
            <div className="space-y-3">
              {trafficData.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{source.channel}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{source.source}</p>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">{source.sessions.toLocaleString()}</div>
                      <div className="text-gray-500 dark:text-gray-400">Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">{source.users.toLocaleString()}</div>
                      <div className="text-gray-500 dark:text-gray-400">Users</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold ${source.bounceRate > 70 ? 'text-red-600' : source.bounceRate > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {source.bounceRate.toFixed(1)}%
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">Bounce</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Data Limitations Info */
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                Real Data Not Available
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                {funnelData.message}
              </p>
              
              {funnelData.availableWithRealData && (
                <div className="mt-4">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    What Google Analytics 4 Can Provide:
                  </p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• {funnelData.availableWithRealData.pageViews}</li>
                    <li>• {funnelData.availableWithRealData.sessions}</li>
                    <li>• {funnelData.availableWithRealData.activeUsers}</li>
                    <li>• {funnelData.availableWithRealData.eventCounts}</li>
                    <li>• {funnelData.availableWithRealData.trafficSources}</li>
                    <li>• {funnelData.availableWithRealData.bounceRate}</li>
                  </ul>
                  
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mt-3 mb-2">
                    Current Limitations:
                  </p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    {funnelData.availableWithRealData.limitations.map((limitation: string, index: number) => (
                      <li key={index}>• {limitation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}