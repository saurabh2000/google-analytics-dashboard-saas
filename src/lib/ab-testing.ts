// A/B Testing system for comparing campaign performance
import { calculateStatisticalSignificance, calculateConfidenceInterval } from './statistics'

export interface ABTestVariant {
  id: string
  name: string
  description: string
  trafficAllocation: number // percentage (0-100)
  
  // Campaign configuration
  campaignType: 'paid-search' | 'social-media' | 'email' | 'display' | 'content'
  targetUrl: string
  utmParams: {
    source: string
    medium: string
    campaign: string
    term?: string
    content?: string
  }
  
  // Performance metrics
  metrics: {
    impressions: number
    clicks: number
    sessions: number
    users: number
    pageViews: number
    bounceRate: number
    avgSessionDuration: number
    goalCompletions: number
    conversionRate: number
    revenue?: number
    costPerClick?: number
    costPerAcquisition?: number
  }
  
  // Time-based data
  dailyMetrics: {
    date: string
    impressions: number
    clicks: number
    sessions: number
    conversions: number
    revenue: number
  }[]
  
  createdAt: Date
  lastUpdated: Date
}

export interface ABTest {
  id: string
  name: string
  description: string
  objective: 'conversion' | 'revenue' | 'engagement' | 'traffic'
  
  // Test configuration
  startDate: Date
  endDate: Date
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled'
  confidenceLevel: number // 90, 95, 99
  minimumDetectableEffect: number // percentage
  powerAnalysis: number // statistical power (80%, 90%)
  
  // Test variants
  variants: ABTestVariant[]
  controlVariantId: string
  
  // Test results
  results: {
    winner?: string
    statistical: {
      significance: number
      pValue: number
      confidenceInterval: {
        lower: number
        upper: number
      }
      effect: number
      recommendation: 'continue' | 'stop_winner' | 'stop_inconclusive' | 'extend_test'
    }
    businessImpact: {
      projectedLift: number
      revenueImpact: number
      costSavings: number
    }
  }
  
  // Metadata
  createdBy: string
  createdAt: Date
  lastAnalyzed: Date
}

export interface ABTestFilters {
  status?: ABTest['status'][]
  objective?: ABTest['objective'][]
  dateRange?: { start: Date; end: Date }
  significance?: 'significant' | 'not-significant' | 'all'
}

// A/B Testing Analysis Engine
export class ABTestAnalyzer {
  
  // Create new A/B test
  createTest(testConfig: Omit<ABTest, 'id' | 'createdAt' | 'lastAnalyzed'>): ABTest {
    return {
      ...testConfig,
      id: `ab_test_${Date.now()}`,
      createdAt: new Date(),
      lastAnalyzed: new Date()
    }
  }
  
