import { NextRequest, NextResponse } from 'next/server'
import { testValidationSchemas } from '@/lib/validation-schemas'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    logger.info('Running validation schema tests')
    
    const testResults = testValidationSchemas()
    
    if (testResults) {
      return NextResponse.json({
        success: true,
        message: 'All validation schemas are working correctly',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Some validation tests failed',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
  } catch (error) {
    logger.error('Validation test error', { error: error instanceof Error ? error.message : error })
    return NextResponse.json({
      success: false,
      message: 'Error running validation tests',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}