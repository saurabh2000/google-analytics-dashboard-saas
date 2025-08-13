import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAnalyticsFunnelData } from '@/lib/google-analytics'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const propertyId = searchParams.get('propertyId')
    const dateRange = searchParams.get('dateRange') || '30d'
    
    console.log('🔍 Funnel API: Request params:', { propertyId, dateRange })

    if (!propertyId) {
      return NextResponse.json({ 
        error: 'Property ID is required' 
      }, { status: 400 })
    }

    try {
      console.log('🔍 Funnel API: Attempting to fetch real GA funnel data...')
      
      // Try to get real Google Analytics funnel data
      const realFunnelData = await getGoogleAnalyticsFunnelData(propertyId, dateRange)
      
      console.log('✅ Funnel API: Successfully fetched real GA funnel data')
      return NextResponse.json({ 
        data: realFunnelData,
        isReal: true,
        message: 'Real Google Analytics funnel data',
        source: 'google_analytics_api',
        dataTypes: {
          landingPages: 'Real page views and sessions by page path',
          engagementEvents: 'Real user interaction events (scroll, click, video_start, etc.)',
          conversionEvents: 'Real conversion events (form_start, form_submit, sign_up, purchase)',
          trafficSources: 'Real traffic source breakdown with bounce rates',
          limitations: [
            'GA4 does not provide detailed user journey paths',
            'Time on stage data is not available',
            'Drop-off reasons are not tracked by default',
            'Custom events need to be implemented for detailed funnels'
          ]
        }
      })
      
    } catch (gaError) {
      console.error('❌ Funnel API: Failed to fetch real GA funnel data:', {
        error: gaError instanceof Error ? gaError.message : gaError,
        stack: gaError instanceof Error ? gaError.stack?.substring(0, 500) : undefined
      })
      
      // Return error information for debugging
      return NextResponse.json({ 
        data: null,
        isReal: false,
        message: 'Failed to fetch real funnel data - check authentication or property access',
        source: 'error',
        error: gaError instanceof Error ? gaError.message : 'Unknown error',
        availableWithRealData: {
          pageViews: 'Total page views by page path',
          sessions: 'Session counts',
          activeUsers: 'Unique users who triggered events',
          eventCounts: 'Number of specific events triggered',
          trafficSources: 'Session source and medium breakdown',
          bounceRate: 'Percentage of single-page sessions',
          limitations: [
            'No detailed user journey paths',
            'No time-on-stage metrics',
            'No drop-off reason analysis',
            'Requires custom event implementation for detailed funnels'
          ]
        }
      }, { status: 200 })
    }

  } catch (error) {
    console.error('Error in funnel API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch funnel data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}