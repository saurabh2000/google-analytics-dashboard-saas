type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface Logger {
  debug: (message: string, ...args: any[]) => void
  info: (message: string, ...args: any[]) => void
  warn: (message: string, ...args: any[]) => void
  error: (message: string, ...args: any[]) => void
}

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Configure log levels based on environment
const logLevels: Record<string, LogLevel[]> = {
  development: ['debug', 'info', 'warn', 'error'],
  production: ['error'],
  test: ['error']
}

const allowedLevels = logLevels[process.env.NODE_ENV || 'development']

function shouldLog(level: LogLevel): boolean {
  return allowedLevels.includes(level)
}

function formatLogMessage(level: LogLevel, message: string): string {
  const timestamp = new Date().toISOString()
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`
}

export const logger: Logger = {
  debug: (message: string, ...args: any[]) => {
    if (shouldLog('debug')) {
      console.log(formatLogMessage('debug', message), ...args)
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (shouldLog('info')) {
      console.info(formatLogMessage('info', message), ...args)
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(formatLogMessage('warn', message), ...args)
    }
  },
  
  error: (message: string, ...args: any[]) => {
    if (shouldLog('error')) {
      // Always log errors, but sanitize in production
      if (isProduction) {
        console.error(formatLogMessage('error', message))
      } else {
        console.error(formatLogMessage('error', message), ...args)
      }
    }
  }
}

// Helper function to sanitize sensitive data in logs
export function sanitizeForLog(data: any): any {
  if (isProduction) {
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data }
      // Remove sensitive fields
      const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential']
      
      for (const field of sensitiveFields) {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]'
        }
      }
      
      return sanitized
    }
  }
  return data
}

export default logger