import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAnalyticsData } from '@/lib/google-analytics'
import { getAnalyticsData } from '@/lib/analytics-data'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const propertyId = searchParams.get('propertyId')
    const dateRange = searchParams.get('dateRange') || '30d'
    
    console.log('🔍 Analytics Data API: Request params:', { propertyId, dateRange })

    if (!propertyId) {
      return NextResponse.json({ 
        error: 'Property ID is required' 
      }, { status: 400 })
    }

    try {
      console.log('🔍 Analytics Data API: Attempting to fetch real GA data...')
      
      // Try to get real Google Analytics data
      const realData = await getGoogleAnalyticsData(propertyId, dateRange)
      
      console.log('✅ Analytics Data API: Successfully fetched real GA data')
      return NextResponse.json({ 
        data: realData,
        isReal: true,
        message: 'Real Google Analytics data',
        source: 'google_analytics_api'
      })
      
    } catch (gaError) {
      console.error('❌ Analytics Data API: Failed to fetch real GA data:', {
        error: gaError instanceof Error ? gaError.message : gaError,
        stack: gaError instanceof Error ? gaError.stack?.substring(0, 500) : undefined
      })
      
      // Fallback to demo data if GA API fails
      const demoData = getAnalyticsData(propertyId, dateRange)
      
      return NextResponse.json({ 
        data: demoData,
        isReal: false,
        message: 'Demo data - check authentication or property access',
        source: 'demo_data',
        error: gaError instanceof Error ? gaError.message : 'Unknown error'
      })
    }

  } catch (error) {
    console.error('Error in analytics data API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}