'use client'

import { useState } from 'react'
import { X, Save, RefreshCw, Palette, Layout, Database, Clock } from 'lucide-react'

export type WidgetType = 
  | 'LINE_CHART' 
  | 'BAR_CHART' 
  | 'PIE_CHART' 
  | 'KPI_CARD' 
  | 'DATA_TABLE' 
  | 'GEO_MAP' 
  | 'REALTIME_COUNTER'
  | 'FUNNEL_CHART'

export interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  description?: string
  dataSource: {
    metrics: string[]
    dimensions: string[]
    dateRange: string
    filters?: Record<string, string>
  }
  visualization: {
    colorScheme: string
    showLegend: boolean
    showGrid: boolean
    chartHeight: number
    chartType?: string
  }
  refreshRate: number
  size: {
    width: number
    height: number
  }
}

interface WidgetConfigPanelProps {
  widget: WidgetConfig
  onSave: (config: WidgetConfig) => void
  onClose: () => void
  availableMetrics?: string[]
  availableDimensions?: string[]
}

const METRICS = [
  'sessions',
  'users',
  'pageviews',
  'bounceRate',
  'avgSessionDuration',
  'eventsPerSession',
  'conversions',
  'revenue',
]

const DIMENSIONS = [
  'date',
  'country',
  'city',
  'deviceCategory',
  'browser',
  'operatingSystem',
  'landingPage',
  'source',
  'medium',
  'campaign',
]

const COLOR_SCHEMES = [
  { name: 'Default', value: 'default', colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'] },
  { name: 'Pastel', value: 'pastel', colors: ['#93C5FD', '#86EFAC', '#FDE047', '#FCA5A5'] },
  { name: 'Dark', value: 'dark', colors: ['#1E40AF', '#059669', '#D97706', '#DC2626'] },
  { name: 'Monochrome', value: 'mono', colors: ['#111827', '#4B5563', '#9CA3AF', '#E5E7EB'] },
]

export default function WidgetConfigPanel({
  widget,
  onSave,
  onClose,
  availableMetrics = METRICS,
  availableDimensions = DIMENSIONS,
}: WidgetConfigPanelProps) {
  const [config, setConfig] = useState<WidgetConfig>(widget)
  const [activeTab, setActiveTab] = useState<'data' | 'visual' | 'settings'>('data')

  const updateConfig = (updates: Partial<WidgetConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const updateDataSource = (updates: Partial<WidgetConfig['dataSource']>) => {
    setConfig(prev => ({
      ...prev,
      dataSource: { ...prev.dataSource, ...updates }
    }))
  }

  const updateVisualization = (updates: Partial<WidgetConfig['visualization']>) => {
    setConfig(prev => ({
      ...prev,
      visualization: { ...prev.visualization, ...updates }
    }))
  }

  const handleSave = () => {
    onSave(config)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Configure Widget</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('data')}
              className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'data'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Database className="w-4 h-4" />
              Data Source
            </button>
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'visual'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Palette className="w-4 h-4" />
              Visualization
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layout className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* Metrics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metrics
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableMetrics.map(metric => (
                    <label key={metric} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.dataSource.metrics.includes(metric)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateDataSource({
                              metrics: [...config.dataSource.metrics, metric]
                            })
                          } else {
                            updateDataSource({
                              metrics: config.dataSource.metrics.filter(m => m !== metric)
                            })
                          }
                        }}
                        className="mr-2 rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{metric}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableDimensions.map(dimension => (
                    <label key={dimension} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.dataSource.dimensions.includes(dimension)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateDataSource({
                              dimensions: [...config.dataSource.dimensions, dimension]
                            })
                          } else {
                            updateDataSource({
                              dimensions: config.dataSource.dimensions.filter(d => d !== dimension)
                            })
                          }
                        }}
                        className="mr-2 rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{dimension}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={config.dataSource.dateRange}
                  onChange={(e) => updateDataSource({ dateRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="last90days">Last 90 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisYear">This Year</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'visual' && (
            <div className="space-y-6">
              {/* Color Scheme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Scheme
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {COLOR_SCHEMES.map(scheme => (
                    <button
                      key={scheme.value}
                      onClick={() => updateVisualization({ colorScheme: scheme.value })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        config.visualization.colorScheme === scheme.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium mb-2">{scheme.name}</div>
                      <div className="flex gap-1">
                        {scheme.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Options */}
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.visualization.showLegend}
                    onChange={(e) => updateVisualization({ showLegend: e.target.checked })}
                    className="mr-3 rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Show Legend</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.visualization.showGrid}
                    onChange={(e) => updateVisualization({ showGrid: e.target.checked })}
                    className="mr-3 rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Show Grid Lines</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chart Height (px)
                  </label>
                  <input
                    type="number"
                    value={config.visualization.chartHeight}
                    onChange={(e) => updateVisualization({ chartHeight: parseInt(e.target.value) })}
                    min="200"
                    max="800"
                    step="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Widget Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Widget Title
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => updateConfig({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter widget title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={config.description || ''}
                  onChange={(e) => updateConfig({ description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Add a description for this widget"
                />
              </div>

              {/* Refresh Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Auto Refresh Rate
                </label>
                <select
                  value={config.refreshRate}
                  onChange={(e) => updateConfig({ refreshRate: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0">No auto refresh</option>
                  <option value="60">Every minute</option>
                  <option value="300">Every 5 minutes</option>
                  <option value="900">Every 15 minutes</option>
                  <option value="1800">Every 30 minutes</option>
                  <option value="3600">Every hour</option>
                </select>
              </div>

              {/* Widget Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width (columns)
                  </label>
                  <select
                    value={config.size.width}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      size: { ...prev.size, width: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="1">1 column</option>
                    <option value="2">2 columns</option>
                    <option value="3">3 columns</option>
                    <option value="4">Full width</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (rows)
                  </label>
                  <select
                    value={config.size.height}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      size: { ...prev.size, height: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="1">1 row</option>
                    <option value="2">2 rows</option>
                    <option value="3">3 rows</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => setConfig(widget)}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}