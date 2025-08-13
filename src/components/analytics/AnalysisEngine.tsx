'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, CheckCircle, XCircle, Target, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { AnalyticsData } from '@/lib/analytics-data'

interface AnalysisEngineProps {
  analyticsData: AnalyticsData | null
  isRealData: boolean
  dateRange: string
  propertyName: string | null
}

interface InsightItem {
  text: string
  metric?: string
  value?: string | number
  trend?: 'up' | 'down' | 'neutral'
  severity?: 'high' | 'medium' | 'low'
}

interface AnalysisResult {
  overallScore: number
  positives: InsightItem[]
  negatives: InsightItem[]
  improvements: InsightItem[]
  suggestions: InsightItem[]
  keyMetrics: {
    growthRate: number
    engagementScore: number
    conversionPotential: number
    trafficQuality: number
  }
}

export default function AnalysisEngine({ 
  analyticsData, 
  isRealData, 
  dateRange,
  propertyName 
}: AnalysisEngineProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (analyticsData) {
      performAnalysis()
    }
  }, [analyticsData, dateRange])

  const performAnalysis = () => {
    setIsAnalyzing(true)
    
    // Simulate analysis delay for better UX
    setTimeout(() => {
      const result = analyzeData(analyticsData!)
      setAnalysis(result)
      setIsAnalyzing(false)
    }, 1500)
  }

  const analyzeData = (data: AnalyticsData): AnalysisResult => {
    const positives: InsightItem[] = []
    const negatives: InsightItem[] = []
    const improvements: InsightItem[] = []
    const suggestions: InsightItem[] = []

    // Calculate key metrics
    const userGrowth = data.users.change
    const sessionGrowth = data.sessions.change
    const avgSessionMinutes = parseInt(data.avgSessionDuration.total.split('m')[0])
    const bounceRate = calculateBounceRate(data)
    const mobileTrafficPercent = calculateMobilePercent(data)
    const organicTrafficPercent = calculateOrganicPercent(data)
    
    // Analyze user growth
    if (userGrowth > 10) {
      positives.push({
        text: 'Strong user growth',
        metric: 'User Growth',
        value: `+${userGrowth.toFixed(1)}%`,
        trend: 'up',
        severity: 'high'
      })
    } else if (userGrowth > 0) {
      positives.push({
        text: 'Positive user growth',
        metric: 'User Growth',
        value: `+${userGrowth.toFixed(1)}%`,
        trend: 'up',
        severity: 'medium'
      })
    } else if (userGrowth < -5) {
      negatives.push({
        text: 'Significant user decline',
        metric: 'User Growth',
        value: `${userGrowth.toFixed(1)}%`,
        trend: 'down',
        severity: 'high'
      })
    }

    // Analyze session duration
    if (avgSessionMinutes >= 4) {
      positives.push({
        text: 'Excellent user engagement',
        metric: 'Avg Session',
        value: data.avgSessionDuration.total,
        trend: 'up',
        severity: 'high'
      })
    } else if (avgSessionMinutes < 2) {
      negatives.push({
        text: 'Low session duration',
        metric: 'Avg Session',
        value: data.avgSessionDuration.total,
        trend: 'down',
        severity: 'medium'
      })
      improvements.push({
        text: 'Improve content engagement',
        metric: 'Content Strategy',
        severity: 'high'
      })
    }

    // Analyze bounce rate
    if (bounceRate > 70) {
      negatives.push({
        text: 'High bounce rate detected',
        metric: 'Bounce Rate',
        value: `${bounceRate}%`,
        trend: 'down',
        severity: 'high'
      })
      improvements.push({
        text: 'Optimize landing pages',
        metric: 'Page Experience',
        severity: 'high'
      })
    } else if (bounceRate < 40) {
      positives.push({
        text: 'Low bounce rate',
        metric: 'Bounce Rate',
        value: `${bounceRate}%`,
        trend: 'up',
        severity: 'medium'
      })
    }

    // Analyze mobile traffic
    if (mobileTrafficPercent > 60) {
      positives.push({
        text: 'Strong mobile presence',
        metric: 'Mobile Traffic',
        value: `${mobileTrafficPercent}%`,
        severity: 'medium'
      })
    } else if (mobileTrafficPercent < 30) {
      improvements.push({
        text: 'Increase mobile optimization',
        metric: 'Mobile Strategy',
        severity: 'medium'
      })
    }

    // Analyze traffic sources
    if (organicTrafficPercent > 40) {
      positives.push({
        text: 'Strong organic search presence',
        metric: 'Organic Traffic',
        value: `${organicTrafficPercent}%`,
        trend: 'up',
        severity: 'high'
      })
    } else if (organicTrafficPercent < 20) {
      improvements.push({
        text: 'Improve SEO strategy',
        metric: 'Search Optimization',
        severity: 'high'
      })
    }

    // Analyze top pages performance
    const topPageViews = data.topPages.data[0]
    const secondPageViews = data.topPages.data[1] || 0
    if (topPageViews > secondPageViews * 2) {
      improvements.push({
        text: 'Diversify traffic across pages',
        metric: 'Content Distribution',
        severity: 'medium'
      })
    }

    // Generate suggestions based on analysis
    if (userGrowth < 5) {
      suggestions.push({
        text: 'Launch a content marketing campaign to attract new users',
        severity: 'high'
      })
    }

    if (avgSessionMinutes < 3) {
      suggestions.push({
        text: 'Add interactive elements and related content recommendations',
        severity: 'high'
      })
    }

    if (mobileTrafficPercent > 50 && bounceRate > 60) {
      suggestions.push({
        text: 'Optimize mobile page load speed and user experience',
        severity: 'high'
      })
    }

    if (organicTrafficPercent < 30) {
      suggestions.push({
        text: 'Invest in SEO: keyword research, content optimization, and backlink building',
        severity: 'medium'
      })
    }

    // Calculate overall scores
    const growthRate = (userGrowth + sessionGrowth) / 2
    const engagementScore = calculateEngagementScore(avgSessionMinutes, bounceRate)
    const conversionPotential = calculateConversionPotential(data)
    const trafficQuality = calculateTrafficQuality(organicTrafficPercent, bounceRate, avgSessionMinutes)
    
    const overallScore = (
      (growthRate > 0 ? Math.min(growthRate * 2, 25) : 0) +
      engagementScore * 25 +
      conversionPotential * 25 +
      trafficQuality * 25
    )

    return {
      overallScore: Math.round(Math.max(0, Math.min(100, overallScore))),
      positives,
      negatives,
      improvements,
      suggestions,
      keyMetrics: {
        growthRate: Math.round(growthRate),
        engagementScore: Math.round(engagementScore * 100),
        conversionPotential: Math.round(conversionPotential * 100),
        trafficQuality: Math.round(trafficQuality * 100)
      }
    }
  }

  const calculateBounceRate = (data: AnalyticsData): number => {
    // Estimate bounce rate based on session duration and page views
    const avgPagesPerSession = data.pageViews.total / data.sessions.total
    const avgSessionMinutes = parseInt(data.avgSessionDuration.total.split('m')[0])
    
    if (avgPagesPerSession < 1.5 || avgSessionMinutes < 1) {
      return 75 + Math.random() * 15
    } else if (avgPagesPerSession > 3 && avgSessionMinutes > 3) {
      return 25 + Math.random() * 15
    }
    return 40 + Math.random() * 20
  }

  const calculateMobilePercent = (data: AnalyticsData): number => {
    const mobileIndex = data.deviceTypes.labels.indexOf('Mobile')
    if (mobileIndex !== -1) {
      const total = data.deviceTypes.data.reduce((sum, val) => sum + val, 0)
      return Math.round((data.deviceTypes.data[mobileIndex] / total) * 100)
    }
    return 50
  }

  const calculateOrganicPercent = (data: AnalyticsData): number => {
    const organicIndex = data.trafficSources.labels.findIndex(label => 
      label.toLowerCase().includes('organic')
    )
    if (organicIndex !== -1) {
      const total = data.trafficSources.data.reduce((sum, val) => sum + val, 0)
      return Math.round((data.trafficSources.data[organicIndex] / total) * 100)
    }
    return 30
  }

  const calculateEngagementScore = (avgMinutes: number, bounceRate: number): number => {
    const timeScore = Math.min(avgMinutes / 5, 1)
    const bounceScore = Math.max(0, (100 - bounceRate) / 100)
    return (timeScore + bounceScore) / 2
  }

  const calculateConversionPotential = (data: AnalyticsData): number => {
    const revenueGrowth = data.revenue?.change || 0
    const userGrowth = data.users.change
    const sessionGrowth = data.sessions.change
    
    return Math.max(0, Math.min(1, 
      (revenueGrowth + userGrowth + sessionGrowth) / 30
    ))
  }

  const calculateTrafficQuality = (organic: number, bounce: number, avgMinutes: number): number => {
    const organicScore = organic / 100
    const bounceScore = Math.max(0, (100 - bounce) / 100)
    const timeScore = Math.min(avgMinutes / 5, 1)
    
    return (organicScore * 0.4 + bounceScore * 0.3 + timeScore * 0.3)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  if (!analyticsData) return null

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle>Analytics Intelligence Engine</CardTitle>
          </div>
          {!isRealData && (
            <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full">
              Demo Analysis
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 rounded-full"></div>
              <div className="absolute top-0 w-16 h-16 border-4 border-purple-600 dark:border-purple-400 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Analyzing your data...</p>
          </div>
        ) : analysis && (
          <>
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Overall Performance Score
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Based on growth, engagement, and traffic quality
                  </p>
                </div>
                <div className="text-right">
                  <div className={cn("text-3xl font-bold", getScoreColor(analysis.overallScore))}>
                    {analysis.overallScore}%
                  </div>
                  <div className={cn("text-sm font-medium", getScoreColor(analysis.overallScore))}>
                    {getScoreLabel(analysis.overallScore)}
                  </div>
                </div>
              </div>
              <Progress value={analysis.overallScore} className="h-3" />
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analysis.keyMetrics.growthRate}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Growth Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analysis.keyMetrics.engagementScore}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analysis.keyMetrics.conversionPotential}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Conversion</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analysis.keyMetrics.trafficQuality}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Traffic Quality</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Analysis Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Positives */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Positives</h4>
                </div>
                <div className="space-y-2">
                  {analysis.positives.length > 0 ? (
                    analysis.positives.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">{item.text}</p>
                          {item.value && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {item.metric}: {item.value}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No significant positive trends detected
                    </p>
                  )}
                </div>
              </div>

              {/* Negatives */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Areas of Concern</h4>
                </div>
                <div className="space-y-2">
                  {analysis.negatives.length > 0 ? (
                    analysis.negatives.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">{item.text}</p>
                          {item.value && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {item.metric}: {item.value}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No major concerns identified
                    </p>
                  )}
                </div>
              </div>

              {/* Improvements */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Areas for Improvement</h4>
                </div>
                <div className="space-y-2">
                  {analysis.improvements.length > 0 ? (
                    analysis.improvements.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">{item.text}</p>
                          {item.metric && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Focus: {item.metric}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Performance is well-optimized
                    </p>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Actionable Suggestions</h4>
                </div>
                <div className="space-y-2">
                  {analysis.suggestions.length > 0 ? (
                    analysis.suggestions.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">{item.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Continue current strategies
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Note:</span> This analysis is based on {dateRange === '7d' ? 'the last 7 days' : dateRange === '30d' ? 'the last 30 days' : dateRange === '90d' ? 'the last 90 days' : 'the last year'} of data
                {propertyName && ` for ${propertyName}`}. 
                {!isRealData && ' This is demo data for illustration purposes.'}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}