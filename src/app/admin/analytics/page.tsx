'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Activity, Users, Zap, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

// Mock analytics data
const apiUsageData = [
  { date: '2024-01-01', requests: 12450, errors: 23, response_time: 145 },
  { date: '2024-01-02', requests: 13200, errors: 18, response_time: 132 },
  { date: '2024-01-03', requests: 14100, errors: 35, response_time: 156 },
  { date: '2024-01-04', requests: 13800, errors: 12, response_time: 128 },
  { date: '2024-01-05', requests: 15600, errors: 28, response_time: 142 },
  { date: '2024-01-06', requests: 14900, errors: 15, response_time: 138 },
  { date: '2024-01-07', requests: 16200, errors: 22, response_time: 149 }
]

const userActivityData = [
  { hour: '00:00', active_users: 245, sessions: 189 },
  { hour: '02:00', active_users: 156, sessions: 123 },
  { hour: '04:00', active_users: 89, sessions: 67 },
  { hour: '06:00', active_users: 234, sessions: 198 },
  { hour: '08:00', active_users: 567, sessions: 445 },
  { hour: '10:00', active_users: 789, sessions: 634 },
  { hour: '12:00', active_users: 834, sessions: 712 },
  { hour: '14:00', active_users: 756, sessions: 623 },
  { hour: '16:00', active_users: 645, sessions: 534 },
  { hour: '18:00', active_users: 567, sessions: 456 },
  { hour: '20:00', active_users: 434, sessions: 356 },
  { hour: '22:00', active_users: 323, sessions: 267 }
]

const endpointUsage = [
  { name: '/api/auth', requests: 34523, errors: 45 },
  { name: '/api/users', requests: 28934, errors: 23 },
  { name: '/api/analytics', requests: 19234, errors: 67 },
  { name: '/api/billing', requests: 15623, errors: 12 },
  { name: '/api/tenants', requests: 12456, errors: 8 }
]

const errorDistribution = [
  { name: '4xx Client Errors', value: 156, color: '#f59e0b' },
  { name: '5xx Server Errors', value: 89, color: '#ef4444' },
  { name: 'Timeout Errors', value: 45, color: '#8b5cf6' },
  { name: 'Rate Limit', value: 23, color: '#06b6d4' }
]

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'stable'
  color?: string
}

function MetricCard({ title, value, change, icon: Icon, trend = 'stable', color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${colorClasses[color]} rounded-md p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
        {change !== undefined && (
          <div className={`flex items-center ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            <TrendingUp className={`h-4 w-4 mr-1 ${trend === 'down' ? 'transform rotate-180' : ''}`} />
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-600">Platform usage and performance metrics</p>
        </div>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* System Health Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">All systems operational</p>
            <p className="text-xs text-green-600">99.97% uptime • Average response time: 142ms</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="API Requests"
          value="98.2K"
          change={12.5}
          icon={Activity}
          trend="up"
          color="blue"
        />
        <MetricCard
          title="Active Users"
          value="2,847"
          change={8.3}
          icon={Users}
          trend="up"
          color="green"
        />
        <MetricCard
          title="Avg Response Time"
          value="142ms"
          change={5.2}
          icon={Zap}
          trend="down"
          color="purple"
        />
        <MetricCard
          title="Error Rate"
          value="0.31%"
          change={15.7}
          icon={AlertTriangle}
          trend="down"
          color="red"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Usage Over Time */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">API Usage Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={apiUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis />
              <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
              <Area type="monotone" dataKey="requests" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Response Time Trends */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Response Time Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={apiUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [`${value}ms`, 'Response Time']}
              />
              <Line type="monotone" dataKey="response_time" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Activity by Hour */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="active_users" fill="#10b981" />
              <Bar dataKey="sessions" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Error Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Error Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={errorDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {errorDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Endpoints Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top API Endpoints</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Errors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {endpointUsage.map((endpoint, index) => (
                <tr key={endpoint.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm font-mono text-gray-900">{endpoint.name}</code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endpoint.requests.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endpoint.errors}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      (endpoint.errors / endpoint.requests) * 100 < 1 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {((endpoint.errors / endpoint.requests) * 100).toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}