  // Add variant to existing test
  addVariant(testId: string, variant: Omit<ABTestVariant, 'id' | 'createdAt' | 'lastUpdated'>): ABTestVariant {
    return {
      ...variant,
      id: `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      lastUpdated: new Date()
    }
  }
  
  // Calculate statistical significance between variants
  analyzeTest(test: ABTest): ABTest['results'] {
    const control = test.variants.find(v => v.id === test.controlVariantId)
    const treatments = test.variants.filter(v => v.id !== test.controlVariantId)
    
    if (!control || treatments.length === 0) {
      throw new Error('Test must have a control and at least one treatment variant')
    }
    
    // Find best performing variant based on test objective
    const bestVariant = this.findBestVariant(test.variants, test.objective)
    
    // Calculate statistical significance vs control
    const significance = this.calculateSignificance(control, bestVariant, test.objective)
    
    // Calculate business impact
    const businessImpact = this.calculateBusinessImpact(control, bestVariant, test.objective)
    
    // Generate recommendation
    const recommendation = this.generateRecommendation(significance, businessImpact, test)
    
    return {
      winner: significance.isSignificant ? bestVariant.id : undefined,
      statistical: {
        significance: significance.confidence,
        pValue: significance.pValue,
        confidenceInterval: significance.confidenceInterval,
        effect: significance.effect,
        recommendation
      },
      businessImpact
    }
  }
  
  // Find best performing variant based on objective
  private findBestVariant(variants: ABTestVariant[], objective: ABTest['objective']): ABTestVariant {
    return variants.reduce((best, current) => {
      switch (objective) {
        case 'conversion':
          return current.metrics.conversionRate > best.metrics.conversionRate ? current : best
        case 'revenue':
          return (current.metrics.revenue || 0) > (best.metrics.revenue || 0) ? current : best
        case 'engagement':
          return current.metrics.avgSessionDuration > best.metrics.avgSessionDuration ? current : best
        case 'traffic':
          return current.metrics.sessions > best.metrics.sessions ? current : best
        default:
          return current.metrics.conversionRate > best.metrics.conversionRate ? current : best
      }
    })
  }
  
  // Calculate statistical significance
  private calculateSignificance(control: ABTestVariant, treatment: ABTestVariant, objective: ABTest['objective']) {
    let controlValue: number
    let treatmentValue: number
    let controlSampleSize: number
    let treatmentSampleSize: number
    
    switch (objective) {
      case 'conversion':
        controlValue = control.metrics.goalCompletions
        treatmentValue = treatment.metrics.goalCompletions
        controlSampleSize = control.metrics.sessions
        treatmentSampleSize = treatment.metrics.sessions
        break
      case 'revenue':
        controlValue = control.metrics.revenue || 0
        treatmentValue = treatment.metrics.revenue || 0
        controlSampleSize = control.metrics.sessions
        treatmentSampleSize = treatment.metrics.sessions
        break
      default:
        controlValue = control.metrics.goalCompletions
        treatmentValue = treatment.metrics.goalCompletions
        controlSampleSize = control.metrics.sessions
        treatmentSampleSize = treatment.metrics.sessions
    }
    
    // Calculate rates
    const controlRate = controlSampleSize > 0 ? controlValue / controlSampleSize : 0
    const treatmentRate = treatmentSampleSize > 0 ? treatmentValue / treatmentSampleSize : 0
    
    // Calculate effect size (lift)
    const effect = controlRate > 0 ? ((treatmentRate - controlRate) / controlRate) * 100 : 0
    
    // Use statistical significance calculation
    const significance = calculateStatisticalSignificance(
      controlValue,
      controlSampleSize,
      treatmentValue,
      treatmentSampleSize
    )
    
    // Calculate confidence interval for the effect
    const confidenceInterval = calculateConfidenceInterval(
      controlRate,
      treatmentRate,
      controlSampleSize,
      treatmentSampleSize,
      95
    )
    
    return {
      isSignificant: significance.isSignificant,
      confidence: significance.confidence,
      pValue: significance.pValue,
      effect,
      confidenceInterval: {
        lower: (confidenceInterval.lower - controlRate) / controlRate * 100,
        upper: (confidenceInterval.upper - controlRate) / controlRate * 100
      }
    }
  }
  
  // Calculate business impact projections
  private calculateBusinessImpact(control: ABTestVariant, treatment: ABTestVariant, objective: ABTest['objective']) {
    const controlRate = control.metrics.sessions > 0 ? control.metrics.goalCompletions / control.metrics.sessions : 0
    const treatmentRate = treatment.metrics.sessions > 0 ? treatment.metrics.goalCompletions / treatment.metrics.sessions : 0
    
    const lift = controlRate > 0 ? ((treatmentRate - controlRate) / controlRate) * 100 : 0
    
    // Project monthly impact based on control traffic
    const monthlyTraffic = control.metrics.sessions * 30 // Assume daily data, project monthly
    const additionalConversions = (monthlyTraffic * treatmentRate) - (monthlyTraffic * controlRate)
    
    const avgRevenuePerConversion = control.metrics.goalCompletions > 0 ? 
      (control.metrics.revenue || 0) / control.metrics.goalCompletions : 0
    
    const revenueImpact = additionalConversions * avgRevenuePerConversion
    
    // Calculate cost savings (reduced CPA)
    const controlCPA = control.metrics.costPerAcquisition || 0
    const treatmentCPA = treatment.metrics.costPerAcquisition || 0
    const costSavings = treatmentCPA < controlCPA ? 
      (controlCPA - treatmentCPA) * (monthlyTraffic * treatmentRate) : 0
    
    return {
      projectedLift: lift,
      revenueImpact,
      costSavings
    }
  }
  
  // Generate actionable recommendation
  private generateRecommendation(
    significance: ReturnType<typeof this.calculateSignificance>,
    businessImpact: ReturnType<typeof this.calculateBusinessImpact>,
    test: ABTest
  ): ABTest['results']['statistical']['recommendation'] {
    
    // Check if test has run long enough (minimum 2 weeks)
    const testDuration = Date.now() - test.startDate.getTime()
    const minimumDuration = 14 * 24 * 60 * 60 * 1000 // 2 weeks in milliseconds
    
    if (!significance.isSignificant) {
      if (testDuration < minimumDuration) {
        return 'continue'
      } else if (Math.abs(significance.effect) < test.minimumDetectableEffect) {
        return 'stop_inconclusive'
      } else {
        return 'extend_test'
      }
    }
    
    // Test is statistically significant
    if (businessImpact.projectedLift > 5 && businessImpact.revenueImpact > 1000) {
      return 'stop_winner'
    }
    
    if (testDuration < minimumDuration) {
      return 'continue'
    }
    
    return 'stop_winner'
  }
  
  // Get test performance summary
  getTestSummary(test: ABTest) {
    const results = this.analyzeTest(test)
    const totalSessions = test.variants.reduce((sum, v) => sum + v.metrics.sessions, 0)
    const totalConversions = test.variants.reduce((sum, v) => sum + v.metrics.goalCompletions, 0)
    const totalRevenue = test.variants.reduce((sum, v) => sum + (v.metrics.revenue || 0), 0)
    
    return {
      testId: test.id,
      name: test.name,
      status: test.status,
      duration: Date.now() - test.startDate.getTime(),
      variants: test.variants.length,
      totalSessions,
      totalConversions,
      totalRevenue,
      overallConversionRate: totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0,
      winner: results.winner,
      significance: results.statistical.significance,
      projectedLift: results.businessImpact.projectedLift,
      recommendation: results.statistical.recommendation
    }
  }
  
  // Compare two specific variants
  compareVariants(variantA: ABTestVariant, variantB: ABTestVariant, objective: ABTest['objective']) {
    const significance = this.calculateSignificance(variantA, variantB, objective)
    const businessImpact = this.calculateBusinessImpact(variantA, variantB, objective)
    
    return {
      variantA: {
        id: variantA.id,
        name: variantA.name,
        conversionRate: variantA.metrics.conversionRate,
        sessions: variantA.metrics.sessions,
        revenue: variantA.metrics.revenue
      },
      variantB: {
        id: variantB.id,
        name: variantB.name,
        conversionRate: variantB.metrics.conversionRate,
        sessions: variantB.metrics.sessions,
        revenue: variantB.metrics.revenue
      },
      comparison: {
        lift: significance.effect,
        isSignificant: significance.isSignificant,
        pValue: significance.pValue,
        confidence: significance.confidence,
        revenueImpact: businessImpact.revenueImpact
      }
    }
  }
}

// Export singleton instance
export const abTestAnalyzer = new ABTestAnalyzer()

// Sample A/B test data for demo
export const abTests: ABTest[] = [
  {
    id: 'test-hero-cta',
    name: 'Hero CTA Button Test',
    description: 'Testing different call-to-action buttons on the hero section',
    objective: 'conversions',
    status: 'running',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-02-01'),
    minimumDetectableEffect: 10,
    variants: [
      {
        id: 'control',
        name: 'Original Button',
        description: 'Current "Get Started" button',
        trafficAllocation: 50,
        campaignType: 'content',
        targetUrl: '/signup',
        utmParams: {
          source: 'website',
          medium: 'cta',
          campaign: 'hero_test_control'
        },
        metrics: {
          impressions: 45000,
          clicks: 2250,
          sessions: 2100,
          users: 1890,
          pageViews: 4200,
          bounceRate: 0.42,
          avgSessionDuration: 180,
          goalCompletions: 126,
          conversionRate: 6.0,
          revenue: 12600
        },
        dailyMetrics: [],
        createdAt: new Date('2024-01-01'),
        lastUpdated: new Date()
      },
      {
        id: 'treatment',
        name: 'New Button Design',
        description: 'Redesigned "Start Free Trial" button',
        trafficAllocation: 50,
        campaignType: 'content',
        targetUrl: '/signup',
        utmParams: {
          source: 'website',
          medium: 'cta',
          campaign: 'hero_test_treatment'
        },
        metrics: {
          impressions: 45000,
          clicks: 2700,
          sessions: 2520,
          users: 2268,
          pageViews: 5040,
          bounceRate: 0.38,
          avgSessionDuration: 195,
          goalCompletions: 176,
          conversionRate: 7.0,
          revenue: 17600
        },
        dailyMetrics: [],
        createdAt: new Date('2024-01-01'),
        lastUpdated: new Date()
      }
    ],
    results: {
      winner: 'treatment',
      statistical: {
        significance: {
          isSignificant: true,
          confidence: 95,
          pValue: 0.032
        },
        recommendation: 'stop_winner'
      },
      businessImpact: {
        projectedLift: 16.7,
        revenueImpact: 5000,
        costSavings: 0
      }
    },
    metadata: {
      createdBy: 'marketing-team',
      tags: ['homepage', 'cta', 'conversion'],
      notes: 'Testing impact of button color and text changes'
    },
    createdAt: new Date('2024-01-01'),
    lastUpdated: new Date()
  },
  {
    id: 'test-pricing-page',
    name: 'Pricing Page Layout',
    description: 'Testing different pricing table layouts',
    objective: 'conversions',
    status: 'completed',
    startDate: new Date('2023-12-01'),
    endDate: new Date('2023-12-31'),
    minimumDetectableEffect: 15,
    variants: [
      {
        id: 'control',
        name: 'Original Layout',
        description: 'Current 3-column pricing table',
        trafficAllocation: 50,
        campaignType: 'content',
        targetUrl: '/pricing',
        utmParams: {
          source: 'website',
          medium: 'page',
          campaign: 'pricing_test_control'
        },
        metrics: {
          impressions: 28000,
          clicks: 1400,
          sessions: 1320,
          users: 1188,
          pageViews: 2640,
          bounceRate: 0.55,
          avgSessionDuration: 145,
          goalCompletions: 79,
          conversionRate: 6.0,
          revenue: 23700
        },
        dailyMetrics: [],
        createdAt: new Date('2023-12-01'),
        lastUpdated: new Date()
      },
      {
        id: 'treatment',
        name: 'Simplified Layout',
        description: 'New single-column with comparison',
        trafficAllocation: 50,
        campaignType: 'content',
        targetUrl: '/pricing',
        utmParams: {
          source: 'website',
          medium: 'page',
          campaign: 'pricing_test_treatment'
        },
        metrics: {
          impressions: 28000,
          clicks: 1120,
          sessions: 1050,
          users: 945,
          pageViews: 2100,
          bounceRate: 0.48,
          avgSessionDuration: 165,
          goalCompletions: 63,
          conversionRate: 6.0,
          revenue: 18900
        },
        dailyMetrics: [],
        createdAt: new Date('2023-12-01'),
        lastUpdated: new Date()
      }
    ],
    results: {
      winner: 'control',
      statistical: {
        significance: {
          isSignificant: false,
          confidence: 95,
          pValue: 0.89
        },
        recommendation: 'stop_inconclusive'
      },
      businessImpact: {
        projectedLift: 0,
        revenueImpact: 0,
        costSavings: 0
      }
    },
    metadata: {
      createdBy: 'product-team',
      tags: ['pricing', 'conversion', 'ux'],
      notes: 'No significant difference found, keeping original'
    },
    createdAt: new Date('2023-12-01'),
    lastUpdated: new Date()
  }
]

export default abTestAnalyzer