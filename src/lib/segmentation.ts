// Advanced user segmentation system for analytics
export interface SegmentCriteria {
  id: string
  name: string
  description: string
  type: 'geographic' | 'demographic' | 'behavioral' | 'technographic' | 'custom'
  
  // Geographic criteria
  countries?: string[]
  regions?: string[]
  cities?: string[]
  
  // Demographic criteria  
  ageGroups?: ('18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+')[]
  genders?: ('male' | 'female' | 'other')[]
  languages?: string[]
  
  // Behavioral criteria
  sessionCount?: { min?: number; max?: number }
  sessionDuration?: { min?: number; max?: number } // in minutes
  pageViewCount?: { min?: number; max?: number }
  conversionStatus?: ('converted' | 'not-converted' | 'abandoned-cart')[]
  acquisitionChannels?: ('organic_search' | 'paid_search' | 'social_media' | 'email' | 'direct' | 'referral')[]
  
  // Technographic criteria
  deviceTypes?: ('desktop' | 'mobile' | 'tablet')[]
  operatingSystems?: ('windows' | 'macos' | 'ios' | 'android' | 'linux')[]
  browsers?: ('chrome' | 'firefox' | 'safari' | 'edge' | 'other')[]
  
  // Time-based criteria
  dateRange?: { start: Date; end: Date }
  dayOfWeek?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[]
  timeOfDay?: { start: string; end: string } // "HH:MM" format
  
  // Custom criteria
  customEvents?: {
    eventName: string
    propertyName?: string
    propertyValue?: string | number
    operator?: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
  }[]
}

export interface UserSegment {
  id: string
  name: string
  description: string
  criteria: SegmentCriteria[]
  operator: 'AND' | 'OR' // How to combine multiple criteria
  isActive: boolean
  createdAt: Date
  lastUpdated: Date
  userCount?: number
  
  // Computed metrics for the segment
  metrics?: {
    totalUsers: number
    sessions: number
    pageViews: number
    bounceRate: number
    avgSessionDuration: number
    conversionRate: number
    revenue: number
    topCountries: { country: string; users: number }[]
    topDevices: { device: string; users: number }[]
    topSources: { source: string; users: number }[]
  }
}

export interface SegmentComparison {
  segments: UserSegment[]
  metrics: {
    segmentId: string
    segmentName: string
    users: number
    sessions: number
    conversionRate: number
    revenue: number
    avgSessionDuration: number
    bounceRate: number
  }[]
  insights: {
    bestPerforming: string // segment ID
    fastestGrowing: string // segment ID
    highestValue: string // segment ID
    recommendations: string[]
  }
}

export interface GeographicInsights {
  topCountries: {
    country: string
    countryCode: string
    users: number
    sessions: number
    revenue: number
    conversionRate: number
    growth: number // percentage change
  }[]
  topCities: {
    city: string
    country: string
    users: number
    sessions: number
    revenue: number
  }[]
  regionalPerformance: {
    region: string
    users: number
    conversionRate: number
    revenue: number
    marketPenetration: number
  }[]
}

