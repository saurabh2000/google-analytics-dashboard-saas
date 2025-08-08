import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAnalyticsData } from '@/lib/google-analytics'
import { getAnalyticsData } from '@/lib/analytics-data'
import { rateLimiter } from '@/lib/rate-limiter'

export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateCheck = await rateLimiter.checkLimit('analytics-data')
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: rateCheck.retryAfter,
          message: `Please retry after ${rateCheck.retryAfter} seconds`
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfter || 60),
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': String(rateLimiter.getRemainingRequests('analytics-data')),
            'X-RateLimit-Reset': String(Date.now() + 60000)
          }
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const dateRange = searchParams.get('dateRange') || '30d'
    const propertyName = searchParams.get('propertyName')

    console.log('🔍 Data API: Request params:', { propertyId, dateRange, propertyName })

    // Try to get real Google Analytics data first
    if (propertyId && propertyId !== 'demo') {
      console.log('📊 Data API: Attempting to fetch real GA data for property:', propertyId)
      try {
        const analyticsData = await getGoogleAnalyticsData(propertyId, dateRange)
        console.log('✅ Data API: Successfully fetched real GA data')
        return NextResponse.json({ 
          data: analyticsData,
          isReal: true,
          message: 'Real Google Analytics data',
          propertyId
        }, {
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': String(rateLimiter.getRemainingRequests('analytics-data')),
            'X-RateLimit-Reset': String(Date.now() + 60000)
          }
        })
      } catch (gaError) {
        console.error('❌ Data API: Failed to fetch real GA data:', {
          error: gaError instanceof Error ? gaError.message : gaError,
          stack: gaError instanceof Error ? gaError.stack : undefined
        })
        // Fall through to mock data
      }
    }

    // Fallback to mock data (existing system)
    const mockData = getAnalyticsData(propertyName, dateRange)
    return NextResponse.json({ 
      data: mockData,
      isReal: false,
      message: 'Mock data - sign in with Google and select a real property to see live data',
      propertyId: propertyId || 'demo'
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': String(rateLimiter.getRemainingRequests('analytics-data')),
        'X-RateLimit-Reset': String(Date.now() + 60000)
      }
    })

  } catch (error) {
    console.error('Analytics data API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch analytics data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}