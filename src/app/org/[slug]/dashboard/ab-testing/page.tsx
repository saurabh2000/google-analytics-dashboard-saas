'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ABTest, 
  ABTestVariant, 
  abTestAnalyzer,
  ABTestAnalyzer 
} from '@/lib/ab-testing'
import { 
  calculateStatisticalSignificance,
  calculateLift,
  interpretTestResults,
  TestInterpretation
} from '@/lib/statistics'
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Plus,
  Eye,
  BarChart3
} from 'lucide-react'

// Sample A/B test data
const sampleTests: ABTest[] = [
  {
    id: 'test_1',
    name: 'Landing Page Headline Test',
    description: 'Testing different headlines on the main landing page to improve conversion rates',
    objective: 'conversion',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-02-15'),
    status: 'running',
    confidenceLevel: 95,
    minimumDetectableEffect: 10,
    powerAnalysis: 80,
    controlVariantId: 'variant_control_1',
    variants: [
      {
        id: 'variant_control_1',
        name: 'Original Headline',
        description: 'Current headline: "Transform Your Business"',
        trafficAllocation: 50,
        campaignType: 'content',
        targetUrl: '/landing-original',
        utmParams: {
          source: 'website',
          medium: 'ab-test',
          campaign: 'headline-test',
          content: 'control'
        },
        metrics: {
          impressions: 15420,
          clicks: 1234,
          sessions: 1180,
          users: 1050,
          pageViews: 2340,
          bounceRate: 0.34,
          avgSessionDuration: 142,
          goalCompletions: 89,
          conversionRate: 7.54,
          revenue: 12600,
          costPerClick: 1.25,
          costPerAcquisition: 18.50
        },
        dailyMetrics: [],
        createdAt: new Date('2024-01-15'),
        lastUpdated: new Date()
      },
      {
        id: 'variant_treatment_1',
        name: 'Benefit-Focused Headline',
        description: 'New headline: "Increase Revenue by 40% in 90 Days"',
        trafficAllocation: 50,
        campaignType: 'content',
        targetUrl: '/landing-variant',
        utmParams: {
          source: 'website',
          medium: 'ab-test',
          campaign: 'headline-test',
          content: 'treatment'
        },
        metrics: {
          impressions: 15680,
          clicks: 1456,
          sessions: 1398,
          users: 1245,
          pageViews: 2890,
          bounceRate: 0.28,
          avgSessionDuration: 168,
          goalCompletions: 126,
          conversionRate: 9.01,
          revenue: 18900,
          costPerClick: 1.25,
          costPerAcquisition: 15.75
        },
        dailyMetrics: [],
        createdAt: new Date('2024-01-15'),
        lastUpdated: new Date()
      }
    ],
    results: {
      winner: 'variant_treatment_1',
      statistical: {
        significance: 95.2,
        pValue: 0.048,
        confidenceInterval: {
          lower: 0.2,
          upper: 2.8
        },
        effect: 19.5,
        recommendation: 'stop_winner'
      },
      businessImpact: {
        projectedLift: 19.5,
        revenueImpact: 6300,
        costSavings: 2750
      }
    },
    createdBy: 'current-user',
    createdAt: new Date('2024-01-15'),
    lastAnalyzed: new Date()
  },
  {
    id: 'test_2',
    name: 'Checkout Button Color Test',
    description: 'Testing green vs blue checkout button to optimize conversion',
    objective: 'conversion',
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-02-20'),
    status: 'running',
    confidenceLevel: 95,
    minimumDetectableEffect: 5,
    powerAnalysis: 80,
    controlVariantId: 'variant_control_2',
    variants: [
      {
        id: 'variant_control_2',
        name: 'Blue Button',
        description: 'Current blue checkout button',
        trafficAllocation: 50,
        campaignType: 'content',
        targetUrl: '/checkout-blue',
        utmParams: {
          source: 'website',
          medium: 'ab-test',
          campaign: 'button-color-test',
          content: 'control'
        },
        metrics: {
          impressions: 8920,
          clicks: 756,
          sessions: 720,
          users: 680,
          pageViews: 1440,
          bounceRate: 0.42,
          avgSessionDuration: 98,
          goalCompletions: 43,
          conversionRate: 5.97,
          revenue: 5160,
          costPerClick: 2.10,
          costPerAcquisition: 35.20
        },
        dailyMetrics: [],
        createdAt: new Date('2024-01-20'),
        lastUpdated: new Date()
      },
      {
        id: 'variant_treatment_2',
        name: 'Green Button',
        description: 'New green checkout button',
        trafficAllocation: 50,
        campaignType: 'content',
        targetUrl: '/checkout-green',
        utmParams: {
          source: 'website',
          medium: 'ab-test',
          campaign: 'button-color-test',
          content: 'treatment'
        },
        metrics: {
          impressions: 9040,
          clicks: 798,
          sessions: 765,
          users: 725,
          pageViews: 1530,
          bounceRate: 0.38,
          avgSessionDuration: 108,
          goalCompletions: 52,
          conversionRate: 6.80,
          revenue: 6240,
          costPerClick: 2.10,
          costPerAcquisition: 30.90
        },
        dailyMetrics: [],
        createdAt: new Date('2024-01-20'),
        lastUpdated: new Date()
      }
    ],
    results: {
      statistical: {
        significance: 87.3,
        pValue: 0.127,
        confidenceInterval: {
          lower: -0.3,
          upper: 2.1
        },
        effect: 13.9,
        recommendation: 'continue'
      },
      businessImpact: {
        projectedLift: 13.9,
        revenueImpact: 1080,
        costSavings: 430
      }
    },
    createdBy: 'current-user',
    createdAt: new Date('2024-01-20'),
    lastAnalyzed: new Date()
  }
]

