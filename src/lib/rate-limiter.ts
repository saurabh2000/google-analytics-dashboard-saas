// Rate limiter for API calls to prevent exceeding quotas

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  delayAfterLimit?: number
}

interface RequestRecord {
  timestamp: number
  count: number
}

class RateLimiter {
  private limits: Map<string, RateLimitConfig>
  private requests: Map<string, RequestRecord[]>

  constructor() {
    this.limits = new Map()
    this.requests = new Map()
    
    // Default rate limits based on Google Analytics API quotas
    this.setLimit('analytics-data', { maxRequests: 100, windowMs: 60 * 1000 }) // 100 per minute
    this.setLimit('realtime', { maxRequests: 50, windowMs: 60 * 1000 }) // 50 per minute
    this.setLimit('properties', { maxRequests: 20, windowMs: 60 * 1000 }) // 20 per minute
  }

  setLimit(key: string, config: RateLimitConfig): void {
    this.limits.set(key, config)
  }

  async checkLimit(key: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const config = this.limits.get(key)
    if (!config) {
      // No limit configured, allow the request
      return { allowed: true }
    }

    const now = Date.now()
    const windowStart = now - config.windowMs

    // Get or initialize request records
    if (!this.requests.has(key)) {
      this.requests.set(key, [])
    }

    const records = this.requests.get(key)!
    
    // Remove old records outside the window
    const validRecords = records.filter(r => r.timestamp > windowStart)
    this.requests.set(key, validRecords)

    // Count requests in current window
    const requestCount = validRecords.reduce((sum, r) => sum + r.count, 0)

    if (requestCount >= config.maxRequests) {
      // Calculate when the oldest request will fall outside the window
      const oldestRequest = validRecords[0]
      const retryAfter = oldestRequest ? 
        Math.ceil((oldestRequest.timestamp + config.windowMs - now) / 1000) : 
        Math.ceil(config.windowMs / 1000)

      return { 
        allowed: false, 
        retryAfter 
      }
    }

    // Record this request
    validRecords.push({ timestamp: now, count: 1 })

    return { allowed: true }
  }

  async waitForSlot(key: string): Promise<void> {
    const check = await this.checkLimit(key)
    
    if (!check.allowed && check.retryAfter) {
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, check.retryAfter * 1000))
      // Recursive check
      return this.waitForSlot(key)
    }
  }

  getRemainingRequests(key: string): number {
    const config = this.limits.get(key)
    if (!config) return Infinity

    const now = Date.now()
    const windowStart = now - config.windowMs
    const records = this.requests.get(key) || []
    const validRecords = records.filter(r => r.timestamp > windowStart)
    const requestCount = validRecords.reduce((sum, r) => sum + r.count, 0)

    return Math.max(0, config.maxRequests - requestCount)
  }

  getStats(key: string) {
    const config = this.limits.get(key)
    if (!config) return null

    const remaining = this.getRemainingRequests(key)
    const used = config.maxRequests - remaining

    return {
      limit: config.maxRequests,
      remaining,
      used,
      windowMs: config.windowMs,
      percentUsed: (used / config.maxRequests) * 100
    }
  }

  reset(key?: string): void {
    if (key) {
      this.requests.delete(key)
    } else {
      this.requests.clear()
    }
  }
}

// Create singleton instance
export const rateLimiter = new RateLimiter()

// Higher-order function to wrap API calls with rate limiting
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  limitKey: string
): T {
  return (async (...args: Parameters<T>) => {
    // Wait for available slot
    await rateLimiter.waitForSlot(limitKey)
    
    try {
      // Execute the original function
      return await fn(...args)
    } catch (error: any) {
      // Check for rate limit errors from the API
      if (error.status === 429 || error.code === 'RATE_LIMIT_EXCEEDED') {
        const retryAfter = error.retryAfter || 60
        console.warn(`Rate limit hit for ${limitKey}, retrying after ${retryAfter}s`)
        
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
        return fn(...args)
      }
      
      throw error
    }
  }) as T
}

// Rate limit status component helper
export function getRateLimitStatus() {
  return {
    analyticsData: rateLimiter.getStats('analytics-data'),
    realtime: rateLimiter.getStats('realtime'),
    properties: rateLimiter.getStats('properties')
  }
}