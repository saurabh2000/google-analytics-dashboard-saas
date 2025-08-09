'use client'

import { useState, useEffect } from 'react'
import { 
  Shield,
  Lock,
  Unlock,
  Key,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Globe,
  User,
  Calendar,
  RefreshCw,
  Download,
  Search,
  Filter,
  Ban,
  Activity,
  Fingerprint,
  Server
} from 'lucide-react'

interface SecurityEvent {
  id: string
  type: 'login_attempt' | 'failed_login' | 'password_change' | 'permission_change' | 'suspicious_activity' | 'data_access' | 'api_key_usage'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  userId?: string
  userEmail?: string
  ipAddress: string
  userAgent: string
  location?: string
  timestamp: Date
  resolved: boolean
  metadata?: Record<string, unknown>
}

interface SecurityMetrics {
  totalEvents: number
  criticalEvents: number
  failedLogins: number
  suspiciousActivity: number
  activeApiKeys: number
  expiredCertificates: number
  vulnerabilities: number
  complianceScore: number
}

interface ApiKey {
  id: string
  name: string
  key: string
  tenantId?: string
  tenantName?: string
  createdBy: string
  createdAt: Date
  lastUsed?: Date
  expiresAt?: Date
  permissions: string[]
  status: 'active' | 'revoked' | 'expired'
  usageCount: number
}

// Mock data generators
function generateSecurityMetrics(): SecurityMetrics {
  return {
    totalEvents: 15847,
    criticalEvents: 3,
    failedLogins: 23,
    suspiciousActivity: 8,
    activeApiKeys: 45,
    expiredCertificates: 1,
    vulnerabilities: 2,
    complianceScore: 94.5
  }
}

