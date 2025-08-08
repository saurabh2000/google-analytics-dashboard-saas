'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  cohortAnalyzer,
  CohortMetrics,
  RetentionHeatmap
} from '@/lib/cohort-analysis'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Target,
  Calendar,
  Filter,
  Download,
  Plus,
  Eye,
  BarChart3,
  Activity
} from 'lucide-react'

interface CohortHeatmapCellProps {
  value: number
  maxValue: number
  period: number
  cohortName: string
}

const CohortHeatmapCell = ({ value, maxValue, period, cohortName }: CohortHeatmapCellProps) => {
  const intensity = maxValue > 0 ? value / maxValue : 0
  const opacity = Math.max(0.1, intensity)
  
  const getColor = (val: number) => {
    if (val >= 80) return '#059669' // green-600
    if (val >= 60) return '#10b981' // green-500  
    if (val >= 40) return '#fbbf24' // yellow-400
    if (val >= 20) return '#f59e0b' // yellow-500
    return '#ef4444' // red-500
  }

  return (
    <div
      className="h-8 w-16 flex items-center justify-center text-xs font-medium text-white rounded border"
      style={{
        backgroundColor: getColor(value),
        opacity: opacity
      }}
      title={`${cohortName} - Period ${period}: ${value.toFixed(1)}%`}
    >
      {value > 0 ? `${value.toFixed(0)}%` : '-'}
    </div>
  )
}

