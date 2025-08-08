// Cohort analysis system for tracking user retention and lifetime value
export interface UserCohort {
  id: string
  name: string
  startDate: Date
  endDate: Date
  acquisitionChannel: string
  totalUsers: number
  definition: {
    period: 'daily' | 'weekly' | 'monthly'
    segmentBy: 'signup_date' | 'first_purchase' | 'first_session'
    filters: {
      source?: string
      campaign?: string
      country?: string
      deviceType?: string
    }
  }
}

export interface CohortPeriodData {
  period: number // 0 = initial period, 1 = period 1, etc.
  periodLabel: string // "Week 0", "Month 1", etc.
  activeUsers: number
  retentionRate: number
  revenuePerUser: number
  totalRevenue: number
  sessions: number
  avgSessionsPerUser: number
}

export interface CohortMetrics {
  cohortId: string
  cohortName: string
  startDate: Date
  initialUsers: number
  acquisitionChannel: string
  periods: CohortPeriodData[]
  summary: {
    day1Retention: number
    day7Retention: number
    day30Retention: number
    averageLifetimeValue: number
    customerLifetimeValue: number
    paybackPeriod: number // in days
    churnRate: number
  }
}

export interface RetentionHeatmap {
  cohorts: {
    cohortId: string
    cohortName: string
    startDate: string
    size: number
    retentionByPeriod: number[] // retention rates for each period
  }[]
  periods: string[] // ["Week 0", "Week 1", "Week 2", ...]
  maxPeriods: number
}

// Sample cohort data for demonstration
const sampleCohorts: UserCohort[] = [
  {
    id: 'cohort_2024_01',
    name: 'January 2024 Signups',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    acquisitionChannel: 'organic_search',
    totalUsers: 2450,
    definition: {
      period: 'weekly',
      segmentBy: 'signup_date',
      filters: {
        source: 'google'
      }
    }
  },
  {
    id: 'cohort_2024_02',
    name: 'February 2024 Signups',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-29'),
    acquisitionChannel: 'paid_social',
    totalUsers: 1890,
    definition: {
      period: 'weekly',
      segmentBy: 'signup_date',
      filters: {
        campaign: 'valentine-campaign'
      }
    }
  },
  {
    id: 'cohort_2024_03',
    name: 'March 2024 Signups',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-31'),
    acquisitionChannel: 'email_marketing',
    totalUsers: 3120,
    definition: {
      period: 'weekly',
      segmentBy: 'signup_date',
      filters: {
        source: 'newsletter'
      }
    }
  }
]

// Cohort Analysis Engine
export class CohortAnalyzer {
  private cohorts: UserCohort[] = sampleCohorts
  private metricsCache: Map<string, CohortMetrics> = new Map()

  // Create new cohort
  createCohort(cohortData: Omit<UserCohort, 'id'>): UserCohort {
    const cohort: UserCohort = {
      ...cohortData,
      id: `cohort_${Date.now()}`
    }
    
    this.cohorts.push(cohort)
    return cohort
  }

  // Get all cohorts
  getCohorts(): UserCohort[] {
    return [...this.cohorts]
  }

  // Generate cohort metrics with simulated data
  generateCohortMetrics(cohortId: string): CohortMetrics {
    const cohort = this.cohorts.find(c => c.id === cohortId)
    if (!cohort) {
      throw new Error(`Cohort ${cohortId} not found`)
    }

    // Check cache
    if (this.metricsCache.has(cohortId)) {
      return this.metricsCache.get(cohortId)!
    }

    // Calculate number of periods since cohort start
    const now = new Date()
    const periodsSinceStart = this.calculatePeriodsSince(cohort.startDate, now, cohort.definition.period)
    const maxPeriods = Math.min(periodsSinceStart, 12) // Limit to 12 periods for display

    // Generate period data with realistic retention curves
    const periods: CohortPeriodData[] = []
    let activeUsers = cohort.totalUsers

    for (let period = 0; period <= maxPeriods; period++) {
      // Simulate retention decay
      const retentionRate = this.calculateRetentionRate(period, cohort.acquisitionChannel)
      activeUsers = period === 0 ? cohort.totalUsers : Math.round(cohort.totalUsers * retentionRate)
      
      const revenuePerUser = this.calculateRevenuePerUser(period, cohort.acquisitionChannel)
      const sessionsPerUser = this.calculateSessionsPerUser(period)

      periods.push({
        period,
        periodLabel: this.getPeriodLabel(period, cohort.definition.period),
        activeUsers,
        retentionRate: period === 0 ? 100 : retentionRate * 100,
        revenuePerUser,
        totalRevenue: activeUsers * revenuePerUser,
        sessions: activeUsers * sessionsPerUser,
        avgSessionsPerUser: sessionsPerUser
      })
    }

    // Calculate summary metrics
    const day1Retention = periods[1]?.retentionRate || 0
    const day7Retention = cohort.definition.period === 'daily' ? 
      periods[7]?.retentionRate || 0 : 
      periods[1]?.retentionRate || 0
    const day30Retention = cohort.definition.period === 'daily' ? 
      periods[30]?.retentionRate || 0 : 
      cohort.definition.period === 'weekly' ? 
        periods[4]?.retentionRate || 0 : 
        periods[1]?.retentionRate || 0

    const totalRevenue = periods.reduce((sum, p) => sum + p.totalRevenue, 0)
    const averageLifetimeValue = totalRevenue / cohort.totalUsers
    const customerLifetimeValue = this.calculateCLV(periods, cohort.acquisitionChannel)
    const churnRate = 100 - (periods[periods.length - 1]?.retentionRate || 0)

    const metrics: CohortMetrics = {
      cohortId: cohort.id,
      cohortName: cohort.name,
      startDate: cohort.startDate,
      initialUsers: cohort.totalUsers,
      acquisitionChannel: cohort.acquisitionChannel,
      periods,
      summary: {
        day1Retention,
        day7Retention,
        day30Retention,
        averageLifetimeValue,
        customerLifetimeValue,
        paybackPeriod: this.calculatePaybackPeriod(periods, cohort.acquisitionChannel),
        churnRate
      }
    }

    // Cache the results
    this.metricsCache.set(cohortId, metrics)
    return metrics
  }

