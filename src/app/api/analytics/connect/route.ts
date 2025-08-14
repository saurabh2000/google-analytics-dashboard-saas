import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { withErrorHandler, ValidationError, AuthenticationError } from '@/lib/error-handler'
import { schemas } from '@/lib/validation-schemas'
import { logger, sanitizeForLog } from '@/lib/logger'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions) as any // eslint-disable-line @typescript-eslint/no-explicit-any
  
  if (!session?.user) {
    throw new AuthenticationError('Not authenticated')
  }

  const body = await request.json()
  
  // Validate request body
  const validation = schemas.analyticsConnect.safeParse(body)
  if (!validation.success) {
    throw new ValidationError('Invalid request data', validation.error.issues)
  }
  
  const { propertyId, propertyName, accountId } = validation.data
  
  logger.info('Analytics Connect API request', sanitizeForLog({
    propertyId,
    propertyName,
    userId: session.user.id
  }))

  // In a real implementation, you would:
  // 1. Store the selected property ID in your database
  // 2. Validate that the user has access to this property
  // 3. Set up any necessary data fetching schedules

  // For demo purposes, we'll just return success
  logger.info('Analytics property connected successfully', sanitizeForLog({
    propertyId,
    propertyName,
    userId: session.user.id
  }))
  
  return NextResponse.json({ 
    success: true, 
    message: 'Google Analytics connected successfully',
    propertyId,
    propertyName
  })
})