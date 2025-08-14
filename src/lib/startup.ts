import { ensureEnvironmentOrExit } from './env-validation'
import { logger } from './logger'

export function initializeApplication(): void {
  logger.info('Starting application initialization...')
  
  try {
    // Validate environment variables
    ensureEnvironmentOrExit()
    
    // Add any other startup checks here
    validateRuntimeEnvironment()
    
    logger.info('Application initialization completed successfully')
  } catch (error) {
    logger.error('Application initialization failed', error)
    throw error
  }
}

function validateRuntimeEnvironment(): void {
  // Check Node.js version
  const nodeVersion = process.version
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
  
  if (majorVersion < 18) {
    throw new Error(`Node.js version ${majorVersion} is not supported. Please use Node.js 18 or higher.`)
  }
  
  logger.debug('Runtime environment validation passed', { nodeVersion })
}

// Call this in your main application entry point
export default initializeApplication