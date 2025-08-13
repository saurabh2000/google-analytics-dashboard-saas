// Google Analytics API integration service
import { google } from 'googleapis'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { AnalyticsData } from './analytics-data'

// Google Analytics Data API (GA4)
const analyticsData = google.analyticsdata('v1beta')

// Types for Google Analytics API responses
export interface GAProperty {
  name: string
  displayName: string
  propertyId: string
  createTime: string
  updateTime: string
  currencyCode?: string
  timeZone?: string
}

export interface GAMetric {
  name: string
  values: string[]
}

export interface GADimension {
  name: string
  values: string[]
}

export interface GAReportResponse {
  dimensionHeaders: { name: string }[]
  metricHeaders: { name: string; type: string }[]
  rows: {
    dimensionValues: { value: string }[]
    metricValues: { value: string }[]
  }[]
  metadata: {
    currencyCode?: string
    timeZone?: string
  }
  totals: {
    dimensionValues: { value: string }[]
    metricValues: { value: string }[]
  }[]
}

/**
 * Google Analytics API Service Class
 * Handles authentication and data fetching from GA4 properties
 */
export class GoogleAnalyticsService {
  private auth: InstanceType<typeof google.auth.OAuth2>

  constructor() {
    // Initialize OAuth2 client with credentials
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google` : 'http://localhost:3000/api/auth/callback/google'
    )
  }

  /**
   * Set access token for authenticated requests
   */
  async setAccessToken(accessToken: string, refreshToken?: string) {
    this.auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })
  }

  /**
   * Get user's Google Analytics properties
   */
  async getProperties(): Promise<GAProperty[]> {
    try {
      const adminApi = google.analyticsadmin('v1alpha')
      adminApi.context._options.auth = this.auth

      const response = await adminApi.accounts.list()
      const accounts = response.data.accounts || []

      const properties: GAProperty[] = []
      
      // Get properties for each account
      for (const account of accounts) {
        if (account.name) {
          try {
            const propertiesResponse = await adminApi.properties.list({
              filter: `parent:${account.name}`
            })
            
            const accountProperties = propertiesResponse.data.properties || []
            properties.push(...accountProperties.map(prop => ({
              name: prop.name || '',
              displayName: prop.displayName || '',
              propertyId: prop.name?.split('/').pop() || '',
              createTime: prop.createTime || '',
              updateTime: prop.updateTime || '',
              currencyCode: prop.currencyCode,
              timeZone: prop.timeZone
            })))
          } catch (error) {
            console.warn(`Failed to fetch properties for account ${account.name}:`, error)
          }
        }
      }

      return properties
    } catch (error) {
      console.error('Failed to fetch Google Analytics properties:', error)
      throw new Error('Unable to fetch Google Analytics properties')
    }
  }

  /**
   * Get funnel data from Google Analytics 4
   * This creates a basic funnel using page views and events
   */
  async getFunnelData(propertyId: string, dateRange: string = '30d'): Promise<any> {
    try {
      const startDate = this.getStartDate(dateRange)
      const endDate = 'today'

      // Step 1: Landing pages (page_view events)
      const landingPageReport = await this.runReport(propertyId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'sessions' },
          { name: 'activeUsers' }
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 20
      })

      // Step 2: Engagement events (scroll, file_download, etc.)
      const engagementReport = await this.runReport(propertyId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'eventName' }],
        metrics: [
          { name: 'eventCount' },
          { name: 'activeUsers' }
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: {
              values: ['scroll', 'click', 'file_download', 'video_start', 'engagement_time_msec']
            }
          }
        },
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }]
      })

      // Step 3: Conversion events
      const conversionReport = await this.runReport(propertyId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'eventName' }],
        metrics: [
          { name: 'eventCount' },
          { name: 'activeUsers' }
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: {
              values: ['form_start', 'form_submit', 'sign_up', 'purchase', 'generate_lead']
            }
          }
        },
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }]
      })

      // Step 4: Traffic sources for the funnel
      const trafficSourceReport = await this.runReport(propertyId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'sessionDefaultChannelGroup' },
          { name: 'sessionSource' }
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'bounceRate' }
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10
      })

      return {
        landingPages: landingPageReport,
        engagementEvents: engagementReport,
        conversionEvents: conversionReport,
        trafficSources: trafficSourceReport,
        dateRange: `${startDate} to ${endDate}`,
        isRealData: true
      }

    } catch (error) {
      console.error('Failed to fetch Google Analytics funnel data:', error)
      throw new Error('Unable to fetch funnel data from Google Analytics')
    }
  }

  /**
   * Get analytics data for a specific property and date range
   */
  async getAnalyticsData(propertyId: string, dateRange: string = '30d'): Promise<AnalyticsData> {
    try {
      const startDate = this.getStartDate(dateRange)
      const endDate = 'today'

      // Main metrics query
      const metricsResponse = await this.runReport(propertyId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' }
        ],
        orderBys: [{ dimension: { dimensionName: 'date' } }]
      })

      // Top pages query
      const topPagesResponse = await this.runReport(propertyId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10
      })

      // Traffic sources query
      const trafficSourcesResponse = await this.runReport(propertyId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
      })

      // Device types query
      const deviceTypesResponse = await this.runReport(propertyId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
      })

      // Real-time users query (separate API)
      let realTimeUsers = 0
      try {
        const realTimeResponse = await this.getRealtimeReport(propertyId, {
          metrics: [{ name: 'activeUsers' }]
        })
        realTimeUsers = parseInt(realTimeResponse.totals?.[0]?.metricValues?.[0]?.value || '0')
      } catch (error) {
        console.warn('Failed to fetch real-time data:', error)
      }

      // Process the data into our AnalyticsData format
      return this.processAnalyticsData(
        metricsResponse,
        topPagesResponse,
        trafficSourcesResponse,
        deviceTypesResponse,
        realTimeUsers
      )

    } catch (error) {
      console.error('Failed to fetch Google Analytics data:', error)
      throw new Error('Unable to fetch analytics data from Google Analytics')
    }
  }

  /**
   * Run a report query against Google Analytics Data API
   */
  private async runReport(propertyId: string, request: Record<string, unknown>): Promise<GAReportResponse> {
    const response = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: request,
      auth: this.auth
    })

    return response.data as GAReportResponse
  }

  /**
   * Get real-time report data
   */
  private async getRealtimeReport(propertyId: string, request: Record<string, unknown>): Promise<GAReportResponse> {
    const response = await analyticsData.properties.runRealtimeReport({
      property: `properties/${propertyId}`,
      requestBody: request,
      auth: this.auth
    })

    return response.data as GAReportResponse
  }

  /**
   * Convert date range string to start date
   */
  private getStartDate(dateRange: string): string {
    const date = new Date()
    
    switch (dateRange) {
      case '7d':
        date.setDate(date.getDate() - 7)
        break
      case '30d':
        date.setDate(date.getDate() - 30)
        break
      case '90d':
        date.setDate(date.getDate() - 90)
        break
      case '1y':
        date.setFullYear(date.getFullYear() - 1)
        break
      default:
        date.setDate(date.getDate() - 30)
    }

    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  /**
   * Process raw GA data into our AnalyticsData format
   */
  private processAnalyticsData(
    metricsData: GAReportResponse,
    topPagesData: GAReportResponse,
    trafficSourcesData: GAReportResponse,
    deviceTypesData: GAReportResponse,
    realTimeUsers: number
  ): AnalyticsData {
    
    // Process time series data
    const timeSeriesData = metricsData.rows || []
    const labels = timeSeriesData.map(row => {
      const dateStr = row.dimensionValues[0]?.value || ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    const usersTrend = timeSeriesData.map(row => parseInt(row.metricValues[0]?.value || '0'))
    const sessionsTrend = timeSeriesData.map(row => parseInt(row.metricValues[1]?.value || '0'))
    const pageViewsTrend = timeSeriesData.map(row => parseInt(row.metricValues[2]?.value || '0'))

    // Calculate totals and changes
    const totalUsers = usersTrend.reduce((sum, val) => sum + val, 0)
    const totalSessions = sessionsTrend.reduce((sum, val) => sum + val, 0)
    const totalPageViews = pageViewsTrend.reduce((sum, val) => sum + val, 0)
    
    // Calculate average session duration
    const avgDurationSeconds = metricsData.totals?.[0]?.metricValues?.[3]?.value 
      ? parseFloat(metricsData.totals[0].metricValues[3].value) 
      : 0
    const avgDurationFormatted = this.formatDuration(avgDurationSeconds)

    // Calculate percentage changes (simplified - comparing first half vs second half)
    const halfPoint = Math.floor(usersTrend.length / 2)
    const firstHalfUsers = usersTrend.slice(0, halfPoint).reduce((sum, val) => sum + val, 0)
    const secondHalfUsers = usersTrend.slice(halfPoint).reduce((sum, val) => sum + val, 0)
    const usersChange = firstHalfUsers > 0 ? ((secondHalfUsers - firstHalfUsers) / firstHalfUsers) * 100 : 0

    const firstHalfSessions = sessionsTrend.slice(0, halfPoint).reduce((sum, val) => sum + val, 0)
    const secondHalfSessions = sessionsTrend.slice(halfPoint).reduce((sum, val) => sum + val, 0)
    const sessionsChange = firstHalfSessions > 0 ? ((secondHalfSessions - firstHalfSessions) / firstHalfSessions) * 100 : 0

    const firstHalfPageViews = pageViewsTrend.slice(0, halfPoint).reduce((sum, val) => sum + val, 0)
    const secondHalfPageViews = pageViewsTrend.slice(halfPoint).reduce((sum, val) => sum + val, 0)
    const pageViewsChange = firstHalfPageViews > 0 ? ((secondHalfPageViews - firstHalfPageViews) / firstHalfPageViews) * 100 : 0

    // Process top pages
    const topPagesLabels = (topPagesData.rows || []).slice(0, 5).map(row => row.dimensionValues[0]?.value || '')
    const topPagesValues = (topPagesData.rows || []).slice(0, 5).map(row => parseInt(row.metricValues[0]?.value || '0'))

    // Process traffic sources
    const trafficSourcesLabels = (trafficSourcesData.rows || []).map(row => row.dimensionValues[0]?.value || '')
    const trafficSourcesValues = (trafficSourcesData.rows || []).map(row => parseInt(row.metricValues[0]?.value || '0'))

    // Process device types
    const deviceTypesLabels = (deviceTypesData.rows || []).map(row => {
      const deviceType = row.dimensionValues[0]?.value || ''
      return deviceType.charAt(0).toUpperCase() + deviceType.slice(1).toLowerCase()
    })
    const deviceTypesValues = (deviceTypesData.rows || []).map(row => parseInt(row.metricValues[0]?.value || '0'))

    return {
      users: {
        total: totalUsers,
        change: Math.round(usersChange * 10) / 10,
        trend: usersTrend,
        labels
      },
      sessions: {
        total: totalSessions,
        change: Math.round(sessionsChange * 10) / 10,
        trend: sessionsTrend,
        labels
      },
      pageViews: {
        total: totalPageViews,
        change: Math.round(pageViewsChange * 10) / 10,
        trend: pageViewsTrend,
        labels
      },
      avgSessionDuration: {
        total: avgDurationFormatted,
        change: 0 // Would need historical data to calculate this properly
      },
      topPages: {
        labels: topPagesLabels,
        data: topPagesValues
      },
      trafficSources: {
        labels: trafficSourcesLabels,
        data: trafficSourcesValues
      },
      deviceTypes: {
        labels: deviceTypesLabels,
        data: deviceTypesValues
      },
      realTimeUsers
    }
  }

  /**
   * Format duration from seconds to readable string
   */
  private formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    }
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`
    }
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    return `${hours}h ${remainingMinutes}m`
  }
}

