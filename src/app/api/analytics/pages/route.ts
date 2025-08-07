import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const dateRange = searchParams.get('dateRange') || '30d'

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

    // Google Analytics Data API v1 request for top pages
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
            { name: 'screenPageViews' }
          ],
          dimensions: [
            { name: 'pagePath' },
            { name: 'pageTitle' }
          ],
          orderBys: [
            {
              metric: {
                metricName: 'screenPageViews'
              },
              desc: true
            }
          ],
          limit: 10
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GA Pages API Error:', response.status, errorText)
      return NextResponse.json({ 
        error: 'Failed to fetch pages data',
        details: errorText 
      }, { status: response.status })
    }

    const data = await response.json()
    
    // Transform GA data to our format
    const topPages = {
      labels: [] as string[],
      data: [] as number[]
    }

    if (data.rows && data.rows.length > 0) {
      data.rows.slice(0, 5).forEach((row: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const pagePath = row.dimensionValues[0].value
        const pageTitle = row.dimensionValues[1].value
        const pageViews = parseInt(row.metricValues[0].value || '0')

        // Use page title if available, otherwise use path
        const label = pageTitle && pageTitle !== '(not set)' ? 
                     (pageTitle.length > 30 ? pageTitle.substring(0, 30) + '...' : pageTitle) :
                     pagePath

        topPages.labels.push(label)
        topPages.data.push(pageViews)
      })
    }

    return NextResponse.json(topPages)

  } catch (error) {
    console.error('Analytics Pages API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}