  // Generate retention heatmap data
  generateRetentionHeatmap(cohortIds: string[], maxPeriods: number = 12): RetentionHeatmap {
    const cohortMetrics = cohortIds.map(id => this.generateCohortMetrics(id))
    
    // Find common period structure
    const periods: string[] = []
    // Find sample period from the cohorts, default to weekly
    const sampleCohort = this.cohorts.find(c => cohortIds.includes(c.id))
    const samplePeriod = sampleCohort?.definition.period || 'weekly'
    
    for (let i = 0; i <= maxPeriods; i++) {
      periods.push(this.getPeriodLabel(i, samplePeriod))
    }

    const cohorts = cohortMetrics.map(metrics => ({
      cohortId: metrics.cohortId,
      cohortName: metrics.cohortName,
      startDate: metrics.startDate.toISOString().split('T')[0],
      size: metrics.initialUsers,
      retentionByPeriod: periods.map((_, index) => {
        const period = metrics.periods.find(p => p.period === index)
        return period ? period.retentionRate : 0
      })
    }))

    return {
      cohorts,
      periods,
      maxPeriods
    }
  }

  // Compare cohorts
  compareCohorts(cohortIds: string[]): {
    cohorts: CohortMetrics[]
    comparison: {
      metric: string
      values: { cohortId: string; value: number }[]
      winner: string
      improvement: number
    }[]
  } {
    const cohorts = cohortIds.map(id => this.generateCohortMetrics(id))
    
    const metrics = [
      'day1Retention',
      'day7Retention',
      'day30Retention',
      'averageLifetimeValue',
      'customerLifetimeValue'
    ]

    const comparison = metrics.map(metric => {
      const values = cohorts.map(cohort => ({
        cohortId: cohort.cohortId,
        value: cohort.summary[metric as keyof typeof cohort.summary] as number
      }))
      
      const sortedValues = [...values].sort((a, b) => b.value - a.value)
      const winner = sortedValues[0].cohortId
      const improvement = sortedValues.length > 1 ? 
        ((sortedValues[0].value - sortedValues[1].value) / sortedValues[1].value) * 100 : 0

      return {
        metric,
        values,
        winner,
        improvement
      }
    })

    return { cohorts, comparison }
  }

  // Calculate retention curve patterns
  getRetentionCurve(cohortId: string): {
    curve: { period: number; retention: number }[]
    pattern: 'healthy' | 'declining' | 'flat' | 'recovering'
    recommendation: string
  } {
    const metrics = this.generateCohortMetrics(cohortId)
    const curve = metrics.periods.map(p => ({
      period: p.period,
      retention: p.retentionRate
    }))

    // Analyze pattern
    let pattern: 'healthy' | 'declining' | 'flat' | 'recovering' = 'healthy'
    let recommendation = ''

    if (curve.length >= 3) {
      const early = curve.slice(1, 3).reduce((avg, p) => avg + p.retention, 0) / 2
      const late = curve.slice(-2).reduce((avg, p) => avg + p.retention, 0) / 2
      
      const change = ((late - early) / early) * 100

      if (change < -10) {
        pattern = 'declining'
        recommendation = 'Focus on user engagement and product improvements to reduce churn'
      } else if (change > 10) {
        pattern = 'recovering'
        recommendation = 'Great improvement trend! Double down on recent initiatives'
      } else if (Math.abs(change) <= 5) {
        pattern = 'flat'
        recommendation = 'Retention is stable but could be optimized with targeted interventions'
      } else {
        pattern = 'healthy'
        recommendation = 'Solid retention curve. Monitor for sustained performance'
      }
    }

    return { curve, pattern, recommendation }
  }

  // Private helper methods
  private calculatePeriodsSince(startDate: Date, endDate: Date, period: 'daily' | 'weekly' | 'monthly'): number {
    const diffTime = endDate.getTime() - startDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    switch (period) {
      case 'daily': return diffDays
      case 'weekly': return Math.floor(diffDays / 7)
      case 'monthly': return Math.floor(diffDays / 30)
      default: return diffDays
    }
  }