// Singleton instance
export const googleAnalyticsService = new GoogleAnalyticsService()

/**
 * Server-side function to get authenticated Google Analytics data
 */
export async function getGoogleAnalyticsData(
  propertyId: string, 
  dateRange: string = '30d'
): Promise<AnalyticsData> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      throw new Error('No valid session or access token found')
    }

    await googleAnalyticsService.setAccessToken(
      session.accessToken as string,
      session.refreshToken as string
    )

    return await googleAnalyticsService.getAnalyticsData(propertyId, dateRange)
  } catch (error) {
    console.error('Failed to get Google Analytics data:', error)
    throw error
  }
}

/**
 * Server-side function to get Google Analytics funnel data
 */
export async function getGoogleAnalyticsFunnelData(
  propertyId: string, 
  dateRange: string = '30d'
): Promise<any> {
  try {
    console.log('🔍 GA Funnel Service: Getting server session...')
    const session = await getServerSession(authOptions)
    console.log('🔍 GA Funnel Service: Session status:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      user: session?.user?.email || 'No user'
    })
    
    if (!session?.accessToken) {
      throw new Error('No valid session or access token found')
    }

    console.log('🔍 GA Funnel Service: Setting access token...')
    await googleAnalyticsService.setAccessToken(
      session.accessToken as string,
      session.refreshToken as string
    )

    console.log('🔍 GA Funnel Service: Calling getFunnelData()...')
    const funnelData = await googleAnalyticsService.getFunnelData(propertyId, dateRange)
    console.log('🔍 GA Funnel Service: Retrieved funnel data successfully')
    return funnelData
  } catch (error) {
    console.error('❌ GA Funnel Service: Failed to get Google Analytics funnel data:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined
    })
    throw error
  }
}

/**
 * Server-side function to get user's Google Analytics properties
 */
export async function getGoogleAnalyticsProperties(): Promise<GAProperty[]> {
  try {
    console.log('🔍 GA Service: Getting server session...')
    const session = await getServerSession(authOptions)
    console.log('🔍 GA Service: Session status:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      hasRefreshToken: !!session?.refreshToken,
      user: session?.user?.email || 'No user'
    })
    
    if (!session?.accessToken) {
      throw new Error('No valid session or access token found')
    }

    console.log('🔍 GA Service: Setting access token...')
    await googleAnalyticsService.setAccessToken(
      session.accessToken as string,
      session.refreshToken as string
    )

    console.log('🔍 GA Service: Calling getProperties()...')
    const properties = await googleAnalyticsService.getProperties()
    console.log('🔍 GA Service: Retrieved properties:', properties.length)
    return properties
  } catch (error) {
    console.error('❌ GA Service: Failed to get Google Analytics properties:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined
    })
    throw error
  }
}