export default function CohortAnalysisDashboard() {
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([])
  const [cohortMetrics, setCohortMetrics] = useState<CohortMetrics[]>([])
  const [heatmapData, setHeatmapData] = useState<RetentionHeatmap | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<'retention' | 'revenue' | 'clv'>('retention')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load initial data
    const cohorts = cohortAnalyzer.getCohorts()
    const initialCohortIds = cohorts.slice(0, 3).map(c => c.id)
    setSelectedCohorts(initialCohortIds)
    
    // Generate metrics for initial cohorts
    const metrics = initialCohortIds.map(id => cohortAnalyzer.generateCohortMetrics(id))
    setCohortMetrics(metrics)
    
    // Generate heatmap
    const heatmap = cohortAnalyzer.generateRetentionHeatmap(initialCohortIds)
    setHeatmapData(heatmap)
    
    setLoading(false)
  }, [])

  const channelPerformance = cohortAnalyzer.getChannelPerformance()
  const allCohorts = cohortAnalyzer.getCohorts()

  // Prepare chart data
  const retentionCurveData = cohortMetrics.length > 0 ? 
    cohortMetrics[0].periods.map(period => ({
      period: period.periodLabel,
      ...cohortMetrics.reduce((acc, cohort, index) => ({
        ...acc,
        [cohort.cohortName]: period.period < cohort.periods.length ? 
          cohort.periods[period.period]?.retentionRate : 0
      }), {})
    })) : []

  const revenueData = cohortMetrics.length > 0 ?
    cohortMetrics[0].periods.map(period => ({
      period: period.periodLabel,
      ...cohortMetrics.reduce((acc, cohort, index) => ({
        ...acc,
        [cohort.cohortName]: period.period < cohort.periods.length ? 
          cohort.periods[period.period]?.revenuePerUser : 0
      }), {})
    })) : []

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  const CohortSummaryCard = ({ metrics }: { metrics: CohortMetrics }) => {
    const retentionCurve = cohortAnalyzer.getRetentionCurve(metrics.cohortId)
    
    return (
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{metrics.cohortName}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Started {metrics.startDate.toLocaleDateString()} • {metrics.initialUsers.toLocaleString()} users
            </p>
            <Badge className={`${
              metrics.acquisitionChannel === 'organic_search' ? 'bg-green-100 text-green-800 border-green-200' :
              metrics.acquisitionChannel === 'paid_social' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              metrics.acquisitionChannel === 'email_marketing' ? 'bg-purple-100 text-purple-800 border-purple-200' :
              'bg-gray-100 text-gray-800 border-gray-200'
            }`}>
              {metrics.acquisitionChannel.replace('_', ' ')}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              ${metrics.summary.customerLifetimeValue.toFixed(0)}
            </div>
            <div className="text-xs text-gray-500">CLV</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity size={14} className="text-blue-500" />
              <span className="text-xs text-gray-600">Day 1</span>
            </div>
            <div className="font-bold text-blue-600">{metrics.summary.day1Retention.toFixed(1)}%</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target size={14} className="text-green-500" />
              <span className="text-xs text-gray-600">Day 7</span>
            </div>
            <div className="font-bold text-green-600">{metrics.summary.day7Retention.toFixed(1)}%</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users size={14} className="text-purple-500" />
              <span className="text-xs text-gray-600">Day 30</span>
            </div>
            <div className="font-bold text-purple-600">{metrics.summary.day30Retention.toFixed(1)}%</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={14} className="text-orange-500" />
              <span className="text-xs text-gray-600">Payback</span>
            </div>
            <div className="font-bold text-orange-600">{metrics.summary.paybackPeriod}d</div>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Retention Pattern</span>
            <Badge className={`${
              retentionCurve.pattern === 'healthy' ? 'bg-green-100 text-green-800 border-green-200' :
              retentionCurve.pattern === 'recovering' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              retentionCurve.pattern === 'declining' ? 'bg-red-100 text-red-800 border-red-200' :
              'bg-yellow-100 text-yellow-800 border-yellow-200'
            }`}>
              {retentionCurve.pattern}
            </Badge>
          </div>
          <p className="text-xs text-gray-600">{retentionCurve.recommendation}</p>
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Cohort Analysis</h1>
              <p className="text-gray-600">
                Track user retention and lifetime value across different user segments
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                Filter Cohorts
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Export Data
              </Button>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus size={16} />
                Create Cohort
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {allCohorts.length}
            </div>
            <div className="text-sm text-gray-600">Total Cohorts</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {cohortMetrics.reduce((avg, m) => avg + m.summary.day30Retention, 0) / cohortMetrics.length || 0}%
            </div>
            <div className="text-sm text-gray-600">Avg 30d Retention</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              ${cohortMetrics.reduce((avg, m) => avg + m.summary.customerLifetimeValue, 0) / cohortMetrics.length || 0}
            </div>
            <div className="text-sm text-gray-600">Avg CLV</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {Math.round(cohortMetrics.reduce((avg, m) => avg + m.summary.paybackPeriod, 0) / cohortMetrics.length) || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Payback (days)</div>
          </Card>
        </div>

        {/* Cohort Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {cohortMetrics.map(metrics => (
            <CohortSummaryCard key={metrics.cohortId} metrics={metrics} />
          ))}
        </div>

        {/* Retention Heatmap */}
        {heatmapData && (
          <Card className="p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Retention Heatmap</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  <span>High (80%+)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Medium (40-80%)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Low (&lt;40%)</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <div className="flex">
                {/* Cohort labels */}
                <div className="flex flex-col gap-2 mr-4 mt-8">
                  {heatmapData.cohorts.map(cohort => (
                    <div key={cohort.cohortId} className="h-8 flex items-center">
                      <div className="text-sm font-medium text-right pr-2 w-40 truncate">
                        {cohort.cohortName}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Heatmap grid */}
                <div>
                  {/* Period headers */}
                  <div className="flex gap-2 mb-2">
                    {heatmapData.periods.map(period => (
                      <div key={period} className="w-16 text-xs text-center font-medium text-gray-600">
                        {period}
                      </div>
                    ))}
                  </div>
                  
                  {/* Heatmap cells */}
                  <div className="flex flex-col gap-2">
                    {heatmapData.cohorts.map(cohort => {
                      const maxRetention = Math.max(...cohort.retentionByPeriod)
                      return (
                        <div key={cohort.cohortId} className="flex gap-2">
                          {cohort.retentionByPeriod.map((retention, periodIndex) => (
                            <CohortHeatmapCell
                              key={periodIndex}
                              value={retention}
                              maxValue={maxRetention}
                              period={periodIndex}
                              cohortName={cohort.cohortName}
                            />
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Retention Curves */}
        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Retention Curves</h3>
            <div className="flex gap-2">
              <Button
                variant={selectedMetric === 'retention' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('retention')}
                className="flex items-center gap-1"
              >
                <Activity size={14} />
                Retention
              </Button>
              <Button
                variant={selectedMetric === 'revenue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('revenue')}
                className="flex items-center gap-1"
              >
                <DollarSign size={14} />
                Revenue
              </Button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={selectedMetric === 'retention' ? retentionCurveData : revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis 
                tickFormatter={(value) => 
                  selectedMetric === 'retention' ? `${value}%` : `$${value}`
                }
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  selectedMetric === 'retention' ? `${value.toFixed(1)}%` : `$${value.toFixed(0)}`,
                  name
                ]}
              />
              {cohortMetrics.map((cohort, index) => (
                <Line
                  key={cohort.cohortId}
                  type="monotone"
                  dataKey={cohort.cohortName}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Channel Performance */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Acquisition Channel Performance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channelPerformance.map((channel, index) => (
              <div key={channel.channel} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold capitalize">
                    {channel.channel.replace('_', ' ')}
                  </h4>
                  <Badge className={`${
                    channel.avgCLV > 50 ? 'bg-green-100 text-green-800 border-green-200' :
                    channel.avgCLV > 30 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                    'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    ${channel.avgCLV.toFixed(0)} CLV
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600">Cohorts</div>
                    <div className="font-semibold">{channel.cohorts}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Users</div>
                    <div className="font-semibold">{channel.totalUsers.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">30d Retention</div>
                    <div className="font-semibold">{channel.avgRetention.day30.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Payback</div>
                    <div className="font-semibold">{Math.round(channel.avgPayback)}d</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}