  private getPeriodLabel(period: number, periodType: 'daily' | 'weekly' | 'monthly'): string {
    switch (periodType) {
      case 'daily': return `Day ${period}`
      case 'weekly': return `Week ${period}`
      case 'monthly': return `Month ${period}`
      default: return `Period ${period}`
    }
  }

  private calculateRetentionRate(period: number, channel: string): number {
    // Different retention curves based on acquisition channel
    const baseRetention = {
      'organic_search': 0.85,
      'paid_social': 0.75,
      'email_marketing': 0.90,
      'direct': 0.88,
      'referral': 0.82
    }[channel] || 0.80

    // Exponential decay with some recovery
    if (period === 0) return 1.0
    
    const decay = Math.pow(baseRetention, period)
    const recovery = 1 + (0.05 * Math.sin(period * 0.5)) // Small oscillation
    
    return Math.max(0.05, decay * recovery) // Minimum 5% retention
  }

  private calculateRevenuePerUser(period: number, channel: string): number {
    // Revenue typically increases over time as users become more engaged
    const baseRevenue = {
      'organic_search': 25,
      'paid_social': 18,
      'email_marketing': 32,
      'direct': 28,
      'referral': 22
    }[channel] || 20

    // Revenue grows with engagement but plateaus
    const growth = 1 + (period * 0.15) // 15% growth per period
    const plateau = Math.min(growth, 2.5) // Max 2.5x growth
    
    return baseRevenue * plateau
  }

  private calculateSessionsPerUser(period: number): number {
    // Sessions per user typically decrease over time
    const baseSessions = 3.2
    const decay = Math.pow(0.95, period) // 5% decay per period
    return Math.max(0.5, baseSessions * decay)
  }

  private calculateCLV(periods: CohortPeriodData[], channel: string): number {
    // Calculate Customer Lifetime Value using predicted future revenue
    const currentRevenue = periods.reduce((sum, p) => sum + p.revenuePerUser, 0)
    
    // Project future revenue based on retention trend
    const lastRetention = periods[periods.length - 1]?.retentionRate || 0
    const projectedPeriods = 12 - periods.length
    
    let projectedRevenue = 0
    for (let i = 0; i < projectedPeriods; i++) {
      const futureRetention = Math.max(0.01, lastRetention * Math.pow(0.95, i))
      const futureRevenuePerUser = this.calculateRevenuePerUser(periods.length + i, channel)
      projectedRevenue += futureRevenuePerUser * (futureRetention / 100)
    }
    
    return currentRevenue + projectedRevenue
  }

  private calculatePaybackPeriod(periods: CohortPeriodData[], channel: string): number {
    // Assume acquisition cost based on channel
    const acquisitionCost = {
      'organic_search': 15,
      'paid_social': 35,
      'email_marketing': 8,
      'direct': 5,
      'referral': 12
    }[channel] || 20

    let cumulativeRevenue = 0
    for (let i = 0; i < periods.length; i++) {
      cumulativeRevenue += periods[i].revenuePerUser
      if (cumulativeRevenue >= acquisitionCost) {
        return i * (periods[0]?.period === 0 ? 7 : 30) // Convert to days
      }
    }
    
    return periods.length * 30 // If not paid back, return full period in days
  }

  // Get acquisition channel performance
  getChannelPerformance(): {
    channel: string
    cohorts: number
    totalUsers: number
    avgRetention: {
      day1: number
      day7: number
      day30: number
    }
    avgCLV: number
    avgPayback: number
  }[] {
    const channelGroups = new Map<string, UserCohort[]>()
    
    this.cohorts.forEach(cohort => {
      const channel = cohort.acquisitionChannel
      if (!channelGroups.has(channel)) {
        channelGroups.set(channel, [])
      }
      channelGroups.get(channel)!.push(cohort)
    })

    return Array.from(channelGroups.entries()).map(([channel, cohorts]) => {
      const metrics = cohorts.map(c => this.generateCohortMetrics(c.id))
      
      return {
        channel,
        cohorts: cohorts.length,
        totalUsers: cohorts.reduce((sum, c) => sum + c.totalUsers, 0),
        avgRetention: {
          day1: metrics.reduce((avg, m) => avg + m.summary.day1Retention, 0) / metrics.length,
          day7: metrics.reduce((avg, m) => avg + m.summary.day7Retention, 0) / metrics.length,
          day30: metrics.reduce((avg, m) => avg + m.summary.day30Retention, 0) / metrics.length
        },
        avgCLV: metrics.reduce((avg, m) => avg + m.summary.customerLifetimeValue, 0) / metrics.length,
        avgPayback: metrics.reduce((avg, m) => avg + m.summary.paybackPeriod, 0) / metrics.length
      }
    }).sort((a, b) => b.avgCLV - a.avgCLV)
  }
}

// Export singleton instance
export const cohortAnalyzer = new CohortAnalyzer()
export default cohortAnalyzer