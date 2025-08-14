import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getGoogleAnalyticsProperties } from '@/lib/google-analytics'
import { withErrorHandler, ValidationError } from '@/lib/error-handler'
import { schemas } from '@/lib/validation-schemas'
import { logger, sanitizeForLog } from '@/lib/logger'

export const GET = withErrorHandler(async (req: NextRequest) => {
  logger.debug('Properties API: Attempting to fetch Google Analytics properties')
  
  // First check session info
  const session = await getServerSession(authOptions)
  logger.debug('Properties API: Session info', sanitizeForLog({
    hasSession: !!session,
    hasUser: !!session?.user,
    userEmail: session?.user?.email,
    hasAccessToken: !!session?.accessToken,
    hasRefreshToken: !!session?.refreshToken,
    accessTokenLength: session?.accessToken ? (session.accessToken as string).length : 0,
  }))
    
  // Try to get real Google Analytics properties
  try {
    logger.debug('Properties API: Calling getGoogleAnalyticsProperties')
    const properties = await getGoogleAnalyticsProperties()
    logger.info('Properties API: Successfully fetched real GA properties', sanitizeForLog({
      count: properties?.length || 0,
      properties: properties?.map(p => ({ id: p.propertyId, name: p.displayName })) || []
    }))
    return NextResponse.json({ 
      properties, 
      isReal: true,
      message: 'Real Google Analytics data'
    })
  } catch (gaError) {
    logger.warn('Properties API: Failed to fetch real GA properties', sanitizeForLog({
      error: gaError instanceof Error ? gaError.message : gaError
    }))
      
    // Fallback to demo data if GA API fails
    const demoProperties = [
      {
        name: 'properties/123456789',
        displayName: 'My Website',
        propertyId: '123456789',
        createTime: '2023-01-01T00:00:00Z',
        updateTime: '2024-01-01T00:00:00Z',
        currencyCode: 'USD',
        timeZone: 'America/Los_Angeles'
      },
      {
        name: 'properties/987654321',
        displayName: 'E-commerce Site',
        propertyId: '987654321',
        createTime: '2023-06-01T00:00:00Z',
        updateTime: '2024-01-01T00:00:00Z',
        currencyCode: 'USD',
        timeZone: 'America/New_York'
      }
    ]

    return NextResponse.json({ 
      properties: demoProperties,
      isReal: false,
      message: 'Demo data - sign in with Google to see real properties'
    })
  }
})