'use client'

import { useState } from 'react'
import { Plus, Settings, Grid3X3 } from 'lucide-react'
import WidgetFactory from '@/components/widgets/WidgetFactory'
import WidgetConfigPanel, { WidgetConfig, WidgetType } from '@/components/widgets/WidgetConfigPanel'
import DraggableWidgetGrid from '@/components/dashboard/DraggableWidgetGrid'

// Initial demo widgets
const INITIAL_WIDGETS: WidgetConfig[] = [
  {
    id: '1',
    type: 'KPI_CARD',
    title: 'Total Users',
    dataSource: {
      metrics: ['users'],
      dimensions: [],
      dateRange: 'last30days',
    },
    visualization: {
      colorScheme: 'default',
      showLegend: false,
      showGrid: false,
      chartHeight: 300,
    },
    refreshRate: 300,
    size: { width: 1, height: 1 },
  },
  {
    id: '2',
    type: 'LINE_CHART',
    title: 'Sessions Over Time',
    dataSource: {
      metrics: ['sessions'],
      dimensions: ['date'],
      dateRange: 'last30days',
    },
    visualization: {
      colorScheme: 'default',
      showLegend: true,
      showGrid: true,
      chartHeight: 400,
    },
    refreshRate: 300,
    size: { width: 2, height: 2 },
  },
  {
    id: '3',
    type: 'PIE_CHART',
    title: 'Device Categories',
    dataSource: {
      metrics: ['sessions'],
      dimensions: ['deviceCategory'],
      dateRange: 'last30days',
    },
    visualization: {
      colorScheme: 'default',
      showLegend: true,
      showGrid: false,
      chartHeight: 300,
    },
    refreshRate: 600,
    size: { width: 1, height: 2 },
  },
  {
    id: '4',
    type: 'DATA_TABLE',
    title: 'Top Pages',
    dataSource: {
      metrics: ['pageviews', 'bounceRate', 'avgSessionDuration'],
      dimensions: ['landingPage'],
      dateRange: 'last30days',
    },
    visualization: {
      colorScheme: 'default',
      showLegend: false,
      showGrid: true,
      chartHeight: 400,
    },
    refreshRate: 900,
    size: { width: 3, height: 2 },
  },
]

const WIDGET_TYPES: { type: WidgetType; label: string; description: string }[] = [
  { type: 'LINE_CHART', label: 'Line Chart', description: 'Show trends over time' },
  { type: 'BAR_CHART', label: 'Bar Chart', description: 'Compare categories' },
  { type: 'PIE_CHART', label: 'Pie Chart', description: 'Show distribution' },
  { type: 'KPI_CARD', label: 'KPI Card', description: 'Display key metrics' },
  { type: 'DATA_TABLE', label: 'Data Table', description: 'Tabular data view' },
  { type: 'GEO_MAP', label: 'Geographic Map', description: 'Location-based data' },
  { type: 'REALTIME_COUNTER', label: 'Real-time Counter', description: 'Live metrics' },
  { type: 'FUNNEL_CHART', label: 'Funnel Chart', description: 'Conversion funnel' },
]

export default function WidgetsDashboardPage() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(INITIAL_WIDGETS)
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [gridView, setGridView] = useState(true)

  const handleAddWidget = (type: WidgetType) => {
    const newWidget: WidgetConfig = {
      id: Date.now().toString(),
      type,
      title: `New ${type.replace('_', ' ').toLowerCase()}`,
      dataSource: {
        metrics: [],
        dimensions: [],
        dateRange: 'last30days',
      },
      visualization: {
        colorScheme: 'default',
        showLegend: true,
        showGrid: true,
        chartHeight: 400,
      },
      refreshRate: 300,
      size: { width: 2, height: 2 },
    }
    setEditingWidget(newWidget)
    setShowAddWidget(false)
  }

  const handleSaveWidget = (config: WidgetConfig) => {
    if (widgets.find(w => w.id === config.id)) {
      setWidgets(widgets.map(w => w.id === config.id ? config : w))
    } else {
      setWidgets([...widgets, config])
    }
    setEditingWidget(null)
  }

  const handleDeleteWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id))
  }

  const handleReorderWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard Widgets</h1>
              <p className="text-sm text-gray-600 mt-1">
                Customize your dashboard with configurable widgets
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGridView(!gridView)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={gridView ? 'Switch to list view' : 'Switch to grid view'}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowAddWidget(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Widget
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {widgets.length === 0 ? (
          <div className="text-center py-16">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first widget</p>
            <button
              onClick={() => setShowAddWidget(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              Add Widget
            </button>
          </div>
        ) : gridView ? (
          <DraggableWidgetGrid
            widgets={widgets}
            onReorder={handleReorderWidgets}
            renderWidget={(widget) => (
              <WidgetFactory
                config={widget}
                onEdit={() => setEditingWidget(widget)}
                onDelete={() => handleDeleteWidget(widget.id)}
              />
            )}
          />
        ) : (
          <div className="grid gap-6" style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gridAutoRows: 'minmax(200px, auto)'
          }}>
            {widgets.map(widget => (
              <WidgetFactory
                key={widget.id}
                config={widget}
                onEdit={() => setEditingWidget(widget)}
                onDelete={() => handleDeleteWidget(widget.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add New Widget</h2>
              <button
                onClick={() => setShowAddWidget(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[60vh]">
              {WIDGET_TYPES.map(({ type, label, description }) => (
                <button
                  key={type}
                  onClick={() => handleAddWidget(type)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <h3 className="font-medium text-gray-900 mb-1">{label}</h3>
                  <p className="text-sm text-gray-600">{description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Widget Config Panel */}
      {editingWidget && (
        <WidgetConfigPanel
          widget={editingWidget}
          onSave={handleSaveWidget}
          onClose={() => setEditingWidget(null)}
        />
      )}
    </div>
  )
}