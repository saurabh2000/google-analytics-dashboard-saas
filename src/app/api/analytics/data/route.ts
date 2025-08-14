import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAnalyticsData } from '@/lib/google-analytics'
import { getAnalyticsData } from '@/lib/analytics-data'
import { withErrorHandler, ValidationError } from '@/lib/error-handler'
import { schemas } from '@/lib/validation-schemas'
import { logger, sanitizeForLog } from '@/lib/logger'

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  
  // Build validation data from query parameters
  const queryData = {
    propertyId: searchParams.get('propertyId'),
    dateRange: searchParams.get('dateRange') || '30d',
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate'),
    propertyName: searchParams.get('propertyName')
  }
  
  // Validate query parameters (only validate if propertyId is provided)
  if (queryData.propertyId) {
    const validation = schemas.analyticsData.safeParse(queryData)
    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues)
    }
  }
  
  logger.debug('Analytics Data API request', sanitizeForLog(queryData))

  if (!queryData.propertyId) {
    logger.info('Analytics Data API: No propertyId provided, returning demo data')
    const demoData = getAnalyticsData(queryData.propertyName, queryData.dateRange)
    
    return NextResponse.json({ 
      data: demoData,
      isReal: false,
      message: 'Demo data - no property connected',
      source: 'demo_data'
    })
  }

  try {
    logger.debug('Analytics Data API: Attempting to fetch real GA data')
    
    // Try to get real Google Analytics data
    const realData = await getGoogleAnalyticsData(queryData.propertyId, queryData.dateRange)
    
    logger.info('Analytics Data API: Successfully fetched real GA data')
    return NextResponse.json({ 
      data: realData,
      isReal: true,
      message: 'Real Google Analytics data',
      source: 'google_analytics_api'
    })
    
  } catch (gaError) {
    logger.warn('Analytics Data API: Failed to fetch real GA data', sanitizeForLog({
      error: gaError instanceof Error ? gaError.message : gaError,
      propertyId: queryData.propertyId
    }))
    
    // Fallback to demo data if GA API fails
    const demoData = getAnalyticsData(queryData.propertyId, queryData.dateRange)
    
    return NextResponse.json({ 
      data: demoData,
      isReal: false,
      message: 'Demo data - check authentication or property access',
      source: 'demo_data',
      error: gaError instanceof Error ? gaError.message : 'Unknown error'
    })
  }
})