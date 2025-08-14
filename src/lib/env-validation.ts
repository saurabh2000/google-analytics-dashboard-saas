import { logger } from './logger'

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD'
] as const

const optionalEnvVars = [
  'SHADOW_DATABASE_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'ANTHROPIC_API_KEY',
  'PERPLEXITY_API_KEY'
] as const

export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check required environment variables
  const missingRequired = requiredEnvVars.filter(key => !process.env[key])
  
  if (missingRequired.length > 0) {
    errors.push(`Missing required environment variables: ${missingRequired.join(', ')}`)
  }
  
  // Validate specific environment variables
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    errors.push('NEXTAUTH_SECRET should be at least 32 characters long for security')
  }
  
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length < 8) {
    errors.push('ADMIN_PASSWORD should be at least 8 characters long')
  }
  
  // Check database URL format
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    errors.push('DATABASE_URL should be a valid PostgreSQL connection string')
  }
  
  // Log validation results
  if (errors.length > 0) {
    logger.error('Environment validation failed')
    errors.forEach(error => logger.error(error))
  } else {
    logger.info('Environment validation passed')
    
    // Log configured optional variables (in development only)
    if (process.env.NODE_ENV === 'development') {
      const configuredOptional = optionalEnvVars.filter(key => process.env[key])
      if (configuredOptional.length > 0) {
        logger.debug('Optional environment variables configured:', configuredOptional.join(', '))
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function ensureEnvironmentOrExit(): void {
  const validation = validateEnvironment()
  
  if (!validation.isValid) {
    logger.error('Application cannot start due to environment validation errors')
    validation.errors.forEach(error => logger.error(error))
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    } else {
      logger.warn('Continuing in development mode despite validation errors')
    }
  }
}

export default validateEnvironment