export default function ABTestingDashboard() {
  const [tests, setTests] = useState<ABTest[]>(sampleTests)
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'draft'>('all')

  const filteredTests = tests.filter(test => {
    if (filter === 'all') return true
    return test.status === filter
  })

  const getStatusBadge = (status: ABTest['status']) => {
    const configs = {
      running: { color: 'bg-green-100 text-green-800 border-green-200', icon: Play },
      completed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
      paused: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Pause },
      draft: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Eye },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
    }
    
    const config = configs[status]
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getRecommendationBadge = (recommendation: string) => {
    const configs = {
      stop_winner: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, text: 'Implement Winner' },
      continue: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock, text: 'Continue Test' },
      stop_inconclusive: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle, text: 'Inconclusive' },
      extend_test: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: TrendingUp, text: 'Extend Test' }
    }
    
    const config = configs[recommendation as keyof typeof configs]
    if (!config) return null
    
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon size={12} />
        {config.text}
      </Badge>
    )
  }

  const calculateTestDuration = (startDate: Date, endDate?: Date) => {
    const end = endDate || new Date()
    const days = Math.ceil((end.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const TestSummaryCard = ({ test }: { test: ABTest }) => {
    const duration = calculateTestDuration(test.startDate, test.endDate)
    const totalSessions = test.variants.reduce((sum, v) => sum + v.metrics.sessions, 0)
    const totalConversions = test.variants.reduce((sum, v) => sum + v.metrics.goalCompletions, 0)
    const overallConversionRate = totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0

    return (
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200" 
            onClick={() => setSelectedTest(test)}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{test.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{test.description}</p>
            <div className="flex items-center gap-2">
              {getStatusBadge(test.status)}
              {test.results?.statistical?.recommendation && 
                getRecommendationBadge(test.results.statistical.recommendation)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {overallConversionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Conversion Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500">Sessions</span>
            </div>
            <div className="font-semibold">{totalSessions.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500">Conversions</span>
            </div>
            <div className="font-semibold">{totalConversions.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500">Duration</span>
            </div>
            <div className="font-semibold">{duration} days</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500">Variants</span>
            </div>
            <div className="font-semibold">{test.variants.length}</div>
          </div>
        </div>

        {test.results?.statistical && (
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {test.results.statistical.significance >= 95 ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <Clock size={16} className="text-blue-500" />
                )}
                <span className="text-sm font-medium">
                  {test.results.statistical.significance.toFixed(1)}% Confidence
                </span>
              </div>
              {test.results.winner && (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp size={14} />
                  <span className="text-sm font-medium">
                    +{test.results.businessImpact.projectedLift.toFixed(1)}% Lift
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">A/B Testing Dashboard</h1>
              <p className="text-gray-600">
                Analyze and compare test variants to optimize conversion rates
              </p>
            </div>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus size={16} />
              Create New Test
            </Button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {(['all', 'running', 'completed', 'draft'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({
                  status === 'all' 
                    ? tests.length 
                    : tests.filter(t => t.status === status).length
                })
              </button>
            ))}
          </div>
        </div>

        {/* Tests Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredTests.map(test => (
            <TestSummaryCard key={test.id} test={test} />
          ))}
        </div>

        {filteredTests.length === 0 && (
          <Card className="p-12 text-center">
            <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No tests found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "You haven't created any A/B tests yet."
                : `No tests with status "${filter}" found.`
              }
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-2" />
              Create Your First Test
            </Button>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {tests.length}
            </div>
            <div className="text-sm text-gray-600">Total Tests</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {tests.filter(t => t.status === 'running').length}
            </div>
            <div className="text-sm text-gray-600">Active Tests</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {tests.filter(t => t.results?.winner).length}
            </div>
            <div className="text-sm text-gray-600">With Winners</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {tests.reduce((avg, test) => {
                if (!test.results?.businessImpact?.projectedLift) return avg
                return avg + test.results.businessImpact.projectedLift
              }, 0) / tests.filter(t => t.results?.businessImpact?.projectedLift).length || 0}%
            </div>
            <div className="text-sm text-gray-600">Avg Lift</div>
          </Card>
        </div>
      </div>
    </div>
  )
}