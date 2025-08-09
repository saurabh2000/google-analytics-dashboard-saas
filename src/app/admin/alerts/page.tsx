'use client'

import { useState, useEffect } from 'react'
import { 
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  XCircle,
  Info,
  Zap,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  Shield,
  Users,
  Activity,
  Mail,
  Smartphone,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

interface Alert {
  id: string
  title: string
  description: string
  type: 'system' | 'security' | 'performance' | 'business' | 'user'
  severity: 'info' | 'warning' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved'
  source: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  acknowledgedBy?: string
  metadata?: Record<string, unknown>
  threshold?: {
    metric: string
    condition: '>' | '<' | '==' | '!='
    value: number
    unit?: string
  }
  actions?: string[]
}

interface AlertRule {
  id: string
  name: string
  description: string
  type: 'threshold' | 'anomaly' | 'event'
  enabled: boolean
  metric: string
  condition: '>' | '<' | '==' | '!='
  value: number
  unit?: string
  severity: 'info' | 'warning' | 'critical'
  channels: ('email' | 'sms' | 'webhook' | 'slack')[]
  recipients: string[]
  cooldown: number
  createdAt: Date
  lastTriggered?: Date
  triggerCount: number
}

interface AlertMetrics {
  total: number
  active: number
  critical: number
  warning: number
  info: number
  acknowledged: number
  resolved: number
  avgResolutionTime: number
}

// Mock data generators
function generateAlertMetrics(): AlertMetrics {
  return {
    total: 234,
    active: 12,
    critical: 3,
    warning: 7,
    info: 2,
    acknowledged: 18,
    resolved: 204,
    avgResolutionTime: 2.4
  }
}

function generateAlerts(): Alert[] {
  const types: Alert['type'][] = ['system', 'security', 'performance', 'business', 'user']
  const severities: Alert['severity'][] = ['info', 'warning', 'critical']
  const statuses: Alert['status'][] = ['active', 'acknowledged', 'resolved']
  
  const alertTemplates = {
    system: [
      { title: 'High CPU Usage', description: 'Server CPU usage above 90% for 5 minutes' },
      { title: 'Low Disk Space', description: 'Disk usage above 85% on primary drive' },
      { title: 'Memory Usage Critical', description: 'RAM usage above 95% for 10 minutes' },
      { title: 'Service Down', description: 'Analytics service is not responding' }
    ],
    security: [
      { title: 'Multiple Failed Logins', description: 'More than 10 failed login attempts from single IP' },
      { title: 'Unusual Access Pattern', description: 'User accessed system outside normal hours' },
      { title: 'SSL Certificate Expiring', description: 'SSL certificate expires in 7 days' },
      { title: 'Suspicious API Usage', description: 'API key usage exceeded normal patterns' }
    ],
    performance: [
      { title: 'Slow Database Queries', description: 'Average query time above 2 seconds' },
      { title: 'High Error Rate', description: 'Error rate above 5% for API endpoints' },
      { title: 'Cache Miss Rate High', description: 'Cache miss rate above 20%' },
      { title: 'Response Time Degraded', description: 'Average response time above 1 second' }
    ],
    business: [
      { title: 'Revenue Drop Detected', description: 'Daily revenue 20% below forecast' },
      { title: 'High Churn Rate', description: 'Customer churn rate above 5% this month' },
      { title: 'Trial Conversion Low', description: 'Trial to paid conversion below 15%' },
      { title: 'Support Ticket Spike', description: 'Support tickets increased by 50%' }
    ],
    user: [
      { title: 'User Registration Drop', description: 'New user registrations down 30%' },
      { title: 'High User Inactivity', description: 'User activity decreased by 25%' },
      { title: 'Feature Usage Low', description: 'New feature adoption below 10%' },
      { title: 'User Satisfaction Drop', description: 'Customer satisfaction score below 4.0' }
    ]
  }

  return Array.from({ length: 50 }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const template = alertTemplates[type][Math.floor(Math.random() * alertTemplates[type].length)]
    
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000)
    
    return {
      id: `alert-${String(i + 1).padStart(4, '0')}`,
      title: template.title,
      description: template.description,
      type,
      severity,
      status,
      source: type === 'system' ? 'monitoring' : type === 'security' ? 'auth-service' : 'analytics',
      createdAt,
      updatedAt,
      resolvedAt: status === 'resolved' ? new Date(updatedAt.getTime() + Math.random() * 12 * 60 * 60 * 1000) : undefined,
      acknowledgedBy: status === 'acknowledged' || status === 'resolved' ? 'admin@example.com' : undefined,
      threshold: Math.random() > 0.5 ? {
        metric: 'cpu_usage',
        condition: '>',
        value: 90,
        unit: '%'
      } : undefined,
      actions: ['escalate', 'auto-scale', 'notify-team']
    }
  })
}

