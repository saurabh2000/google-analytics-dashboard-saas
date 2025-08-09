'use client'

import { useState, useEffect } from 'react'
import { 
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Monitor,
  Cloud,
  Lock
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'

interface SystemMetrics {
  server: {
    uptime: number
    cpu: number
    memory: number
    disk: number
    load: number[]
    responseTime: number
  }
  database: {
    connections: number
    maxConnections: number
    queryTime: number
    slowQueries: number
    tableSize: number
  }
  network: {
    bandwidth: number
    requests: number
    errors: number
    latency: number
  }
  cache: {
    hitRate: number
    size: number
    evictions: number
  }
  background: {
    activeJobs: number
    queuedJobs: number
    failedJobs: number
    completedJobs: number
  }
}

interface SystemAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  resolved: boolean
  component: string
}

interface PerformanceData {
  timestamp: string
  cpu: number
  memory: number
  responseTime: number
  requests: number
  errors: number
}

// Mock data generators
function generateSystemMetrics(): SystemMetrics {
  return {
    server: {
      uptime: 99.97,
      cpu: 34.5 + Math.random() * 10,
      memory: 67.2 + Math.random() * 15,
      disk: 23.8 + Math.random() * 5,
      load: [1.2, 0.9, 1.4],
      responseTime: 120 + Math.random() * 50
    },
    database: {
      connections: 45,
      maxConnections: 100,
      queryTime: 23.4,
      slowQueries: 3,
      tableSize: 2.4
    },
    network: {
      bandwidth: 85.3,
      requests: 12847,
      errors: 23,
      latency: 34.2
    },
    cache: {
      hitRate: 94.5,
      size: 512,
      evictions: 12
    },
    background: {
      activeJobs: 8,
      queuedJobs: 23,
      failedJobs: 2,
      completedJobs: 1847
    }
  }
}

function generateSystemAlerts(): SystemAlert[] {
  const alerts = [
    {
      id: 'alert-1',
      type: 'warning' as const,
      title: 'High Memory Usage',
      message: 'Memory usage is at 85% capacity',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      resolved: false,
      component: 'Server'
    },
    {
      id: 'alert-2',
      type: 'info' as const,
      title: 'Database Backup Complete',
      message: 'Scheduled backup completed successfully',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resolved: true,
      component: 'Database'
    },
    {
      id: 'alert-3',
      type: 'critical' as const,
      title: 'SSL Certificate Expiring',
      message: 'SSL certificate expires in 7 days',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      resolved: false,
      component: 'Security'
    }
  ]
  
  return alerts
}

