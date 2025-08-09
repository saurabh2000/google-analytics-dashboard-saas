// Simple in-memory cache for API responses
// In production, this should be replaced with Redis or similar

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class Cache {
  private store: Map<string, CacheItem<unknown>>
  private defaultTTL: number

  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.store = new Map()
    this.defaultTTL = defaultTTL
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })
  }

  get<T>(key: string): T | null {
    const item = this.store.get(key)
    
    if (!item) {
      return null
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.store.delete(key)
      return null
    }

    return item.data as T
  }

  has(key: string): boolean {
    const item = this.store.get(key)
    
    if (!item) {
      return false
    }

    // Check expiration
    if (Date.now() - item.timestamp > item.ttl) {
      this.store.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now()
    
    for (const [key, item] of this.store.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.store.delete(key)
      }
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    let activeItems = 0
    let totalSize = 0

    for (const [, item] of this.store.entries()) {
      if (now - item.timestamp <= item.ttl) {
        activeItems++
        totalSize += JSON.stringify(item.data).length
      }
    }

    return {
      activeItems,
      totalItems: this.store.size,
      approximateSizeInBytes: totalSize
    }
  }
}

// Create singleton instances for different cache types
export const apiCache = new Cache(5 * 60 * 1000) // 5 minutes for API responses
export const propertyCache = new Cache(30 * 60 * 1000) // 30 minutes for property lists
export const reportCache = new Cache(10 * 60 * 1000) // 10 minutes for reports

// Run cleanup every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup()
    propertyCache.cleanup()
    reportCache.cleanup()
  }, 60 * 1000)
}

// Cache key generators
export const cacheKeys = {
  analyticsData: (propertyId: string, dateRange: string, metrics?: string[]) => 
    `analytics:${propertyId}:${dateRange}:${metrics?.join(',') || 'default'}`,
  
  properties: (accountId: string) => 
    `properties:${accountId}`,
  
  realtimeData: (propertyId: string) => 
    `realtime:${propertyId}`,
  
  report: (reportType: string, propertyId: string, dateRange: string) =>
    `report:${reportType}:${propertyId}:${dateRange}`
}

// Decorator for caching function results
export function withCache<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args)
    
    // Check cache first
    const cached = apiCache.get(key)
    if (cached) {
      console.log(`Cache hit for key: ${key}`)
      return cached
    }
    
    // Call original function
    console.log(`Cache miss for key: ${key}`)
    const result = await fn(...args)
    
    // Store in cache
    apiCache.set(key, result, ttl)
    
    return result
  }) as T
}