// Sample segment data
const sampleSegments: UserSegment[] = [
  {
    id: 'seg_high_value_users',
    name: 'High-Value Users',
    description: 'Users who have made multiple purchases and high session engagement',
    criteria: [
      {
        id: 'criteria_1',
        name: 'Multiple Sessions',
        description: 'Users with 5+ sessions',
        type: 'behavioral',
        sessionCount: { min: 5 },
        conversionStatus: ['converted']
      }
    ],
    operator: 'AND',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    lastUpdated: new Date(),
    userCount: 3420,
    metrics: {
      totalUsers: 3420,
      sessions: 25680,
      pageViews: 128400,
      bounceRate: 0.15,
      avgSessionDuration: 485,
      conversionRate: 12.8,
      revenue: 156800,
      topCountries: [
        { country: 'United States', users: 1368 },
        { country: 'Canada', users: 478 },
        { country: 'United Kingdom', users: 342 }
      ],
      topDevices: [
        { device: 'desktop', users: 2052 },
        { device: 'mobile', users: 1026 },
        { device: 'tablet', users: 342 }
      ],
      topSources: [
        { source: 'organic_search', users: 1368 },
        { source: 'direct', users: 820 },
        { source: 'email', users: 684 }
      ]
    }
  },
  {
    id: 'seg_mobile_users',
    name: 'Mobile-First Users',
    description: 'Users primarily accessing via mobile devices',
    criteria: [
      {
        id: 'criteria_2',
        name: 'Mobile Device',
        description: 'Users on mobile devices',
        type: 'technographic',
        deviceTypes: ['mobile']
      }
    ],
    operator: 'AND',
    isActive: true,
    createdAt: new Date('2024-01-20'),
    lastUpdated: new Date(),
    userCount: 8940,
    metrics: {
      totalUsers: 8940,
      sessions: 26820,
      pageViews: 80460,
      bounceRate: 0.42,
      avgSessionDuration: 185,
      conversionRate: 3.2,
      revenue: 28600,
      topCountries: [
        { country: 'United States', users: 2682 },
        { country: 'India', users: 1788 },
        { country: 'Brazil', users: 1341 }
      ],
      topDevices: [
        { device: 'mobile', users: 8940 }
      ],
      topSources: [
        { source: 'social_media', users: 3576 },
        { source: 'organic_search', users: 2682 },
        { source: 'paid_search', users: 1788 }
      ]
    }
  },
  {
    id: 'seg_european_users',
    name: 'European Market',
    description: 'Users from European countries',
    criteria: [
      {
        id: 'criteria_3',
        name: 'European Countries',
        description: 'Users from EU countries',
        type: 'geographic',
        countries: ['Germany', 'France', 'United Kingdom', 'Italy', 'Spain', 'Netherlands']
      }
    ],
    operator: 'AND',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    lastUpdated: new Date(),
    userCount: 5680,
    metrics: {
      totalUsers: 5680,
      sessions: 19380,
      pageViews: 77520,
      bounceRate: 0.28,
      avgSessionDuration: 268,
      conversionRate: 6.4,
      revenue: 78200,
      topCountries: [
        { country: 'Germany', users: 1420 },
        { country: 'France', users: 1136 },
        { country: 'United Kingdom', users: 1024 }
      ],
      topDevices: [
        { device: 'desktop', users: 3408 },
        { device: 'mobile', users: 1704 },
        { device: 'tablet', users: 568 }
      ],
      topSources: [
        { source: 'organic_search', users: 2272 },
        { source: 'direct', users: 1704 },
        { source: 'social_media', users: 1136 }
      ]
    }
  }
]

// Segmentation Analysis Engine
export class SegmentationAnalyzer {
  private segments: UserSegment[] = sampleSegments
  private geographicData: GeographicInsights

  constructor() {
    this.geographicData = this.generateGeographicInsights()
  }

  // Create new segment
  createSegment(segmentData: Omit<UserSegment, 'id' | 'createdAt' | 'lastUpdated'>): UserSegment {
    const segment: UserSegment = {
      ...segmentData,
      id: `seg_${Date.now()}`,
      createdAt: new Date(),
      lastUpdated: new Date()
    }
    
    this.segments.push(segment)
    return segment
  }

  // Get all segments
  getSegments(): UserSegment[] {
    return [...this.segments]
  }

  // Get segment by ID
  getSegment(segmentId: string): UserSegment | null {
    return this.segments.find(s => s.id === segmentId) || null
  }

  // Update segment metrics (simulate real calculation)
  updateSegmentMetrics(segmentId: string): UserSegment {
    const segment = this.segments.find(s => s.id === segmentId)
    if (!segment) throw new Error(`Segment ${segmentId} not found`)

    // Simulate metrics calculation based on criteria
    const simulatedMetrics = this.calculateSegmentMetrics(segment.criteria)
    segment.metrics = simulatedMetrics
    segment.lastUpdated = new Date()
    
    return segment
  }

  // Compare multiple segments
  compareSegments(segmentIds: string[]): SegmentComparison {
    const segments = segmentIds.map(id => this.getSegment(id)).filter(Boolean) as UserSegment[]
    
    const metrics = segments.map(segment => ({
      segmentId: segment.id,
      segmentName: segment.name,
      users: segment.metrics?.totalUsers || 0,
      sessions: segment.metrics?.sessions || 0,
      conversionRate: segment.metrics?.conversionRate || 0,
      revenue: segment.metrics?.revenue || 0,
      avgSessionDuration: segment.metrics?.avgSessionDuration || 0,
      bounceRate: segment.metrics?.bounceRate || 0
    }))

    // Find best performing segments
    const bestConversion = metrics.reduce((best, current) => 
      current.conversionRate > best.conversionRate ? current : best
    )
    const highestRevenue = metrics.reduce((best, current) => 
      current.revenue > best.revenue ? current : best
    )
    const bestEngagement = metrics.reduce((best, current) => 
      current.avgSessionDuration > best.avgSessionDuration ? current : best
    )

    const recommendations = this.generateSegmentRecommendations(metrics)

    return {
      segments,
      metrics,
      insights: {
        bestPerforming: bestConversion.segmentId,
        fastestGrowing: bestConversion.segmentId, // Simplified
        highestValue: highestRevenue.segmentId,
        recommendations
      }
    }
  }

