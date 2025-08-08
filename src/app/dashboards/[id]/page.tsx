'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Settings, Share2, Download, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import WidgetFactory from '@/components/widgets/WidgetFactory'
import WidgetConfigPanel, { WidgetConfig } from '@/components/widgets/WidgetConfigPanel'

interface Dashboard {
  id: string
  name: string
  description: string
  widgets: WidgetConfig[]
  layout: any
  isDefault: boolean
  updatedAt: string
}

export default function DashboardViewPage() {
  const params = useParams()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchDashboard()
    }
  }, [params.id])

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`/api/dashboards/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setDashboard(data.dashboard)
      } else if (res.status === 404) {
        router.push('/dashboards')
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateDashboard = async (updates: Partial<Dashboard>) => {
    if (!dashboard) return

    try {
      const res = await fetch(`/api/dashboards/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      
      if (res.ok) {
        const data = await res.json()
        setDashboard(data.dashboard)
      }
    } catch (error) {
      console.error('Error updating dashboard:', error)
    }
  }

  const handleSaveWidget = async (config: WidgetConfig) => {
    if (!dashboard) return

    let updatedWidgets: WidgetConfig[]
    
    if (dashboard.widgets.find(w => w.id === config.id)) {
      // Update existing widget
      updatedWidgets = dashboard.widgets.map(w => 
        w.id === config.id ? config : w
      )
    } else {
      // Add new widget
      updatedWidgets = [...dashboard.widgets, config]
    }

    await updateDashboard({ widgets: updatedWidgets })
    setEditingWidget(null)
  }

  const handleDeleteWidget = async (widgetId: string) => {
    if (!dashboard) return

    const updatedWidgets = dashboard.widgets.filter(w => w.id !== widgetId)
    await updateDashboard({ widgets: updatedWidgets })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    // In production, this would refresh data from Google Analytics
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const handleExport = () => {
    if (!dashboard) return
    
    // Export dashboard configuration as JSON
    const exportData = {
      name: dashboard.name,
      description: dashboard.description,
      widgets: dashboard.widgets,
      exportedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-${dashboard.name.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard not found</h2>
          <Link href="/dashboards" className="text-blue-600 hover:underline">
            Back to dashboards
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboards"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{dashboard.name}</h1>
                {dashboard.description && (
                  <p className="text-sm text-gray-600">{dashboard.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleExport}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Export dashboard"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share dashboard"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <Link
                href={`/dashboards/${params.id}/edit`}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Dashboard settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
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

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dashboard.widgets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets yet</h3>
            <p className="text-gray-600 mb-6">Add widgets to start visualizing your data</p>
            <button
              onClick={() => setShowAddWidget(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              Add Your First Widget
            </button>
          </div>
        ) : (
          <div className="grid gap-6" style={{
            gridTemplateColumns: `repeat(${dashboard.layout?.cols || 4}, 1fr)`,
            gridAutoRows: `${dashboard.layout?.rowHeight || 100}px`,
          }}>
            {dashboard.widgets.map(widget => (
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
        <WidgetConfigPanel
          widget={{
            id: Date.now().toString(),
            type: 'LINE_CHART',
            title: 'New Widget',
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
          }}
          onSave={handleSaveWidget}
          onClose={() => setShowAddWidget(false)}
        />
      )}

      {/* Edit Widget Modal */}
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