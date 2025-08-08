// Mock segment data for demo purposes
export interface Segment {
  id: string
  name: string
  type: 'behavioral' | 'demographic' | 'geographic' | 'technographic'
  users: number
  conversions: number
  avgSessionDuration: number // in seconds
  bounceRate: number // 0-1
  conditions: SegmentCondition[]
  created: Date
  lastUpdated: Date
}

export interface SegmentCondition {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: string | number | string[]
}

export const segments: Segment[] = [
  {
    id: 'segment-mobile-users',
    name: 'Mobile Users',
    type: 'technographic',
    users: 15420,
    conversions: 924,
    avgSessionDuration: 145,
    bounceRate: 0.42,
    conditions: [
      { field: 'device_type', operator: 'equals', value: 'mobile' }
    ],
    created: new Date('2024-01-15'),
    lastUpdated: new Date('2024-01-20')
  },
  {
    id: 'segment-returning-visitors',
    name: 'Returning Visitors',
    type: 'behavioral',
    users: 8750,
    conversions: 1225,
    avgSessionDuration: 235,
    bounceRate: 0.28,
    conditions: [
      { field: 'session_count', operator: 'greater_than', value: 1 }
    ],
    created: new Date('2024-01-10'),
    lastUpdated: new Date('2024-01-18')
  },
  {
    id: 'segment-high-value',
    name: 'High-Value Customers',
    type: 'behavioral',
    users: 2340,
    conversions: 468,
    avgSessionDuration: 420,
    bounceRate: 0.15,
    conditions: [
      { field: 'total_revenue', operator: 'greater_than', value: 500 }
    ],
    created: new Date('2024-01-05'),
    lastUpdated: new Date('2024-01-22')
  },
  {
    id: 'segment-millennials',
    name: 'Millennials (25-40)',
    type: 'demographic',
    users: 12680,
    conversions: 634,
    avgSessionDuration: 180,
    bounceRate: 0.38,
    conditions: [
      { field: 'age', operator: 'greater_than', value: 25 },
      { field: 'age', operator: 'less_than', value: 40 }
    ],
    created: new Date('2024-01-08'),
    lastUpdated: new Date('2024-01-19')
  },
  {
    id: 'segment-us-users',
    name: 'US Users',
    type: 'geographic',
    users: 18920,
    conversions: 1136,
    avgSessionDuration: 195,
    bounceRate: 0.35,
    conditions: [
      { field: 'country', operator: 'equals', value: 'US' }
    ],
    created: new Date('2024-01-12'),
    lastUpdated: new Date('2024-01-21')
  },
  {
    id: 'segment-cart-abandoners',
    name: 'Cart Abandoners',
    type: 'behavioral',
    users: 5670,
    conversions: 283,
    avgSessionDuration: 320,
    bounceRate: 0.52,
    conditions: [
      { field: 'event', operator: 'equals', value: 'add_to_cart' },
      { field: 'event', operator: 'not_in', value: ['purchase', 'checkout'] }
    ],
    created: new Date('2024-01-14'),
    lastUpdated: new Date('2024-01-23')
  },
  {
    id: 'segment-chrome-users',
    name: 'Chrome Users',
    type: 'technographic',
    users: 22450,
    conversions: 1347,
    avgSessionDuration: 165,
    bounceRate: 0.33,
    conditions: [
      { field: 'browser', operator: 'equals', value: 'Chrome' }
    ],
    created: new Date('2024-01-07'),
    lastUpdated: new Date('2024-01-20')
  },
  {
    id: 'segment-weekend-browsers',
    name: 'Weekend Browsers',
    type: 'behavioral',
    users: 9840,
    conversions: 492,
    avgSessionDuration: 210,
    bounceRate: 0.29,
    conditions: [
      { field: 'day_of_week', operator: 'in', value: ['Saturday', 'Sunday'] }
    ],
    created: new Date('2024-01-16'),
    lastUpdated: new Date('2024-01-24')
  }
]