  // Get geographic insights
  getGeographicInsights(): GeographicInsights {
    return this.geographicData
  }

  // Get behavioral segments
  getBehavioralSegments(): {
    highEngagement: UserSegment[]
    lowEngagement: UserSegment[]
    converters: UserSegment[]
    bounced: UserSegment[]
  } {
    return {
      highEngagement: this.segments.filter(s => 
        s.metrics && s.metrics.avgSessionDuration > 300
      ),
      lowEngagement: this.segments.filter(s => 
        s.metrics && s.metrics.avgSessionDuration < 120
      ),
      converters: this.segments.filter(s => 
        s.metrics && s.metrics.conversionRate > 5
      ),
      bounced: this.segments.filter(s => 
        s.metrics && s.metrics.bounceRate > 0.6
      )
    }
  }

  // Get device segments
  getDeviceSegments(): {
    mobile: number
    desktop: number
    tablet: number
  } {
    const mobileUsers = this.segments
      .filter(s => s.criteria.some(c => c.deviceTypes?.includes('mobile')))
      .reduce((sum, s) => sum + (s.metrics?.totalUsers || 0), 0)
    
    const desktopUsers = this.segments
      .filter(s => s.criteria.some(c => c.deviceTypes?.includes('desktop')))
      .reduce((sum, s) => sum + (s.metrics?.totalUsers || 0), 0)
    
    const tabletUsers = this.segments
      .filter(s => s.criteria.some(c => c.deviceTypes?.includes('tablet')))
      .reduce((sum, s) => sum + (s.metrics?.totalUsers || 0), 0)

    return { mobile: mobileUsers, desktop: desktopUsers, tablet: tabletUsers }
  }

  // Generate segment recommendations
  private generateSegmentRecommendations(metrics: SegmentComparison['metrics']): string[] {
    const recommendations: string[] = []
    
    // High-performing segments
    const topSegment = metrics.reduce((best, current) => 
      current.conversionRate > best.conversionRate ? current : best
    )
    recommendations.push(`Focus marketing efforts on "${topSegment.segmentName}" - highest conversion rate at ${topSegment.conversionRate.toFixed(1)}%`)

    // Low-performing segments
    const lowPerformer = metrics.reduce((worst, current) => 
      current.conversionRate < worst.conversionRate ? current : worst
    )
    if (lowPerformer.conversionRate < 2) {
      recommendations.push(`Optimize "${lowPerformer.segmentName}" segment - conversion rate only ${lowPerformer.conversionRate.toFixed(1)}%`)
    }

    // Revenue insights
    const highRevenue = metrics.reduce((best, current) => 
      current.revenue > best.revenue ? current : best
    )
    recommendations.push(`"${highRevenue.segmentName}" generates highest revenue ($${highRevenue.revenue.toLocaleString()}) - consider premium targeting`)

    // Engagement insights
    const highEngagement = metrics.reduce((best, current) => 
      current.avgSessionDuration > best.avgSessionDuration ? current : best
    )
    recommendations.push(`"${highEngagement.segmentName}" shows high engagement - ideal for content marketing campaigns`)

    return recommendations
  }

  // Generate geographic insights (simulated data)
  private generateGeographicInsights(): GeographicInsights {
    return {
      topCountries: [
        {
          country: 'United States',
          countryCode: 'US',
          users: 12450,
          sessions: 45680,
          revenue: 234500,
          conversionRate: 5.8,
          growth: 12.3
        },
        {
          country: 'Germany',
          countryCode: 'DE',
          users: 6780,
          sessions: 23400,
          revenue: 156700,
          conversionRate: 7.2,
          growth: 18.7
        },
        {
          country: 'United Kingdom',
          countryCode: 'GB',
          users: 5890,
          sessions: 21200,
          revenue: 134200,
          conversionRate: 6.4,
          growth: 8.9
        },
        {
          country: 'France',
          countryCode: 'FR',
          users: 4560,
          sessions: 16800,
          revenue: 98400,
          conversionRate: 5.9,
          growth: 15.2
        },
        {
          country: 'Canada',
          countryCode: 'CA',
          users: 3890,
          sessions: 14200,
          revenue: 87600,
          conversionRate: 6.1,
          growth: 9.8
        }
      ],
      topCities: [
        { city: 'New York', country: 'United States', users: 2890, sessions: 10400, revenue: 52800 },
        { city: 'London', country: 'United Kingdom', users: 2340, sessions: 8760, revenue: 48200 },
        { city: 'Berlin', country: 'Germany', users: 1980, sessions: 7200, revenue: 41600 },
        { city: 'Paris', country: 'France', users: 1670, sessions: 6200, revenue: 34800 },
        { city: 'Toronto', country: 'Canada', users: 1450, sessions: 5400, revenue: 29200 }
      ],
      regionalPerformance: [
        { region: 'North America', users: 16340, conversionRate: 5.9, revenue: 322100, marketPenetration: 23.4 },
        { region: 'Europe', users: 19240, conversionRate: 6.8, revenue: 389300, marketPenetration: 31.2 },
        { region: 'Asia Pacific', users: 8960, conversionRate: 4.2, revenue: 124600, marketPenetration: 8.7 },
        { region: 'Latin America', users: 3470, conversionRate: 3.8, revenue: 45200, marketPenetration: 4.1 }
      ]
    }
  }

