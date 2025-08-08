'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  segmentationAnalyzer,
  UserSegment,
  SegmentComparison,
  GeographicInsights
} from '@/lib/segmentation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ScatterChart,
  Scatter
} from 'recharts'
import {
  Users,
  Globe,
  Smartphone,
  Monitor,
  Target,
  TrendingUp,
  Filter,
  Plus,
  Settings,
  Eye,
  Download,
  BarChart3,
  MapPin,
  Clock,
  DollarSign,
  MousePointer
} from 'lucide-react'

export default function SegmentationDashboard() {
  const [segments, setSegments] = useState<UserSegment[]>([])
  const [selectedSegments, setSelectedSegments] = useState<string[]>([])
  const [comparison, setComparison] = useState<SegmentComparison | null>(null)
  const [geoInsights, setGeoInsights] = useState<GeographicInsights | null>(null)
  const [activeView, setActiveView] = useState<'overview' | 'geographic' | 'behavioral' | 'comparison'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load data
    const loadedSegments = segmentationAnalyzer.getSegments()
    setSegments(loadedSegments)
    
    // Select first 3 segments for comparison
    const initialSelection = loadedSegments.slice(0, 3).map(s => s.id)
    setSelectedSegments(initialSelection)
    
    // Load comparison data
    const comparisonData = segmentationAnalyzer.compareSegments(initialSelection)
    setComparison(comparisonData)
    
    // Load geographic insights
    const geographic = segmentationAnalyzer.getGeographicInsights()
    setGeoInsights(geographic)
    
    setLoading(false)
  }, [])

  const behavioralSegments = segmentationAnalyzer.getBehavioralSegments()
  const deviceSegments = segmentationAnalyzer.getDeviceSegments()

  // Chart colors
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  const getSegmentTypeColor = (type: string) => {
    const colorMap = {
      geographic: 'bg-blue-100 text-blue-800 border-blue-200',
      behavioral: 'bg-green-100 text-green-800 border-green-200',
      demographic: 'bg-purple-100 text-purple-800 border-purple-200',
      technographic: 'bg-orange-100 text-orange-800 border-orange-200',
      custom: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colorMap[type as keyof typeof colorMap] || colorMap.custom
  }

  const SegmentCard = ({ segment }: { segment: UserSegment }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2">{segment.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
          <div className="flex gap-2 mb-2">
            <Badge className={getSegmentTypeColor(segment.criteria[0]?.type || 'custom')}>
              {segment.criteria[0]?.type || 'custom'}
            </Badge>
            {segment.isActive ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {segment.metrics?.totalUsers.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-gray-500">Users</div>
        </div>
      </div>

      {segment.metrics && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-sm font-medium text-gray-600 mb-1">Sessions</div>
            <div className="font-bold">{segment.metrics.sessions.toLocaleString()}</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-sm font-medium text-gray-600 mb-1">Conv. Rate</div>
            <div className="font-bold">{segment.metrics.conversionRate.toFixed(1)}%</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-sm font-medium text-gray-600 mb-1">Revenue</div>
            <div className="font-bold">${segment.metrics.revenue.toLocaleString()}</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-sm font-medium text-gray-600 mb-1">Avg. Duration</div>
            <div className="font-bold">{Math.round(segment.metrics.avgSessionDuration)}s</div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            if (selectedSegments.includes(segment.id)) {
              setSelectedSegments(prev => prev.filter(id => id !== segment.id))
            } else {
              setSelectedSegments(prev => [...prev, segment.id])
            }
          }}
          className={selectedSegments.includes(segment.id) ? 'bg-blue-50 border-blue-200' : ''}
        >
          <Eye size={14} className="mr-1" />
          {selectedSegments.includes(segment.id) ? 'Selected' : 'Select'}
        </Button>
        <Button variant="outline" size="sm">
          <Settings size={14} className="mr-1" />
          Edit
        </Button>
      </div>
    </Card>
  )

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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Segmentation</h1>
              <p className="text-gray-600">
                Analyze user behavior across geography, demographics, and behavioral patterns
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Export
              </Button>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus size={16} />
                Create Segment
              </Button>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex gap-2">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'geographic', label: 'Geographic', icon: Globe },
              { key: 'behavioral', label: 'Behavioral', icon: Target },
              { key: 'comparison', label: 'Comparison', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveView(key as typeof activeView)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeView === key 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview */}
        {activeView === 'overview' && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{segments.length}</div>
                <div className="text-sm text-gray-600">Active Segments</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {segments.reduce((sum, s) => sum + (s.metrics?.totalUsers || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Users</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {(segments.reduce((sum, s) => sum + (s.metrics?.conversionRate || 0), 0) / segments.length).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Avg Conversion</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  ${segments.reduce((sum, s) => sum + (s.metrics?.revenue || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </Card>
            </div>

            {/* Segments Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {segments.map(segment => (
                <SegmentCard key={segment.id} segment={segment} />
              ))}
            </div>

            {/* Device Distribution */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Device Segments</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <Monitor size={48} className="mx-auto text-blue-500 mb-3" />
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {deviceSegments.desktop.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Desktop Users</div>
                </div>
                <div className="text-center">
                  <Smartphone size={48} className="mx-auto text-green-500 mb-3" />
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {deviceSegments.mobile.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Mobile Users</div>
                </div>
                <div className="text-center">
                  <Monitor size={48} className="mx-auto text-purple-500 mb-3" />
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {deviceSegments.tablet.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Tablet Users</div>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Geographic View */}
        {activeView === 'geographic' && geoInsights && (
          <div className="space-y-6">
            {/* Top Countries */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Top Countries by Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Country</th>
                      <th className="text-right py-3">Users</th>
                      <th className="text-right py-3">Sessions</th>
                      <th className="text-right py-3">Revenue</th>
                      <th className="text-right py-3">Conv. Rate</th>
                      <th className="text-right py-3">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geoInsights.topCountries.map((country, index) => (
                      <tr key={country.countryCode} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{country.countryCode === 'US' ? '🇺🇸' : 
                                                       country.countryCode === 'DE' ? '🇩🇪' : 
                                                       country.countryCode === 'GB' ? '🇬🇧' : 
                                                       country.countryCode === 'FR' ? '🇫🇷' : 
                                                       country.countryCode === 'CA' ? '🇨🇦' : '🌐'}</span>
                            <span className="font-medium">{country.country}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 font-semibold">{country.users.toLocaleString()}</td>
                        <td className="text-right py-3">{country.sessions.toLocaleString()}</td>
                        <td className="text-right py-3">${country.revenue.toLocaleString()}</td>
                        <td className="text-right py-3">{country.conversionRate.toFixed(1)}%</td>
                        <td className="text-right py-3">
                          <span className={`font-medium ${country.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {country.growth > 0 ? '+' : ''}{country.growth.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Regional Performance */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Regional Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={geoInsights.regionalPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip formatter={(value: number, name: string) => [
                    name === 'conversionRate' ? `${value.toFixed(1)}%` : 
                    name === 'revenue' ? `$${value.toLocaleString()}` :
                    value.toLocaleString(), 
                    name === 'conversionRate' ? 'Conversion Rate' :
                    name === 'revenue' ? 'Revenue' :
                    name === 'marketPenetration' ? 'Market Penetration' : name
                  ]} />
                  <Bar dataKey="conversionRate" fill="#3b82f6" name="conversionRate" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Top Cities */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Top Cities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {geoInsights.topCities.map(city => (
                  <div key={`${city.city}-${city.country}`} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-blue-500" />
                      <h4 className="font-semibold">{city.city}</h4>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">{city.country}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-gray-600">Users</div>
                        <div className="font-semibold">{city.users.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Revenue</div>
                        <div className="font-semibold">${city.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Behavioral View */}
        {activeView === 'behavioral' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-4 text-center">
                <TrendingUp size={32} className="mx-auto text-green-500 mb-3" />
                <div className="text-xl font-bold text-green-600 mb-1">
                  {behavioralSegments.highEngagement.length}
                </div>
                <div className="text-sm text-gray-600">High Engagement Segments</div>
              </Card>
              <Card className="p-4 text-center">
                <Clock size={32} className="mx-auto text-blue-500 mb-3" />
                <div className="text-xl font-bold text-blue-600 mb-1">
                  {behavioralSegments.lowEngagement.length}
                </div>
                <div className="text-sm text-gray-600">Low Engagement Segments</div>
              </Card>
              <Card className="p-4 text-center">
                <Target size={32} className="mx-auto text-purple-500 mb-3" />
                <div className="text-xl font-bold text-purple-600 mb-1">
                  {behavioralSegments.converters.length}
                </div>
                <div className="text-sm text-gray-600">Converting Segments</div>
              </Card>
              <Card className="p-4 text-center">
                <MousePointer size={32} className="mx-auto text-red-500 mb-3" />
                <div className="text-xl font-bold text-red-600 mb-1">
                  {behavioralSegments.bounced.length}
                </div>
                <div className="text-sm text-gray-600">High Bounce Segments</div>
              </Card>
            </div>

            {/* Engagement vs Conversion Scatter */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Engagement vs Conversion Analysis</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={segments.filter(s => s.metrics).map(s => ({
                  name: s.name,
                  engagement: s.metrics!.avgSessionDuration,
                  conversion: s.metrics!.conversionRate,
                  users: s.metrics!.totalUsers
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="engagement" 
                    type="number" 
                    domain={['dataMin', 'dataMax']}
                    name="Avg Session Duration"
                    tickFormatter={(value) => `${Math.round(value)}s`}
                  />
                  <YAxis 
                    dataKey="conversion" 
                    type="number" 
                    domain={['dataMin', 'dataMax']}
                    name="Conversion Rate"
                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'engagement' ? `${Math.round(value)}s` : 
                      name === 'conversion' ? `${value.toFixed(1)}%` :
                      value.toLocaleString(),
                      name === 'engagement' ? 'Avg Session Duration' :
                      name === 'conversion' ? 'Conversion Rate' : name
                    ]}
                  />
                  <Scatter dataKey="conversion" fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* Comparison View */}
        {activeView === 'comparison' && comparison && (
          <div className="space-y-6">
            {/* Selected Segments */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Segment Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Segment</th>
                      <th className="text-right py-3">Users</th>
                      <th className="text-right py-3">Sessions</th>
                      <th className="text-right py-3">Conv. Rate</th>
                      <th className="text-right py-3">Revenue</th>
                      <th className="text-right py-3">Avg Duration</th>
                      <th className="text-right py-3">Bounce Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.metrics.map((metric, index) => (
                      <tr key={metric.segmentId} className="border-b hover:bg-gray-50">
                        <td className="py-3 font-medium">{metric.segmentName}</td>
                        <td className="text-right py-3">{metric.users.toLocaleString()}</td>
                        <td className="text-right py-3">{metric.sessions.toLocaleString()}</td>
                        <td className="text-right py-3">{metric.conversionRate.toFixed(1)}%</td>
                        <td className="text-right py-3">${metric.revenue.toLocaleString()}</td>
                        <td className="text-right py-3">{Math.round(metric.avgSessionDuration)}s</td>
                        <td className="text-right py-3">{(metric.bounceRate * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Comparison Chart */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Performance Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparison.metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segmentName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="conversionRate" fill="#3b82f6" name="Conversion Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Insights */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Key Insights</h3>
              <div className="space-y-4">
                {comparison.insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}