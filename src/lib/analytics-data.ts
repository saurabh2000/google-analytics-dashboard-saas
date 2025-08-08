// Realistic Google Analytics sample data that changes based on connected property
import { apiCache, cacheKeys } from './cache'

export interface AnalyticsData {
  users: {
    total: number
    change: number
    trend: number[]
    labels: string[]
  }
  sessions: {
    total: number
    change: number
    trend: number[]
    labels: string[]
  }
  pageViews: {
    total: number
    change: number
    trend: number[]
    labels: string[]
  }
  avgSessionDuration: {
    total: string
    change: number
  }
  topPages: {
    labels: string[]
    data: number[]
  }
  trafficSources: {
    labels: string[]
    data: number[]
  }
  deviceTypes: {
    labels: string[]
    data: number[]
  }
  realTimeUsers: number
}

// Generate labels based on date range
const generateLabels = (dateRange: string = '30d'): string[] => {
  const labels = []
  let days = 30
  let stepSize = 1
  
  switch (dateRange) {
    case '7d':
      days = 7
      stepSize = 1
      break
    case '30d':
      days = 30
      stepSize = 1
      break
    case '90d':
      days = 90
      stepSize = 3 // Every 3 days for 90d range
      break
    case '1y':
      days = 365
      stepSize = 14 // Every 2 weeks for 1y range
      break
  }
  
  for (let i = days - 1; i >= 0; i -= stepSize) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    if (dateRange === '1y') {
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    } else if (dateRange === '90d') {
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    } else {
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    }
  }
  
  return labels
}

// Generate realistic trend data with some randomness
const generateTrend = (baseValue: number, dateRange: string = '30d', volatility: number = 0.2): number[] => {
  const trend = []
  let days = 30
  let stepSize = 1
  
  switch (dateRange) {
    case '7d':
      days = 7
      stepSize = 1
      break
    case '30d':
      days = 30
      stepSize = 1
      break
    case '90d':
      days = 90
      stepSize = 3
      break
    case '1y':
      days = 365
      stepSize = 14
      break
  }
  
  const dataPoints = Math.ceil(days / stepSize)
  let current = baseValue * 0.8 // Start lower
  
  for (let i = 0; i < dataPoints; i++) {
    // Add some growth trend with random variations
    const growth = 1 + (Math.random() - 0.5) * volatility + (i * 0.003) // Slight upward trend
    current *= growth
    trend.push(Math.round(current))
  }
  
  return trend
}

// Fetch analytics data from API (real or mock)
export const fetchAnalyticsData = async (
  propertyId?: string | null,
  propertyName?: string | null, 
  dateRange: string = '30d'
): Promise<{ data: AnalyticsData; isReal: boolean; message: string }> => {
  // Check cache first
  const cacheKey = cacheKeys.analyticsData(propertyId || propertyName || 'demo', dateRange)
  const cached = apiCache.get<{ data: AnalyticsData; isReal: boolean; message: string }>(cacheKey)
  
  if (cached) {
    return cached
  }
  try {
    const params = new URLSearchParams({
      dateRange,
      ...(propertyId && { propertyId }),
      ...(propertyName && { propertyName })
    })

    const response = await fetch(`/api/analytics/data?${params}`)
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch analytics data')
    }

    const response_data = {
      data: result.data,
      isReal: result.isReal || false,
      message: result.message || 'Analytics data loaded'
    }
    
    // Cache the successful response
    apiCache.set(cacheKey, response_data)
    
    return response_data
  } catch (error) {
    console.error('Failed to fetch analytics data:', error)
    // Fallback to mock data
    return {
      data: getAnalyticsData(propertyName, dateRange),
      isReal: false,
      message: 'Using fallback mock data due to API error'
    }
  }
}