function generateSecurityEvents(): SecurityEvent[] {
  const types: SecurityEvent['type'][] = ['login_attempt', 'failed_login', 'password_change', 'permission_change', 'suspicious_activity', 'data_access', 'api_key_usage']
  const severities: SecurityEvent['severity'][] = ['low', 'medium', 'high', 'critical']
  const locations = ['New York, US', 'London, UK', 'Tokyo, JP', 'Sydney, AU', 'Toronto, CA']
  
  const eventTitles = {
    login_attempt: 'Successful login',
    failed_login: 'Failed login attempt',
    password_change: 'Password changed',
    permission_change: 'User permissions modified',
    suspicious_activity: 'Suspicious activity detected',
    data_access: 'Sensitive data accessed',
    api_key_usage: 'API key used'
  }

  const eventDescriptions = {
    login_attempt: 'User successfully authenticated from new device',
    failed_login: 'Multiple failed login attempts detected',
    password_change: 'User password was successfully changed',
    permission_change: 'Admin modified user role permissions',
    suspicious_activity: 'Unusual access pattern detected',
    data_access: 'User accessed sensitive customer data',
    api_key_usage: 'API key used to access protected resources'
  }
  
  return Array.from({ length: 100 }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    
    return {
      id: `sec-${String(i + 1).padStart(6, '0')}`,
      type,
      severity,
      title: eventTitles[type],
      description: eventDescriptions[type],
      userId: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 100)}` : undefined,
      userEmail: Math.random() > 0.3 ? `user${Math.floor(Math.random() * 100)}@example.com` : undefined,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Chrome)',
      location: locations[Math.floor(Math.random() * locations.length)],
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      resolved: Math.random() > 0.7,
      metadata: Math.random() > 0.5 ? {
        attempts: Math.floor(Math.random() * 10) + 1,
        device: 'Chrome on Windows',
        riskScore: Math.floor(Math.random() * 100)
      } : undefined
    }
  })
}

function generateApiKeys(): ApiKey[] {
  const statuses: ApiKey['status'][] = ['active', 'revoked', 'expired']
  const tenants = ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Innovation Labs', 'Digital Agency']
  const permissions = ['read:analytics', 'write:reports', 'admin:users', 'manage:billing']
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `key-${String(i + 1).padStart(4, '0')}`,
    name: `API Key ${i + 1}`,
    key: `ak_${Math.random().toString(36).substr(2, 32)}`,
    tenantId: Math.random() > 0.3 ? `tenant-${Math.floor(Math.random() * 5)}` : undefined,
    tenantName: Math.random() > 0.3 ? tenants[Math.floor(Math.random() * tenants.length)] : undefined,
    createdBy: `admin-${Math.floor(Math.random() * 5)}`,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    lastUsed: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
    expiresAt: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000) : undefined,
    permissions: permissions.slice(0, Math.floor(Math.random() * permissions.length) + 1),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    usageCount: Math.floor(Math.random() * 10000)
  }))
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  format = 'number',
  status,
  onClick
}: {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color?: string
  format?: 'number' | 'percentage'
  status?: 'good' | 'warning' | 'critical'
  onClick?: () => void
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`
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
    purple: 'bg-purple-500'
  }

  return (
    <div 
      className={`rounded-lg shadow p-6 border ${getStatusColor()} ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
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
              {formatValue(value)}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )
}

function SecurityEventRow({ event, onAction }: { event: SecurityEvent; onAction: (action: string, id: string) => void }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'failed_login': return <Ban className="h-4 w-4" />
      case 'login_attempt': return <User className="h-4 w-4" />
      case 'password_change': return <Key className="h-4 w-4" />
      case 'permission_change': return <Shield className="h-4 w-4" />
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4" />
      case 'data_access': return <Eye className="h-4 w-4" />
      case 'api_key_usage': return <Server className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {event.timestamp.toLocaleString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getTypeIcon(event.type)}
          <span className="ml-2 text-sm text-gray-900">{event.title}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>
          {event.severity.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{event.userEmail || 'System'}</div>
        <div className="text-sm text-gray-500 font-mono">{event.ipAddress}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{event.location || 'Unknown'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {event.resolved ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <Clock className="h-5 w-5 text-yellow-500" />
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onAction('view', event.id)}
          className="text-blue-600 hover:text-blue-900 mr-3"
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </button>
        {!event.resolved && (
          <button
            onClick={() => onAction('resolve', event.id)}
            className="text-green-600 hover:text-green-900"
            title="Mark resolved"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        )}
      </td>
    </tr>
  )
}

function ApiKeyRow({ apiKey, onAction }: { apiKey: ApiKey; onAction: (action: string, id: string) => void }) {
  const [showKey, setShowKey] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'revoked': return 'bg-red-100 text-red-800 border-red-200'
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const maskKey = (key: string) => {
    return key.substring(0, 8) + '••••••••••••••••' + key.substring(key.length - 4)
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
        <div className="text-sm text-gray-500">{apiKey.id}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
            {showKey ? apiKey.key : maskKey(apiKey.key)}
          </code>
          <button
            onClick={() => setShowKey(!showKey)}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{apiKey.tenantName || 'System'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(apiKey.status)}`}>
          {apiKey.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{apiKey.usageCount.toLocaleString()}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {apiKey.lastUsed ? apiKey.lastUsed.toLocaleDateString() : 'Never'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {apiKey.expiresAt ? apiKey.expiresAt.toLocaleDateString() : 'No expiry'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onAction('view', apiKey.id)}
          className="text-blue-600 hover:text-blue-900 mr-3"
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </button>
        {apiKey.status === 'active' && (
          <button
            onClick={() => onAction('revoke', apiKey.id)}
            className="text-red-600 hover:text-red-900"
            title="Revoke key"
          >
            <Ban className="h-4 w-4" />
          </button>
        )}
      </td>
    </tr>
  )
}

export default function SecurityPage() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'api_keys' | 'compliance'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setMetrics(generateSecurityMetrics())
      setSecurityEvents(generateSecurityEvents())
      setApiKeys(generateApiKeys())
      setLoading(false)
    }, 1000)
  }, [])

  const handleEventAction = (action: string, id: string) => {
    if (action === 'view') {
      const event = securityEvents.find(e => e.id === id)
      if (event) {
        setSelectedEvent(event)
      }
    }
    console.log(`Action: ${action}, Event: ${id}`)
  }

  const handleApiKeyAction = (action: string, id: string) => {
    console.log(`Action: ${action}, API Key: ${id}`)
  }

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.userEmail && event.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesSeverity = severityFilter === '' || event.severity === severityFilter
    const matchesType = typeFilter === '' || event.type === typeFilter

    return matchesSearch && matchesSeverity && matchesType
  })

  const handleSeverityFilter = (severity: string) => {
    setSeverityFilter(severityFilter === severity ? '' : severity)
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
      {/* Security Status Banner */}
      {metrics.criticalEvents > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {metrics.criticalEvents} Critical Security Event{metrics.criticalEvents > 1 ? 's' : ''} Require Immediate Attention
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
                Security status: All systems secure
              </p>
              <p className="text-xs text-green-600">
                Last security scan: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Security Events"
          value={metrics.totalEvents}
          icon={Shield}
          color="blue"
        />
        <MetricCard
          title="Critical Events"
          value={metrics.criticalEvents}
          icon={AlertTriangle}
          color="red"
          status={metrics.criticalEvents > 0 ? 'critical' : 'good'}
          onClick={() => handleSeverityFilter('critical')}
        />
        <MetricCard
          title="Failed Login Attempts"
          value={metrics.failedLogins}
          icon={Ban}
          color="yellow"
          status={metrics.failedLogins > 50 ? 'warning' : 'good'}
        />
        <MetricCard
          title="Compliance Score"
          value={metrics.complianceScore}
          icon={CheckCircle}
          format="percentage"
          color="green"
          status={metrics.complianceScore >= 90 ? 'good' : 'warning'}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active API Keys"
          value={metrics.activeApiKeys}
          icon={Key}
          color="purple"
        />
        <MetricCard
          title="Suspicious Activities"
          value={metrics.suspiciousActivity}
          icon={Fingerprint}
          color="yellow"
          status={metrics.suspiciousActivity > 10 ? 'warning' : 'good'}
        />
        <MetricCard
          title="Expired Certificates"
          value={metrics.expiredCertificates}
          icon={Lock}
          color="red"
          status={metrics.expiredCertificates > 0 ? 'critical' : 'good'}
        />
        <MetricCard
          title="Known Vulnerabilities"
          value={metrics.vulnerabilities}
          icon={AlertTriangle}
          color="red"
          status={metrics.vulnerabilities > 0 ? 'critical' : 'good'}
        />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: Shield },
              { id: 'events', name: 'Security Events', icon: AlertTriangle, badge: metrics.criticalEvents },
              { id: 'api_keys', name: 'API Keys', icon: Key },
              { id: 'compliance', name: 'Compliance', icon: CheckCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'events' | 'api_keys' | 'compliance')}
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
                {/* Recent Critical Events */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Critical Events</h3>
                  {securityEvents.filter(e => e.severity === 'critical').slice(0, 5).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                      <p>No critical security events</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {securityEvents.filter(e => e.severity === 'critical').slice(0, 5).map((event) => (
                        <div key={event.id} className="border border-red-200 bg-red-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-red-800">{event.title}</h4>
                            <span className="text-xs text-red-600">{event.timestamp.toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-red-600 mt-1">{event.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Security Recommendations */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Recommendations</h3>
                  <div className="space-y-3">
                    <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-yellow-800">Enable 2FA for Admin Users</h4>
                      <p className="text-sm text-yellow-600 mt-1">Require two-factor authentication for all administrative accounts</p>
                    </div>
                    <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-blue-800">Update SSL Certificates</h4>
                      <p className="text-sm text-blue-600 mt-1">1 certificate expires within 30 days</p>
                    </div>
                    <div className="border border-green-200 bg-green-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-green-800">Review API Key Permissions</h4>
                      <p className="text-sm text-green-600 mt-1">Audit and minimize API key permissions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search security events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All types</option>
                    <option value="login_attempt">Login Attempts</option>
                    <option value="failed_login">Failed Logins</option>
                    <option value="password_change">Password Changes</option>
                    <option value="permission_change">Permission Changes</option>
                    <option value="suspicious_activity">Suspicious Activity</option>
                    <option value="data_access">Data Access</option>
                    <option value="api_key_usage">API Key Usage</option>
                  </select>

                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Events Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User / IP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEvents.slice(0, 20).map((event) => (
                      <SecurityEventRow
                        key={event.id}
                        event={event}
                        onAction={handleEventAction}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing {Math.min(20, filteredEvents.length)} of {filteredEvents.length} events
                </p>
              </div>
            </div>
          )}

          {activeTab === 'api_keys' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">API Keys Management</h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Key className="h-4 w-4" />
                  <span>Create API Key</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Used
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expires
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiKeys.map((apiKey) => (
                      <ApiKeyRow
                        key={apiKey.id}
                        apiKey={apiKey}
                        onAction={handleApiKeyAction}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compliance Score */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Overview</h3>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        {metrics.complianceScore.toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600">Overall Compliance Score</p>
                      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${metrics.complianceScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance Checklist */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Checklist</h3>
                  <div className="space-y-3">
                    {[
                      { item: 'Data Encryption at Rest', status: true },
                      { item: 'Data Encryption in Transit', status: true },
                      { item: 'Access Logging Enabled', status: true },
                      { item: 'Regular Security Audits', status: true },
                      { item: 'GDPR Data Processing Agreement', status: false },
                      { item: 'SOC 2 Type II Certification', status: false }
                    ].map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-900">{check.item}</span>
                        {check.status ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Security Event Details
                </h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Event ID</p>
                    <p className="text-sm text-gray-900">{selectedEvent.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Severity</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {selectedEvent.severity.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="text-sm text-gray-900">{selectedEvent.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Timestamp</p>
                    <p className="text-sm text-gray-900">{selectedEvent.timestamp.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedEvent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">IP Address</p>
                    <p className="text-sm text-gray-900 font-mono">{selectedEvent.ipAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-sm text-gray-900">{selectedEvent.location || 'Unknown'}</p>
                  </div>
                </div>

                {selectedEvent.metadata && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Additional Information</p>
                    <div className="bg-gray-100 rounded p-3">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(selectedEvent.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md"
                  >
                    Close
                  </button>
                  {!selectedEvent.resolved && (
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}