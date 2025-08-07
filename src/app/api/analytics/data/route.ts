import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const dateRange = searchParams.get('dateRange') || '30d'
    // const metric = searchParams.get('metric') || 'activeUsers' // TODO: Use metric parameter

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
    }

    // Convert date range to start/end dates
    const endDate = new Date()
    const startDate = new Date()
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }

    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    // Google Analytics Data API v1 request
    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [
            {
              startDate: formatDate(startDate),
              endDate: formatDate(endDate)
            }
          ],
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' }
          ],
          dimensions: [
            { name: 'date' }
          ],
          orderBys: [
            {
              dimension: {
                dimensionName: 'date'
              }
            }
          ]
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GA API Error:', response.status, errorText)
      return NextResponse.json({ 
        error: 'Failed to fetch analytics data',
        details: errorText 
      }, { status: response.status })
    }

    const data = await response.json()
    
    // Transform GA data to our format
    const transformedData = {
      users: {
        total: 0,
        change: 0,
        trend: [] as number[],
        labels: [] as string[]
      },
      sessions: {
        total: 0,
        change: 0,
        trend: [] as number[],
        labels: [] as string[]
      },
      pageViews: {
        total: 0,
        change: 0,
        trend: [] as number[],
        labels: [] as string[]
      },
      avgSessionDuration: {
        total: '0s',
        change: 0
      },
      bounceRate: 0
    }

    if (data.rows && data.rows.length > 0) {
      let totalUsers = 0
      let totalSessions = 0
      let totalPageViews = 0
      let totalDuration = 0

      data.rows.forEach((row: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const date = row.dimensionValues[0].value
        const users = parseInt(row.metricValues[0].value || '0')
        const sessions = parseInt(row.metricValues[1].value || '0')
        const pageViews = parseInt(row.metricValues[2].value || '0')
        const duration = parseFloat(row.metricValues[3].value || '0')

        totalUsers += users
        totalSessions += sessions
        totalPageViews += pageViews
        totalDuration += duration

        transformedData.users.trend.push(users)
        transformedData.sessions.trend.push(sessions)
        transformedData.pageViews.trend.push(pageViews)
        
        // Format date for labels
        const formattedDate = new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
        transformedData.users.labels.push(formattedDate)
      })

      transformedData.users.total = totalUsers
      transformedData.sessions.total = totalSessions
      transformedData.pageViews.total = totalPageViews
      
      // Format average session duration
      const avgDurationSeconds = totalDuration / data.rows.length
      const minutes = Math.floor(avgDurationSeconds / 60)
      const seconds = Math.floor(avgDurationSeconds % 60)
      transformedData.avgSessionDuration.total = `${minutes}m ${seconds}s`

      // Calculate simple percentage changes (comparing first half vs second half of period)
      const halfPoint = Math.floor(data.rows.length / 2)
      if (halfPoint > 0) {
        const firstHalfUsers = transformedData.users.trend.slice(0, halfPoint).reduce((a, b) => a + b, 0)
        const secondHalfUsers = transformedData.users.trend.slice(halfPoint).reduce((a, b) => a + b, 0)
        
        if (firstHalfUsers > 0) {
          transformedData.users.change = ((secondHalfUsers - firstHalfUsers) / firstHalfUsers) * 100
        }

        const firstHalfSessions = transformedData.sessions.trend.slice(0, halfPoint).reduce((a, b) => a + b, 0)
        const secondHalfSessions = transformedData.sessions.trend.slice(halfPoint).reduce((a, b) => a + b, 0)
        
        if (firstHalfSessions > 0) {
          transformedData.sessions.change = ((secondHalfSessions - firstHalfSessions) / firstHalfSessions) * 100
        }

        const firstHalfPageViews = transformedData.pageViews.trend.slice(0, halfPoint).reduce((a, b) => a + b, 0)
        const secondHalfPageViews = transformedData.pageViews.trend.slice(halfPoint).reduce((a, b) => a + b, 0)
        
        if (firstHalfPageViews > 0) {
          transformedData.pageViews.change = ((secondHalfPageViews - firstHalfPageViews) / firstHalfPageViews) * 100
        }
      }

      // Copy labels to other metrics
      transformedData.sessions.labels = [...transformedData.users.labels]
      transformedData.pageViews.labels = [...transformedData.users.labels]
    }

    return NextResponse.json(transformedData)

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}