'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Settings, Trash2, Copy, Star, StarOff, Layout, Search } from 'lucide-react'
import Link from 'next/link'

interface Dashboard {
  id: string
  name: string
  description: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
  widgets: Record<string, unknown>[]
}

export default function DashboardsPage() {
  const router = useRouter()
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newDashboard, setNewDashboard] = useState({ name: '', description: '' })

  useEffect(() => {
    fetchDashboards()
  }, [])

  const fetchDashboards = async () => {
    try {
      const res = await fetch('/api/dashboards')
      const data = await res.json()
      setDashboards(data.dashboards || [])
    } catch (error) {
      console.error('Error fetching dashboards:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDashboard = async () => {
    if (!newDashboard.name.trim()) return

    try {
      const res = await fetch('/api/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDashboard),
      })
      
      if (res.ok) {
        const data = await res.json()
        setDashboards([...dashboards, data.dashboard])
        setShowCreateModal(false)
        setNewDashboard({ name: '', description: '' })
        router.push(`/dashboards/${data.dashboard.id}`)
      }
    } catch (error) {
      console.error('Error creating dashboard:', error)
    }
  }

  const deleteDashboard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dashboard?')) return

    try {
      const res = await fetch(`/api/dashboards/${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        setDashboards(dashboards.filter(d => d.id !== id))
      }
    } catch (error) {
      console.error('Error deleting dashboard:', error)
    }
  }

  const setDefaultDashboard = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })
      
      if (res.ok) {
        setDashboards(dashboards.map(d => ({
          ...d,
          isDefault: d.id === id,
        })))
      }
    } catch (error) {
      console.error('Error setting default dashboard:', error)
    }
  }

  const duplicateDashboard = async (dashboard: Dashboard) => {
    try {
      const res = await fetch('/api/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${dashboard.name} (Copy)`,
          description: dashboard.description,
          widgets: dashboard.widgets,
        }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setDashboards([...dashboards, data.dashboard])
      }
    } catch (error) {
      console.error('Error duplicating dashboard:', error)
    }
  }

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dashboard.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Dashboards</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and organize your analytics dashboards
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search dashboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Dashboards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredDashboards.length === 0 ? (
          <div className="text-center py-16">
            <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No dashboards found' : 'No dashboards yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try a different search term' : 'Get started by creating your first dashboard'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create Dashboard
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDashboards.map(dashboard => (
              <div
                key={dashboard.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link
                      href={`/dashboards/${dashboard.id}`}
                      className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {dashboard.name}
                    </Link>
                    {dashboard.isDefault && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Default
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setDefaultDashboard(dashboard.id)}
                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                    title={dashboard.isDefault ? 'Default dashboard' : 'Set as default'}
                  >
                    {dashboard.isDefault ? (
                      <Star className="w-5 h-5 fill-current text-yellow-500" />
                    ) : (
                      <StarOff className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                {dashboard.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {dashboard.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{dashboard.widgets.length} widgets</span>
                  <span>Updated {new Date(dashboard.updatedAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboards/${dashboard.id}`}
                    className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => duplicateDashboard(dashboard)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/dashboards/${dashboard.id}/edit`}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteDashboard(dashboard.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Dashboard Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Dashboard</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dashboard Name
                  </label>
                  <input
                    type="text"
                    value={newDashboard.name}
                    onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Marketing Overview"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newDashboard.description}
                    onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Describe what this dashboard is for..."
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewDashboard({ name: '', description: '' })
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createDashboard}
                disabled={!newDashboard.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}