function generateAlertRules(): AlertRule[] {
  const channels: ('email' | 'sms' | 'webhook' | 'slack')[] = ['email', 'sms', 'webhook', 'slack']
  
  return [
    {
      id: 'rule-001',
      name: 'High CPU Usage',
      description: 'Trigger when CPU usage exceeds 90%',
      type: 'threshold',
      enabled: true,
      metric: 'cpu_usage',
      condition: '>',
      value: 90,
      unit: '%',
      severity: 'critical',
      channels: ['email', 'slack'],
      recipients: ['admin@example.com', 'ops-team@example.com'],
      cooldown: 300,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
      triggerCount: 15
    },
    {
      id: 'rule-002',
      name: 'Failed Login Attempts',
      description: 'Alert on multiple failed login attempts',
      type: 'threshold',
      enabled: true,
      metric: 'failed_logins',
      condition: '>',
      value: 10,
      severity: 'warning',
      channels: ['email'],
      recipients: ['security@example.com'],
      cooldown: 600,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      lastTriggered: new Date(Date.now() - 6 * 60 * 60 * 1000),
      triggerCount: 8
    },
    {
      id: 'rule-003',
      name: 'Revenue Drop',
      description: 'Monitor daily revenue drops',
      type: 'anomaly',
      enabled: true,
      metric: 'daily_revenue',
      condition: '<',
      value: -20,
      unit: '%',
      severity: 'critical',
      channels: ['email', 'sms'],
      recipients: ['ceo@example.com', 'finance@example.com'],
      cooldown: 3600,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      triggerCount: 2
    }
  ]
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  onClick
}: {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color?: string
  onClick?: () => void
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  }

  return (
    <div 
      className={`bg-white rounded-lg shadow p-6 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
    >
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
              {value.toLocaleString()}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )
}

function AlertRow({ alert, onAction }: { alert: Alert; onAction: (action: string, id: string) => void }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800 border-red-200'
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system': return <Server className="h-4 w-4" />
      case 'security': return <Shield className="h-4 w-4" />
      case 'performance': return <Zap className="h-4 w-4" />
      case 'business': return <TrendingUp className="h-4 w-4" />
      case 'user': return <Users className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'info': return <Info className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {alert.createdAt.toLocaleString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
          {getSeverityIcon(alert.severity)}
          <span className="ml-1 uppercase">{alert.severity}</span>
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getTypeIcon(alert.type)}
          <span className="ml-2 text-sm text-gray-900 capitalize">{alert.type}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{alert.title}</div>
        <div className="text-sm text-gray-500">{alert.description}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(alert.status)}`}>
          {alert.status === 'active' && <Clock className="h-3 w-3 mr-1" />}
          {alert.status === 'acknowledged' && <Eye className="h-3 w-3 mr-1" />}
          {alert.status === 'resolved' && <CheckCircle className="h-3 w-3 mr-1" />}
          {alert.status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {alert.source}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onAction('view', alert.id)}
          className="text-blue-600 hover:text-blue-900 mr-3"
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </button>
        {alert.status === 'active' && (
          <button
            onClick={() => onAction('acknowledge', alert.id)}
            className="text-yellow-600 hover:text-yellow-900 mr-3"
            title="Acknowledge"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        )}
        {alert.status !== 'resolved' && (
          <button
            onClick={() => onAction('resolve', alert.id)}
            className="text-green-600 hover:text-green-900"
            title="Resolve"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </td>
    </tr>
  )
}

function AlertRuleRow({ rule, onAction }: { rule: AlertRule; onAction: (action: string, id: string) => void }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {rule.enabled ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-400 mr-2" />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{rule.name}</div>
            <div className="text-sm text-gray-500">{rule.description}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {rule.metric} {rule.condition} {rule.value}{rule.unit}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          rule.severity === 'critical' ? 'bg-red-100 text-red-800 border-red-200' :
          rule.severity === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
          'bg-blue-100 text-blue-800 border-blue-200'
        }`}>
          {rule.severity.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-1">
          {rule.channels.map((channel) => (
            <span key={channel} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
              {channel === 'email' && <Mail className="h-3 w-3 mr-1" />}
              {channel === 'sms' && <Smartphone className="h-3 w-3 mr-1" />}
              {channel === 'slack' && <Activity className="h-3 w-3 mr-1" />}
              {channel === 'webhook' && <Zap className="h-3 w-3 mr-1" />}
              {channel}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {rule.triggerCount}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {rule.lastTriggered ? rule.lastTriggered.toLocaleDateString() : 'Never'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onAction('edit', rule.id)}
          className="text-blue-600 hover:text-blue-900 mr-3"
          title="Edit rule"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onAction('toggle', rule.id)}
          className="text-yellow-600 hover:text-yellow-900 mr-3"
          title={rule.enabled ? 'Disable' : 'Enable'}
        >
          {rule.enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <button
          onClick={() => onAction('delete', rule.id)}
          className="text-red-600 hover:text-red-900"
          title="Delete rule"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}

export default function AlertsPage() {
  const [metrics, setMetrics] = useState<AlertMetrics | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'rules' | 'settings'>('overview')
  const [severityFilter, setSeverityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setMetrics(generateAlertMetrics())
      setAlerts(generateAlerts())
      setAlertRules(generateAlertRules())
      setLoading(false)
    }, 1000)
  }, [])

  const handleAlertAction = (action: string, id: string) => {
    if (action === 'view') {
      const alert = alerts.find(a => a.id === id)
      if (alert) {
        setSelectedAlert(alert)
      }
    }
    console.log(`Alert action: ${action}, ID: ${id}`)
  }

  const handleRuleAction = (action: string, id: string) => {
    console.log(`Rule action: ${action}, ID: ${id}`)
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = severityFilter === '' || alert.severity === severityFilter
    const matchesStatus = statusFilter === '' || alert.status === statusFilter
    const matchesType = typeFilter === '' || alert.type === typeFilter

    return matchesSeverity && matchesStatus && matchesType
  })

  const handleSeverityFilter = (severity: string) => {
    setSeverityFilter(severityFilter === severity ? '' : severity)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(statusFilter === status ? '' : status)
  }

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

  return (
    <div className="space-y-6">
      {/* Alert Status Banner */}
      {metrics.critical > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {metrics.critical} Critical Alert{metrics.critical > 1 ? 's' : ''} Active
              </p>
              <p className="text-xs text-red-600">
                Immediate attention required
              </p>
            </div>
          </div>
        </div>
      ) : metrics.warning > 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                {metrics.warning} Warning Alert{metrics.warning > 1 ? 's' : ''} Active
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
                No critical alerts - system monitoring normal
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alert Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Alerts"
          value={metrics.total}
          icon={Bell}
          color="blue"
        />
        <MetricCard
          title="Active Alerts"
          value={metrics.active}
          icon={Clock}
          color="yellow"
          onClick={() => handleStatusFilter('active')}
        />
        <MetricCard
          title="Critical Alerts"
          value={metrics.critical}
          icon={XCircle}
          color="red"
          onClick={() => handleSeverityFilter('critical')}
        />
        <MetricCard
          title="Avg Resolution Time"
          value={metrics.avgResolutionTime}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'alerts', name: 'Alerts', icon: Bell, badge: metrics.active },
              { id: 'rules', name: 'Alert Rules', icon: Settings },
              { id: 'settings', name: 'Notification Settings', icon: Mail }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'history' | 'rules' | 'settings')}
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
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All severities</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="resolved">Resolved</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All types</option>
                  <option value="system">System</option>
                  <option value="security">Security</option>
                  <option value="performance">Performance</option>
                  <option value="business">Business</option>
                  <option value="user">User</option>
                </select>
              </div>

              {/* Alerts Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alert
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAlerts.slice(0, 20).map((alert) => (
                      <AlertRow
                        key={alert.id}
                        alert={alert}
                        onAction={handleAlertAction}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing {Math.min(20, filteredAlerts.length)} of {filteredAlerts.length} alerts
                </p>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Alert Rules</h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  <span>Create Rule</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rule Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Channels
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Triggered
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Triggered
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {alertRules.map((rule) => (
                      <AlertRuleRow
                        key={rule.id}
                        rule={rule}
                        onAction={handleRuleAction}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Email Settings */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Mail className="h-5 w-5 text-gray-600 mr-2" />
                    <h4 className="text-md font-medium text-gray-900">Email Notifications</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Critical Alerts</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Warning Alerts</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Info Alerts</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Daily Summary</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </div>

                {/* Slack Settings */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Activity className="h-5 w-5 text-gray-600 mr-2" />
                    <h4 className="text-md font-medium text-gray-900">Slack Integration</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Webhook URL</span>
                      <button className="text-blue-600 hover:text-blue-900 text-sm">Configure</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Default Channel</span>
                      <span className="text-sm text-gray-500">#alerts</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Mention @channel</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-yellow-400 mr-2" />
                  <p className="text-sm text-yellow-800">
                    Notification settings apply to all alert rules. Individual rules can override these defaults.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Alert Details
                </h2>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedAlert.title}</h3>
                  <p className="text-sm text-gray-600">{selectedAlert.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Severity</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      selectedAlert.severity === 'critical' ? 'bg-red-100 text-red-800 border-red-200' :
                      selectedAlert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {selectedAlert.severity.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-sm text-gray-900 capitalize">{selectedAlert.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="text-sm text-gray-900 capitalize">{selectedAlert.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Source</p>
                    <p className="text-sm text-gray-900">{selectedAlert.source}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-sm text-gray-900">{selectedAlert.createdAt.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Updated</p>
                    <p className="text-sm text-gray-900">{selectedAlert.updatedAt.toLocaleString()}</p>
                  </div>
                </div>

                {selectedAlert.threshold && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Threshold</p>
                    <div className="bg-gray-100 rounded p-3">
                      <p className="text-sm text-gray-700">
                        {selectedAlert.threshold.metric} {selectedAlert.threshold.condition} {selectedAlert.threshold.value}{selectedAlert.threshold.unit}
                      </p>
                    </div>
                  </div>
                )}

                {selectedAlert.metadata && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Additional Information</p>
                    <div className="bg-gray-100 rounded p-3">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(selectedAlert.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t">
                  <div className="flex space-x-3">
                    {selectedAlert.status === 'active' && (
                      <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md">
                        Acknowledge
                      </button>
                    )}
                    {selectedAlert.status !== 'resolved' && (
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
                        Mark Resolved
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}