function generatePerformanceData(): PerformanceData[] {
  const data = []
  const now = new Date()
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
    data.push({
      timestamp: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cpu: 30 + Math.random() * 20,
      memory: 60 + Math.random() * 20,
      responseTime: 100 + Math.random() * 100,
      requests: 800 + Math.random() * 400,
      errors: Math.floor(Math.random() * 20)
    })
  }
  
  return data
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'up',
  format = 'number',
  color = 'blue',
  subtitle,
  status
}: {
  title: string
  value: number
  change?: number
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'stable'
  format?: 'number' | 'percentage' | 'ms' | 'mb' | 'gb'
  color?: string
  subtitle?: string
  status?: 'good' | 'warning' | 'critical'
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'ms':
        return `${val.toFixed(0)}ms`
      case 'mb':
        return `${val.toFixed(1)}MB`
      case 'gb':
        return `${val.toFixed(1)}GB`
      default:
        return val.toLocaleString()
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'border-green-200 bg-green-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'critical': return 'border-red-200 bg-red-50'
      default: return 'border-gray-200 bg-white'
    }
  }

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-500'
  }

  return (
    <div className={`rounded-lg shadow p-6 border ${getStatusColor()}`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${colorClasses[color]} rounded-md p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="text-lg font-medium text-gray-900">
              {formatValue(value)}
            </dd>
            {subtitle && (
              <dd className="text-sm text-gray-500">{subtitle}</dd>
            )}
          </dl>
        </div>
        {change !== undefined && (
          <div className={`flex items-center ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-4 w-4 mr-1" />
            ) : null}
            <span className="text-sm font-medium">
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function AlertCard({ alert }: { alert: SystemAlert }) {
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'info': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info': return <CheckCircle className="h-5 w-5 text-blue-500" />
      default: return <CheckCircle className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${getAlertColor(alert.type)} ${alert.resolved ? 'opacity-60' : ''}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getAlertIcon(alert.type)}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              {alert.title}
            </h4>
            <span className="text-xs text-gray-500">
              {alert.component}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {alert.message}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {alert.timestamp.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SystemPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'alerts' | 'config'>('overview')

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setMetrics(generateSystemMetrics())
      setAlerts(generateSystemAlerts())
      setPerformanceData(generatePerformanceData())
      setLoading(false)
    }, 1000)
  }, [])

  if (loading || !metrics) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32" />
          ))}
        </div>
        <div className="bg-gray-200 rounded-lg h-96" />
      </div>
    )
  }

  const criticalAlerts = alerts.filter(a => a.type === 'critical' && !a.resolved)
  const warningAlerts = alerts.filter(a => a.type === 'warning' && !a.resolved)

  return (
    <div className="space-y-6">
      {/* System Status Banner */}
      {criticalAlerts.length > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''} Require Attention
              </p>
            </div>
          </div>
        </div>
      ) : warningAlerts.length > 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                {warningAlerts.length} Warning{warningAlerts.length > 1 ? 's' : ''} Detected
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                All systems operational
              </p>
              <p className="text-xs text-green-600">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key System Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="System Uptime"
          value={metrics.server.uptime}
          icon={Activity}
          format="percentage"
          color="green"
          status={metrics.server.uptime > 99.5 ? 'good' : 'warning'}
        />
        <MetricCard
          title="CPU Usage"
          value={metrics.server.cpu}
          icon={Cpu}
          format="percentage"
          color={metrics.server.cpu > 80 ? 'red' : metrics.server.cpu > 60 ? 'yellow' : 'blue'}
          status={metrics.server.cpu > 80 ? 'critical' : metrics.server.cpu > 60 ? 'warning' : 'good'}
        />
        <MetricCard
          title="Memory Usage"
          value={metrics.server.memory}
          icon={HardDrive}
          format="percentage"
          color={metrics.server.memory > 80 ? 'red' : metrics.server.memory > 60 ? 'yellow' : 'blue'}
          status={metrics.server.memory > 80 ? 'critical' : metrics.server.memory > 60 ? 'warning' : 'good'}
        />
        <MetricCard
          title="Response Time"
          value={metrics.server.responseTime}
          icon={Zap}
          format="ms"
          color={metrics.server.responseTime > 200 ? 'red' : metrics.server.responseTime > 150 ? 'yellow' : 'green'}
          status={metrics.server.responseTime > 200 ? 'critical' : metrics.server.responseTime > 150 ? 'warning' : 'good'}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="DB Connections"
          value={metrics.database.connections}
          icon={Database}
          color="purple"
          subtitle={`/ ${metrics.database.maxConnections} max`}
        />
        <MetricCard
          title="Network Requests"
          value={metrics.network.requests}
          icon={Wifi}
          color="blue"
          subtitle="last hour"
        />
        <MetricCard
          title="Cache Hit Rate"
          value={metrics.cache.hitRate}
          icon={Server}
          format="percentage"
          color="green"
        />
        <MetricCard
          title="Active Jobs"
          value={metrics.background.activeJobs}
          icon={RefreshCw}
          color="yellow"
          subtitle={`${metrics.background.queuedJobs} queued`}
        />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'performance', name: 'Performance', icon: TrendingUp },
              { id: 'alerts', name: 'Alerts', icon: AlertTriangle, badge: criticalAlerts.length + warningAlerts.length },
              { id: 'config', name: 'Configuration', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'performance' | 'alerts' | 'config')}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } relative whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-medium">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resource Usage */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Usage</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">CPU</span>
                        <span className="text-sm text-gray-500">{metrics.server.cpu.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${metrics.server.cpu > 80 ? 'bg-red-500' : metrics.server.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${metrics.server.cpu}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Memory</span>
                        <span className="text-sm text-gray-500">{metrics.server.memory.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${metrics.server.memory > 80 ? 'bg-red-500' : metrics.server.memory > 60 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                          style={{ width: `${metrics.server.memory}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Disk</span>
                        <span className="text-sm text-gray-500">{metrics.server.disk.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gray-500"
                          style={{ width: `${metrics.server.disk}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Load Average</span>
                      <span className="text-sm text-gray-900">{metrics.server.load.join(', ')}</span>
                    </div>
                    <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">DB Query Time</span>
                      <span className="text-sm text-gray-900">{metrics.database.queryTime.toFixed(1)}ms</span>
                    </div>
                    <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Cache Size</span>
                      <span className="text-sm text-gray-900">{metrics.cache.size}MB</span>
                    </div>
                    <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Network Errors</span>
                      <span className="text-sm text-gray-900">{metrics.network.errors}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CPU & Memory */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">CPU & Memory Usage (24h)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="cpu" stackId="1" stroke="#8884d8" fill="#8884d8" opacity={0.6} />
                      <Area type="monotone" dataKey="memory" stackId="1" stroke="#82ca9d" fill="#82ca9d" opacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Response Time */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Response Time (24h)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="responseTime" stroke="#ff7c7c" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Request Volume */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Request Volume & Errors (24h)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#82ca9d" />
                    <Bar dataKey="errors" fill="#ff7c7c" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>

              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts</h3>
                  <p className="mt-1 text-sm text-gray-500">All systems are running normally.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Server Configuration */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Server className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Server Configuration</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Node.js Version</span>
                      <span className="text-sm font-medium text-gray-900">18.17.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Environment</span>
                      <span className="text-sm font-medium text-gray-900">Production</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Max Memory</span>
                      <span className="text-sm font-medium text-gray-900">4GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Worker Processes</span>
                      <span className="text-sm font-medium text-gray-900">4</span>
                    </div>
                  </div>
                </div>

                {/* Database Configuration */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Database className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Database Configuration</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">PostgreSQL Version</span>
                      <span className="text-sm font-medium text-gray-900">15.4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Max Connections</span>
                      <span className="text-sm font-medium text-gray-900">100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Shared Buffers</span>
                      <span className="text-sm font-medium text-gray-900">256MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Work Memory</span>
                      <span className="text-sm font-medium text-gray-900">4MB</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-yellow-400 mr-2" />
                  <p className="text-sm font-medium text-yellow-800">
                    System configuration changes require administrator privileges
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}