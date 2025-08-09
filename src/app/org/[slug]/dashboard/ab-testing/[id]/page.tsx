'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import TestComparison from '@/components/ab-testing/TestComparison'
import { ABTest } from '@/lib/ab-testing'
import {
  ArrowLeft,
  Play,
  Pause,
  Settings,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
  Copy
} from 'lucide-react'

// Sample test data (in a real app, this would come from API/database)
const sampleTest: ABTest = {
  id: 'test_1',
  name: 'Landing Page Headline Test',
  description: 'Testing different headlines on the main landing page to improve conversion rates. We are comparing our current generic headline with a more specific, benefit-focused alternative that highlights concrete value propositions.',
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
      description: 'Current headline: "Transform Your Business" - Generic transformation message',
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
        impressions: 25420,
        clicks: 2034,
        sessions: 1980,
        users: 1850,
        pageViews: 3940,
        bounceRate: 0.34,
        avgSessionDuration: 142,
        goalCompletions: 149,
        conversionRate: 7.52,
        revenue: 21600,
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
      description: 'New headline: "Increase Revenue by 40% in 90 Days" - Specific benefit and timeframe',
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
        impressions: 25680,
        clicks: 2256,
        sessions: 2198,
        users: 2045,
        pageViews: 4890,
        bounceRate: 0.28,
        avgSessionDuration: 168,
        goalCompletions: 198,
        conversionRate: 9.01,
        revenue: 28900,
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
      significance: 96.3,
      pValue: 0.037,
      confidenceInterval: {
        lower: 0.4,
        upper: 2.6
      },
      effect: 19.8,
      recommendation: 'stop_winner'
    },
    businessImpact: {
      projectedLift: 19.8,
      revenueImpact: 7300,
      costSavings: 2750
    }
  },
  createdBy: 'current-user',
  createdAt: new Date('2024-01-15'),
  lastAnalyzed: new Date()
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TestDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [test, setTest] = useState<ABTest | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Simulate API call
    const loadTest = async () => {
      const resolvedParams = await params
      setTimeout(() => {
        if (resolvedParams.id === 'test_1') {
          setTest(sampleTest)
        }
        setLoading(false)
      }, 500)
    }
    
    loadTest()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Test Not Found</h2>
          <p className="text-gray-600 mb-6">The A/B test you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Button onClick={() => router.push('/dashboard/ab-testing')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Tests
          </Button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: ABTest['status']) => {
    const colors = {
      running: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status]
  }

  const testDuration = Math.ceil((new Date().getTime() - test.startDate.getTime()) / (1000 * 60 * 60 * 24))
  const totalSessions = test.variants.reduce((sum, v) => sum + v.metrics.sessions, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/ab-testing')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Tests
            </Button>
            <Badge className={getStatusColor(test.status)}>
              {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
            </Badge>
            <span className="text-sm text-gray-500">
              Running for {testDuration} days • {totalSessions.toLocaleString()} total sessions
            </span>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.name}</h1>
              <p className="text-gray-600 text-lg mb-4 max-w-4xl">{test.description}</p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Copy size={16} />
                Duplicate
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 size={16} />
                Share
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Export
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings size={16} />
                Settings
              </Button>
              {test.status === 'running' ? (
                <Button className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700">
                  <Pause size={16} />
                  Pause Test
                </Button>
              ) : (
                <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <Play size={16} />
                  Resume Test
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Test Status Alert */}
        {test.results?.statistical?.recommendation === 'stop_winner' && (
          <Card className="p-4 mb-6 border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-green-800 mb-1">
                  Test Complete - Winner Detected!
                </h3>
                <p className="text-green-700">
                  {test.variants.find(v => v.id === test.results?.winner)?.name} is the clear winner with 
                  {' '}{test.results.statistical.significance.toFixed(1)}% confidence and 
                  {' '}{test.results.businessImpact.projectedLift.toFixed(1)}% lift. 
                  Ready to implement?
                </p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                Implement Winner
              </Button>
            </div>
          </Card>
        )}

        {/* Test Comparison */}
        <TestComparison test={test} />

        {/* Test Configuration */}
        <Card className="p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">Test Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Objective</div>
              <div className="font-semibold capitalize">{test.objective}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Confidence Level</div>
              <div className="font-semibold">{test.confidenceLevel}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Min Effect Size</div>
              <div className="font-semibold">{test.minimumDetectableEffect}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Statistical Power</div>
              <div className="font-semibold">{test.powerAnalysis}%</div>
            </div>
          </div>
        </Card>

        {/* Variant Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {test.variants.map(variant => (
            <Card key={variant.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-lg mb-1">{variant.name}</h4>
                  <p className="text-gray-600 text-sm mb-2">{variant.description}</p>
                  {variant.id === test.controlVariantId && (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">Control</Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold">{variant.trafficAllocation}%</div>
                  <div className="text-xs text-gray-500">Traffic</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Target URL</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    {variant.targetUrl}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Campaign Type</span>
                  <span className="text-sm capitalize">{variant.campaignType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">UTM Campaign</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    {variant.utmParams.campaign}
                  </code>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}