// Calculate segment performance metrics
export function calculateSegmentMetrics(segment: Segment) {
  const conversionRate = segment.conversions / segment.users
  const avgSessionMinutes = Math.floor(segment.avgSessionDuration / 60)
  const avgSessionSeconds = segment.avgSessionDuration % 60
  
  return {
    id: segment.id,
    name: segment.name,
    type: segment.type,
    users: segment.users,
    conversionRate: conversionRate * 100,
    avgSessionDuration: `${avgSessionMinutes}m ${avgSessionSeconds}s`,
    bounceRate: segment.bounceRate * 100,
    performance: getPerformanceRating(conversionRate, segment.bounceRate),
    revenueEstimate: segment.conversions * 45 // Mock revenue per conversion
  }
}

// Get performance rating based on conversion rate and bounce rate
export function getPerformanceRating(conversionRate: number, bounceRate: number): 'excellent' | 'good' | 'average' | 'poor' {
  const score = (conversionRate * 100) - (bounceRate * 50)
  
  if (score > 10) return 'excellent'
  if (score > 5) return 'good'
  if (score > 0) return 'average'
  return 'poor'
}

// Get segments by type
export function getSegmentsByType(type: Segment['type']) {
  return segments.filter(segment => segment.type === type)
}

// Get top performing segments
export function getTopSegments(limit: number = 5) {
  return segments
    .map(segment => ({
      ...segment,
      metrics: calculateSegmentMetrics(segment)
    }))
    .sort((a, b) => b.metrics.conversionRate - a.metrics.conversionRate)
    .slice(0, limit)
}

// Search segments by name or conditions
export function searchSegments(query: string) {
  const lowercaseQuery = query.toLowerCase()
  return segments.filter(segment => 
    segment.name.toLowerCase().includes(lowercaseQuery) ||
    segment.conditions.some(condition => 
      condition.field.toLowerCase().includes(lowercaseQuery) ||
      condition.value.toString().toLowerCase().includes(lowercaseQuery)
    )
  )
}

// Create a new segment (mock function)
export function createSegment(segmentData: Omit<Segment, 'id' | 'created' | 'lastUpdated'>) {
  const newSegment: Segment = {
    ...segmentData,
    id: `segment-${Date.now()}`,
    created: new Date(),
    lastUpdated: new Date()
  }
  
  // In a real app, this would save to the database
  console.log('Creating new segment:', newSegment)
  return newSegment
}

// Update segment (mock function)
export function updateSegment(segmentId: string, updates: Partial<Segment>) {
  const segmentIndex = segments.findIndex(s => s.id === segmentId)
  if (segmentIndex === -1) {
    throw new Error('Segment not found')
  }
  
  const updatedSegment = {
    ...segments[segmentIndex],
    ...updates,
    lastUpdated: new Date()
  }
  
  // In a real app, this would update the database
  console.log('Updating segment:', updatedSegment)
  return updatedSegment
}

// Get segment analysis insights
export function getSegmentInsights() {
  const allMetrics = segments.map(calculateSegmentMetrics)
  const totalUsers = segments.reduce((sum, s) => sum + s.users, 0)
  const avgConversionRate = allMetrics.reduce((sum, m) => sum + m.conversionRate, 0) / allMetrics.length
  
  const bestPerforming = allMetrics.reduce((best, current) => 
    current.conversionRate > best.conversionRate ? current : best
  )
  
  const worstPerforming = allMetrics.reduce((worst, current) => 
    current.conversionRate < worst.conversionRate ? current : worst
  )
  
  return {
    totalSegments: segments.length,
    totalUsers,
    avgConversionRate,
    bestPerforming,
    worstPerforming,
    typeDistribution: {
      behavioral: getSegmentsByType('behavioral').length,
      demographic: getSegmentsByType('demographic').length,
      geographic: getSegmentsByType('geographic').length,
      technographic: getSegmentsByType('technographic').length
    }
  }
}