export const getAnalyticsData = (propertyName: string | null, dateRange: string = '30d'): AnalyticsData => {
  // Check cache first
  const cacheKey = cacheKeys.analyticsData(propertyName || 'demo', dateRange)
  const cached = apiCache.get<AnalyticsData>(cacheKey)
  
  if (cached) {
    return cached
  }
  // Different data sets based on connected property
  const isEcommerce = propertyName === 'E-commerce Site'
  const isWebsite = propertyName === 'My Website'
  
  if (isEcommerce) {
    // E-commerce site data - higher numbers, commerce focus
    const multiplier = dateRange === '7d' ? 0.25 : dateRange === '90d' ? 3 : dateRange === '1y' ? 12 : 1
    return {
      users: {
        total: Math.round(28547 * multiplier),
        change: 18.7,
        trend: generateTrend(950, dateRange, 0.25),
        labels: generateLabels(dateRange)
      },
      sessions: {
        total: Math.round(45891 * multiplier),
        change: 15.2,
        trend: generateTrend(1530, dateRange, 0.3),
        labels: generateLabels(dateRange)
      },
      pageViews: {
        total: Math.round(127384 * multiplier),
        change: 22.1,
        trend: generateTrend(4200, dateRange, 0.35),
        labels: generateLabels(dateRange)
      },
      avgSessionDuration: {
        total: '4m 32s',
        change: 8.4
      },
      topPages: {
        labels: ['/products', '/checkout', '/cart', '/product/best-seller', '/category/electronics'],
        data: [8420, 6350, 5280, 4910, 3760]
      },
      trafficSources: {
        labels: ['Organic Search', 'Paid Search', 'Direct', 'Social Media', 'Email', 'Referral'],
        data: [12500, 8900, 7200, 4300, 3800, 2100]
      },
      deviceTypes: {
        labels: ['Mobile', 'Desktop', 'Tablet'],
        data: [18200, 15100, 5400]
      },
      realTimeUsers: 147
    }
  }
  
  if (isWebsite) {
    // Regular website data - moderate numbers, content focus
    const multiplier = dateRange === '7d' ? 0.25 : dateRange === '90d' ? 3 : dateRange === '1y' ? 12 : 1
    return {
      users: {
        total: Math.round(12543 * multiplier),
        change: 12.5,
        trend: generateTrend(410, dateRange, 0.2),
        labels: generateLabels(dateRange)
      },
      sessions: {
        total: Math.round(24891 * multiplier),
        change: 8.2,
        trend: generateTrend(830, dateRange, 0.25),
        labels: generateLabels(dateRange)
      },
      pageViews: {
        total: Math.round(89342 * multiplier),
        change: 15.8,
        trend: generateTrend(2950, dateRange, 0.3),
        labels: generateLabels(dateRange)
      },
      avgSessionDuration: {
        total: '3m 42s',
        change: -2.1
      },
      topPages: {
        labels: ['/home', '/about', '/services', '/blog', '/contact'],
        data: [15420, 8950, 6780, 5210, 3890]
      },
      trafficSources: {
        labels: ['Organic Search', 'Direct', 'Social Media', 'Referral', 'Email', 'Paid Search'],
        data: [8900, 4200, 3100, 2100, 1800, 1200]
      },
      deviceTypes: {
        labels: ['Mobile', 'Desktop', 'Tablet'],
        data: [14200, 8100, 2600]
      },
      realTimeUsers: 23
    }
  }
  
  // Default demo data when no property connected
  const multiplier = dateRange === '7d' ? 0.25 : dateRange === '90d' ? 3 : dateRange === '1y' ? 12 : 1
  return {
    users: {
      total: Math.round(5247 * multiplier),
      change: 5.3,
      trend: generateTrend(180, dateRange, 0.15),
      labels: generateLabels(dateRange)
    },
    sessions: {
      total: Math.round(9834 * multiplier),
      change: 7.1,
      trend: generateTrend(320, dateRange, 0.2),
      labels: generateLabels(dateRange)
    },
    pageViews: {
      total: Math.round(23456 * multiplier),
      change: 9.4,
      trend: generateTrend(780, dateRange, 0.25),
      labels: generateLabels(dateRange)
    },
    avgSessionDuration: {
      total: '2m 18s',
      change: 1.2
    },
    topPages: {
      labels: ['/demo', '/sample', '/example', '/test', '/placeholder'],
      data: [2340, 1850, 1420, 980, 650]
    },
    trafficSources: {
      labels: ['Demo Traffic', 'Sample Direct', 'Test Social', 'Example Referral'],
      data: [2800, 1600, 900, 534]
    },
    deviceTypes: {
      labels: ['Mobile', 'Desktop', 'Tablet'],
      data: [3200, 1800, 800]
    },
    realTimeUsers: 8
  }
}

// Enhanced version with caching
export const getCachedAnalyticsData = (propertyName: string | null, dateRange: string = '30d'): AnalyticsData => {
  const data = getAnalyticsData(propertyName, dateRange)
  
  // Store in cache
  const cacheKey = cacheKeys.analyticsData(propertyName || 'demo', dateRange)
  apiCache.set(cacheKey, data)
  
  return data
}