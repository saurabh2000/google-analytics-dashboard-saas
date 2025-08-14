import { NextResponse } from 'next/server'
import { logger, sanitizeForLog } from './logger'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export interface ApiError {
  message: string
  code?: string
  statusCode: number
  details?: any
}

export class AppError extends Error implements ApiError {
  public readonly statusCode: number
  public readonly code?: string
  public readonly details?: any

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.name = 'AppError'

    // Capture stack trace
    Error.captureStackTrace(this, AppError)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

// Error response formatter for API routes
export function createErrorResponse(error: unknown, request?: Request): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Log the error with context
  const errorContext = {
    url: request?.url,
    method: request?.method,
    timestamp: new Date().toISOString(),
    userAgent: request?.headers.get('user-agent')?.substring(0, 100)
  }

  if (error instanceof AppError) {
    // Log application errors appropriately
    if (error.statusCode >= 500) {
      logger.error('Application error', sanitizeForLog({
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: isProduction ? undefined : error.stack,
        details: sanitizeForLog(error.details),
        ...errorContext
      }))
    } else {
      logger.warn('Client error', sanitizeForLog({
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        ...errorContext
      }))
    }

    return NextResponse.json({
      success: false,
      message: error.message,
      code: error.code,
      ...(isProduction ? {} : { details: sanitizeForLog(error.details) })
    }, { status: error.statusCode })
  }

  if (error instanceof ZodError) {
    logger.warn('Validation error', sanitizeForLog({
      message: 'Invalid input data',
      issues: error.issues,
      ...errorContext
    }))

    return NextResponse.json({
      success: false,
      message: 'Invalid input data',
      code: 'VALIDATION_ERROR',
      ...(isProduction ? {} : { details: error.issues })
    }, { status: 400 })
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error('Database error', sanitizeForLog({
      message: 'Database operation failed',
      code: error.code,
      ...errorContext
    }))

    // Map common Prisma errors to user-friendly messages
    const prismaErrorMap: Record<string, { message: string; statusCode: number }> = {
      'P2002': { message: 'A record with this information already exists', statusCode: 409 },
      'P2025': { message: 'Record not found', statusCode: 404 },
      'P2003': { message: 'Invalid reference to related record', statusCode: 400 },
      'P2014': { message: 'Invalid ID provided', statusCode: 400 }
    }

    const mappedError = prismaErrorMap[error.code]
    
    return NextResponse.json({
      success: false,
      message: mappedError?.message || 'Database operation failed',
      code: 'DATABASE_ERROR'
    }, { status: mappedError?.statusCode || 500 })
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    logger.error('Database validation error', sanitizeForLog({
      message: 'Invalid database query',
      ...errorContext
    }))

    return NextResponse.json({
      success: false,
      message: isProduction ? 'Invalid request data' : 'Database validation error',
      code: 'DATABASE_VALIDATION_ERROR'
    }, { status: 400 })
  }

  // Handle unknown errors
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
  const errorStack = error instanceof Error ? error.stack : undefined

  logger.error('Unhandled error', sanitizeForLog({
    message: errorMessage,
    stack: isProduction ? undefined : errorStack,
    ...errorContext
  }))

  return NextResponse.json({
    success: false,
    message: isProduction ? 'Internal server error' : errorMessage,
    code: 'INTERNAL_ERROR'
  }, { status: 500 })
}

// Async error wrapper for API route handlers
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      const request = args[0] as Request
      return createErrorResponse(error, request)
    }
  }
}

// Input sanitization helpers
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Basic XSS protection
    .substring(0, 1000) // Prevent extremely long inputs
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function validateStringLength(
  value: string, 
  fieldName: string, 
  minLength: number = 1, 
  maxLength: number = 255
): void {
  if (value.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters long`)
  }
  if (value.length > maxLength) {
    throw new ValidationError(`${fieldName} must be no more than ${maxLength} characters long`)
  }
}

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  createErrorResponse,
  withErrorHandler,
  sanitizeInput,
  sanitizeEmail,
  validateStringLength
}