  // Simulate metrics calculation
  private calculateSegmentMetrics(criteria: SegmentCriteria[]): UserSegment['metrics'] {
    // In a real implementation, this would query actual data
    // For demo purposes, we'll generate realistic simulated data
    
    const baseUsers = Math.floor(Math.random() * 10000) + 1000
    const sessionsPerUser = 2.3 + (Math.random() * 2)
    const pageViewsPerSession = 3.2 + (Math.random() * 2.8)
    
    const sessions = Math.floor(baseUsers * sessionsPerUser)
    const pageViews = Math.floor(sessions * pageViewsPerSession)
    const bounceRate = 0.25 + (Math.random() * 0.4)
    const avgSessionDuration = 120 + (Math.random() * 300)
    const conversionRate = 2 + (Math.random() * 8)
    const revenuePerUser = 15 + (Math.random() * 35)
    
    return {
      totalUsers: baseUsers,
      sessions,
      pageViews,
      bounceRate,
      avgSessionDuration,
      conversionRate,
      revenue: Math.floor(baseUsers * revenuePerUser),
      topCountries: [
        { country: 'United States', users: Math.floor(baseUsers * 0.4) },
        { country: 'Germany', users: Math.floor(baseUsers * 0.2) },
        { country: 'United Kingdom', users: Math.floor(baseUsers * 0.15) }
      ],
      topDevices: [
        { device: 'desktop', users: Math.floor(baseUsers * 0.6) },
        { device: 'mobile', users: Math.floor(baseUsers * 0.3) },
        { device: 'tablet', users: Math.floor(baseUsers * 0.1) }
      ],
      topSources: [
        { source: 'organic_search', users: Math.floor(baseUsers * 0.35) },
        { source: 'direct', users: Math.floor(baseUsers * 0.25) },
        { source: 'social_media', users: Math.floor(baseUsers * 0.2) }
      ]
    }
  }

  // Get predefined segment templates
  getSegmentTemplates(): Partial<UserSegment>[] {
    return [
      {
        name: 'High-Value Customers',
        description: 'Users with multiple purchases and high engagement',
        criteria: [{
          id: 'template_1',
          name: 'High Value Criteria',
          description: 'Multiple sessions and conversions',
          type: 'behavioral',
          sessionCount: { min: 5 },
          conversionStatus: ['converted']
        }]
      },
      {
        name: 'Mobile Users',
        description: 'Users primarily on mobile devices',
        criteria: [{
          id: 'template_2',
          name: 'Mobile Device',
          description: 'Mobile device users',
          type: 'technographic',
          deviceTypes: ['mobile']
        }]
      },
      {
        name: 'European Market',
        description: 'Users from European countries',
        criteria: [{
          id: 'template_3',
          name: 'EU Countries',
          description: 'European geography',
          type: 'geographic',
          countries: ['Germany', 'France', 'United Kingdom', 'Italy', 'Spain']
        }]
      },
      {
        name: 'Cart Abandoners',
        description: 'Users who abandoned their shopping cart',
        criteria: [{
          id: 'template_4',
          name: 'Abandoned Cart',
          description: 'Cart abandonment behavior',
          type: 'behavioral',
          conversionStatus: ['abandoned-cart']
        }]
      },
      {
        name: 'Weekend Visitors',
        description: 'Users who visit primarily on weekends',
        criteria: [{
          id: 'template_5',
          name: 'Weekend Days',
          description: 'Weekend visitor behavior',
          type: 'behavioral',
          dayOfWeek: ['saturday', 'sunday']
        }]
      }
    ]
  }
}

// Export singleton instance
export const segmentationAnalyzer = new SegmentationAnalyzer()
export default segmentationAnalyzer