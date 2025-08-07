'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertRule, AlertChannel, alertEvaluator } from '@/lib/alert-system'

interface AlertPanelProps {
  isOpen: boolean
  onClose: () => void
  analyticsData: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function AlertPanel({ isOpen, onClose, analyticsData }: AlertPanelProps) {
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules' | 'channels'>('alerts')
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [rules, setRules] = useState<AlertRule[]>([])
  const [channels, setChannels] = useState<AlertChannel[]>([])

  useEffect(() => {
    if (isOpen) {
      loadData()
      
      // Check for new alerts every 30 seconds
      const interval = setInterval(() => {
        if (analyticsData) {
          const newAlerts = alertEvaluator.evaluateAlerts(analyticsData)
          if (newAlerts.length > 0) {
            setAlerts(prev => [...newAlerts, ...prev])
            
            // Send notifications for new alerts
            newAlerts.forEach(alert => {
              alertEvaluator.sendAlertNotifications(alert)
            })
          }
        }
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [isOpen, analyticsData])

  const loadData = () => {
    setAlerts(alertEvaluator.getActiveAlerts())
    setRules(alertEvaluator.getAlertRules())
    setChannels(alertEvaluator.getAlertChannels())
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    alertEvaluator.acknowledgeAlert(alertId, 'current-user')
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true, acknowledgedAt: new Date() }
        : alert
    ))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Alert Management
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Monitor KPIs and get notified when thresholds are reached
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'alerts', label: 'Active Alerts', count: alerts.filter(a => !a.acknowledged).length },
                { key: 'rules', label: 'Alert Rules', count: rules.filter(r => r.enabled).length },
                { key: 'channels', label: 'Channels', count: channels.filter(c => c.enabled).length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'alerts' | 'rules' | 'channels')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'alerts' && (
              <AlertsTab 
                alerts={alerts}
                onAcknowledge={handleAcknowledgeAlert}
                onRefresh={loadData}
              />
            )}
            {activeTab === 'rules' && (
              <RulesTab 
                rules={rules}
                onRefresh={loadData}
              />
            )}
            {activeTab === 'channels' && (
              <ChannelsTab 
                channels={channels}
                onRefresh={loadData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Alerts Tab Component
function AlertsTab({ 
  alerts, 
  onAcknowledge, 
  onRefresh 
}: { 
  alerts: Alert[]
  onAcknowledge: (id: string) => void
  onRefresh: () => void
}) {
  const activeAlerts = alerts.filter(alert => !alert.acknowledged)
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged)

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🔴'
      case 'warning': return '🟡'
      case 'info': return '🟢'
      default: return '⚪'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'info': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔔</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No alerts yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Set up alert rules to monitor your KPIs automatically
        </p>
        <button
          onClick={onRefresh}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh Alerts
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="animate-pulse mr-2">🚨</span>
            Active Alerts ({activeAlerts.length})
          </h3>
          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {alert.message}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Triggered {new Date(alert.triggeredAt).toLocaleString()}
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs">
                        <span>KPI: {alert.kpi}</span>
                        <span>Current: {alert.currentValue.toLocaleString()}</span>
                        <span>Threshold: {alert.thresholdValue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm border border-gray-300 dark:border-gray-600 transition-colors"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Acknowledged Alerts ({acknowledgedAlerts.length})
          </h3>
          <div className="space-y-3">
            {acknowledgedAlerts.slice(0, 5).map(alert => (
              <div
                key={alert.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-75"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-xl opacity-50">{getSeverityIcon(alert.severity)}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {alert.message}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Acknowledged {alert.acknowledgedAt ? new Date(alert.acknowledgedAt).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Rules Tab Component
function RulesTab({ rules, onRefresh }: { rules: AlertRule[], onRefresh: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Alert Rules ({rules.length})
        </h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          Create Rule
        </button>
      </div>
      
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚙️</div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Alert Rules Coming Soon
        </h4>
        <p className="text-gray-500 dark:text-gray-400">
          Create custom rules to monitor your KPIs and get notified when thresholds are reached
        </p>
      </div>
    </div>
  )
}

// Channels Tab Component  
function ChannelsTab({ channels, onRefresh }: { channels: AlertChannel[], onRefresh: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Notification Channels ({channels.length})
        </h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          Add Channel
        </button>
      </div>

      <div className="space-y-4">
        {channels.map(channel => (
          <div
            key={channel.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {channel.type === 'email' && '📧'}
                {channel.type === 'sms' && '📱'}
                {channel.type === 'webhook' && '🔗'}
                {channel.type === 'slack' && '💬'}
                {channel.type === 'teams' && '👥'}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {channel.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {channel.type.charAt(0).toUpperCase() + channel.type.slice(1)}
                  {channel.config.email && ` • ${channel.config.email}`}
                  {channel.config.phone && ` • ${channel.config.phone}`}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                channel.enabled 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
              }`}>
                {channel.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}