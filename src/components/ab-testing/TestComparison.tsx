'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ABTest, 
  ABTestVariant
} from '@/lib/ab-testing'
import { 
  calculateStatisticalSignificance,
  calculateLift,
  calculateConfidenceInterval,
  interpretTestResults
} from '@/lib/statistics'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  DollarSign,
  Clock,
  MousePointer,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap
} from 'lucide-react'

interface TestComparisonProps {
  test: ABTest
  selectedVariants?: string[]
}

export default function TestComparison({ test, selectedVariants }: TestComparisonProps) {
  const [comparisonMetric, setComparisonMetric] = useState<'conversionRate' | 'revenue' | 'sessions' | 'bounceRate'>('conversionRate')
  
  const controlVariant = test.variants.find(v => v.id === test.controlVariantId)
  const treatmentVariants = test.variants.filter(v => v.id !== test.controlVariantId)
  
  if (!controlVariant) return null

  // Calculate comparison data
  const comparisonData = test.variants.map(variant => {
    const significance = calculateStatisticalSignificance(
      controlVariant.metrics.goalCompletions,
      controlVariant.metrics.sessions,
      variant.metrics.goalCompletions,
      variant.metrics.sessions
    )
    
    const lift = calculateLift(
      controlVariant.metrics.conversionRate,
      variant.metrics.conversionRate
    )
    
    const isControl = variant.id === test.controlVariantId
    
    return {
      id: variant.id,
      name: variant.name,
      isControl,
      conversionRate: variant.metrics.conversionRate,
      sessions: variant.metrics.sessions,
      conversions: variant.metrics.goalCompletions,
      revenue: variant.metrics.revenue || 0,
      bounceRate: variant.metrics.bounceRate * 100,
      avgSessionDuration: variant.metrics.avgSessionDuration,
      lift: isControl ? 0 : lift,
      significance: isControl ? 0 : significance.confidence,
      pValue: isControl ? 1 : significance.pValue,
      isSignificant: isControl ? false : significance.isSignificant
    }
  })

  // Chart data for metrics comparison
  const chartData = comparisonData.map(data => ({
    name: data.name,
    'Conversion Rate': data.conversionRate,
    'Sessions': data.sessions,
    'Revenue': data.revenue,
    'Bounce Rate': data.bounceRate,
    lift: data.lift,
    isControl: data.isControl
  }))

  // Funnel data
  const funnelData = test.variants.map(variant => ({
    name: variant.name,
    impressions: variant.metrics.impressions,
    clicks: variant.metrics.clicks,
    sessions: variant.metrics.sessions,
    conversions: variant.metrics.goalCompletions,
    isControl: variant.id === test.controlVariantId
  }))

  const getMetricIcon = (metric: string) => {
    const icons = {
      conversionRate: Target,
      sessions: Users,
      revenue: DollarSign,
      bounceRate: TrendingDown
    }
    return icons[metric as keyof typeof icons] || Target
  }

  const getVariantColor = (index: number, isControl: boolean) => {
    if (isControl) return '#64748b' // Gray for control
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    return colors[index % colors.length]
  }

  const formatMetricValue = (value: number, metric: string) => {
    switch (metric) {
      case 'conversionRate':
      case 'bounceRate':
        return `${value.toFixed(2)}%`
      case 'revenue':
        return `$${value.toLocaleString()}`
      case 'sessions':
        return value.toLocaleString()
      default:
        return value.toString()
    }
  }

  const MetricCard = ({ variant, controlVariant }: { variant: typeof comparisonData[0], controlVariant: typeof comparisonData[0] }) => {
    const isWinning = variant.lift > 0 && variant.isSignificant
    const isLosing = variant.lift < 0 && variant.isSignificant
    
    return (
      <Card className={`p-6 ${variant.isControl ? 'border-gray-300 bg-gray-50' : isWinning ? 'border-green-300 bg-green-50' : isLosing ? 'border-red-300 bg-red-50' : 'border-blue-300'}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">{variant.name}</h3>
            {variant.isControl && (
              <Badge className="bg-gray-100 text-gray-800 border-gray-200 mb-2">
                Control
              </Badge>
            )}
            {!variant.isControl && (
              <div className="flex gap-2 mb-2">
                {variant.isSignificant ? (
                  <Badge className={isWinning ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                    {variant.isSignificant ? 'Significant' : 'Not Significant'}
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Trending
                  </Badge>
                )}
              </div>
            )}
          </div>
          {!variant.isControl && (
            <div className="text-right">
              <div className={`text-2xl font-bold ${isWinning ? 'text-green-600' : isLosing ? 'text-red-600' : 'text-gray-600'} mb-1 flex items-center gap-1`}>
                {variant.lift > 0 ? <TrendingUp size={24} /> : variant.lift < 0 ? <TrendingDown size={24} /> : null}
                {variant.lift > 0 ? '+' : ''}{variant.lift.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Lift</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Target size={16} className="text-blue-500" />
              <span className="text-sm font-medium">Conversion Rate</span>
            </div>
            <div className="text-xl font-bold text-blue-600">
              {variant.conversionRate.toFixed(2)}%
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Users size={16} className="text-green-500" />
              <span className="text-sm font-medium">Sessions</span>
            </div>
            <div className="text-xl font-bold text-green-600">
              {variant.sessions.toLocaleString()}
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center gap-1 mb-2">
              <DollarSign size={16} className="text-purple-500" />
              <span className="text-sm font-medium">Revenue</span>
            </div>
            <div className="text-xl font-bold text-purple-600">
              ${variant.revenue.toLocaleString()}
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center gap-1 mb-2">
              <TrendingDown size={16} className="text-orange-500" />
              <span className="text-sm font-medium">Bounce Rate</span>
            </div>
            <div className="text-xl font-bold text-orange-600">
              {variant.bounceRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {!variant.isControl && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Statistical Confidence</span>
              <span className={`font-bold ${variant.isSignificant ? 'text-green-600' : 'text-yellow-600'}`}>
                {variant.significance.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">P-Value</span>
              <span className="font-mono text-sm">{variant.pValue.toFixed(4)}</span>
            </div>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Test Overview */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{test.name}</h2>
            <p className="text-gray-600 mb-4">{test.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Objective: {test.objective}</span>
              <span>•</span>
              <span>Confidence Level: {test.confidenceLevel}%</span>
              <span>•</span>
              <span>Variants: {test.variants.length}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {test.results?.businessImpact?.projectedLift?.toFixed(1) || '0.0'}%
            </div>
            <div className="text-sm text-gray-500">Best Lift</div>
          </div>
        </div>

        {test.results?.statistical && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {test.results.statistical.significance >= 95 ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : test.results.statistical.significance >= 80 ? (
                  <AlertTriangle size={16} className="text-yellow-500" />
                ) : (
                  <XCircle size={16} className="text-red-500" />
                )}
                <span className="text-sm font-medium">Confidence</span>
              </div>
              <div className="font-bold text-lg">{test.results.statistical.significance.toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign size={16} className="text-green-500" />
                <span className="text-sm font-medium">Revenue Impact</span>
              </div>
              <div className="font-bold text-lg text-green-600">
                ${test.results.businessImpact.revenueImpact.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap size={16} className="text-blue-500" />
                <span className="text-sm font-medium">Recommendation</span>
              </div>
              <div className="font-bold text-lg">
                {test.results.statistical.recommendation === 'stop_winner' ? 'Implement' : 
                 test.results.statistical.recommendation === 'continue' ? 'Continue' : 'Review'}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Variant Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {comparisonData.map(variant => (
          <MetricCard 
            key={variant.id} 
            variant={variant} 
            controlVariant={comparisonData.find(v => v.isControl)!} 
          />
        ))}
      </div>

      {/* Metrics Comparison Chart */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Performance Comparison</h3>
          <div className="flex gap-2">
            {(['conversionRate', 'sessions', 'revenue', 'bounceRate'] as const).map(metric => {
              const Icon = getMetricIcon(metric)
              return (
                <Button
                  key={metric}
                  variant={comparisonMetric === metric ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setComparisonMetric(metric)}
                  className="flex items-center gap-1"
                >
                  <Icon size={14} />
                  {metric === 'conversionRate' ? 'Conversion' : 
                   metric === 'bounceRate' ? 'Bounce Rate' :
                   metric.charAt(0).toUpperCase() + metric.slice(1)}
                </Button>
              )
            })}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              tickFormatter={(value) => formatMetricValue(value, comparisonMetric)}
            />
            <Tooltip 
              formatter={(value: number) => [formatMetricValue(value, comparisonMetric), comparisonMetric]}
            />
            <Bar 
              dataKey={comparisonMetric === 'conversionRate' ? 'Conversion Rate' :
                      comparisonMetric === 'bounceRate' ? 'Bounce Rate' :
                      comparisonMetric.charAt(0).toUpperCase() + comparisonMetric.slice(1)}
              fill="#3b82f6" 
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Conversion Funnel */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Conversion Funnel</h3>
        
        <div className="space-y-4">
          {funnelData.map((variant, index) => {
            const impressionRate = 100
            const clickRate = variant.impressions > 0 ? (variant.clicks / variant.impressions) * 100 : 0
            const sessionRate = variant.clicks > 0 ? (variant.sessions / variant.clicks) * 100 : 0
            const conversionRate = variant.sessions > 0 ? (variant.conversions / variant.sessions) * 100 : 0
            
            return (
              <div key={variant.name} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getVariantColor(index, variant.isControl) }}
                  ></div>
                  <h4 className="font-semibold text-lg">{variant.name}</h4>
                  {variant.isControl && (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">Control</Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {variant.impressions.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Impressions</div>
                    <div className="text-xs text-gray-500">100%</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {variant.clicks.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Clicks</div>
                    <div className="text-xs text-gray-500">{clickRate.toFixed(1)}%</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {variant.sessions.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Sessions</div>
                    <div className="text-xs text-gray-500">{sessionRate.toFixed(1)}%</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {variant.conversions.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Conversions</div>
                    <div className="text-xs text-gray-500">{conversionRate.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}