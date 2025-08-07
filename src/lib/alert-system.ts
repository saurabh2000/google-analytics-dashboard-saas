// Alert system for monitoring KPIs and sending notifications
export interface AlertCondition {
  id: string
  name: string
  description: string
  kpi: string // KPI to monitor (users, sessions, conversion_rate, etc.)
  operator: 'greater_than' | 'less_than' | 'equals' | 'change_increase' | 'change_decrease'
  value: number
  timeframe: '1h' | '24h' | '7d' | '30d'
  enabled: boolean
  createdAt: Date
  lastTriggered?: Date
}

export interface AlertChannel {
  id: string
  type: 'email' | 'sms' | 'webhook' | 'slack' | 'teams'
  name: string
  config: {
    email?: string
    phone?: string
    webhookUrl?: string
    slackChannel?: string
    teamsWebhook?: string
  }
  enabled: boolean
}

export interface Alert {
  id: string
  conditionId: string
  triggeredAt: Date
  currentValue: number
  thresholdValue: number
  kpi: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  acknowledged: boolean
  acknowledgedAt?: Date
  acknowledgedBy?: string
  channels: string[] // Alert channel IDs
}

export interface AlertRule {
  id: string
  name: string
  conditions: AlertCondition[]
  channels: string[]
  enabled: boolean
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  lastChecked?: Date
  createdBy: string
  createdAt: Date
}

// Alert templates for common scenarios
export const getAlertTemplates = () => {
  return [
    {
      name: 'Traffic Drop Alert',
      description: 'Alert when website traffic drops significantly',
      conditions: [
        {
          kpi: 'users',
          operator: 'change_decrease' as const,
          value: 25,
          timeframe: '24h' as const
        }
      ],
      severity: 'warning' as const
    },
    {
      name: 'Conversion Rate Alert',
      description: 'Alert when conversion rate drops below threshold',
      conditions: [
        {
          kpi: 'conversion_rate',
          operator: 'less_than' as const,
          value: 2.0,
          timeframe: '24h' as const
        }
      ],
      severity: 'critical' as const
    },
    {
      name: 'High Bounce Rate',
      description: 'Alert when bounce rate exceeds acceptable limits',
      conditions: [
        {
          kpi: 'bounce_rate',
          operator: 'greater_than' as const,
          value: 70.0,
          timeframe: '24h' as const
        }
      ],
      severity: 'warning' as const
    },
    {
      name: 'Page Load Issues',
      description: 'Alert when average session duration drops dramatically',
      conditions: [
        {
          kpi: 'avg_session_duration',
          operator: 'change_decrease' as const,
          value: 40,
          timeframe: '1h' as const
        }
      ],
      severity: 'critical' as const
    },
    {
      name: 'Traffic Spike',
      description: 'Alert when traffic increases significantly (positive alert)',
      conditions: [
        {
          kpi: 'users',
          operator: 'change_increase' as const,
          value: 50,
          timeframe: '1h' as const
        }
      ],
      severity: 'info' as const
    },
    {
      name: 'Goal Achievement',
      description: 'Alert when daily user target is reached',
      conditions: [
        {
          kpi: 'users',
          operator: 'greater_than' as const,
          value: 10000,
          timeframe: '24h' as const
        }
      ],
      severity: 'info' as const
    }
  ]
}

// Alert evaluation logic
export class AlertEvaluator {
  private alerts: AlertRule[] = []
  private activeAlerts: Alert[] = []
  private channels: AlertChannel[] = []

  constructor() {
    // Initialize with default channels
    this.channels = [
      {
        id: 'default-email',
        type: 'email',
        name: 'Default Email',
        config: { email: 'alerts@yourcompany.com' },
        enabled: true
      },
      {
        id: 'slack-general',
        type: 'slack',
        name: 'Slack #general',
        config: { slackChannel: '#general' },
        enabled: true
      },
      {
        id: 'webhook-main',
        type: 'webhook',
        name: 'Main Webhook',
        config: { webhookUrl: 'https://api.yourcompany.com/webhooks/alerts' },
        enabled: false
      }
    ]

    // Initialize with some default alert rules
    this.addDefaultAlertRules()
    
    // Add some sample active alerts for demonstration
    this.createSampleAlerts()
  }

  private addDefaultAlertRules() {
    // Traffic Drop Alert
    this.addAlertRule({
      name: 'Traffic Drop Alert',
      conditions: [{
        id: 'traffic-drop-1',
        name: 'Users Decrease 25%',
        description: 'Alert when user traffic drops significantly',
        kpi: 'users',
        operator: 'change_decrease',
        value: 25,
        timeframe: '24h',
        enabled: true,
        createdAt: new Date()
      }],
      channels: ['default-email', 'slack-general'],
      enabled: true,
      frequency: 'immediate',
      createdBy: 'system'
    })

    // Conversion Rate Alert
    this.addAlertRule({
      name: 'Low Conversion Rate',
      conditions: [{
        id: 'conversion-low-1',
        name: 'Conversion Rate Below 2%',
        description: 'Alert when conversion rate drops below acceptable threshold',
        kpi: 'conversion_rate',
        operator: 'less_than',
        value: 2.0,
        timeframe: '24h',
        enabled: true,
        createdAt: new Date()
      }],
      channels: ['default-email'],
      enabled: true,
      frequency: 'hourly',
      createdBy: 'system'
    })

    // High Bounce Rate Alert
    this.addAlertRule({
      name: 'High Bounce Rate Warning',
      conditions: [{
        id: 'bounce-high-1',
        name: 'Bounce Rate Above 70%',
        description: 'Alert when bounce rate exceeds acceptable limits',
        kpi: 'bounce_rate',
        operator: 'greater_than',
        value: 70.0,
        timeframe: '24h',
        enabled: true,
        createdAt: new Date()
      }],
      channels: ['slack-general'],
      enabled: true,
      frequency: 'daily',
      createdBy: 'system'
    })
  }

  private createSampleAlerts() {
    // Create a few sample active alerts to demonstrate the system
    const now = new Date()
    
    // Critical alert: Traffic dropped significantly
    this.activeAlerts.push({
      id: `alert_${Date.now()}_critical`,
      conditionId: 'traffic-drop-1',
      triggeredAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      currentValue: 1200,
      thresholdValue: 25,
      kpi: 'users',
      message: 'Users has decreased by 35% in the last 24h (current: 1,200)',
      severity: 'critical',
      acknowledged: false,
      channels: ['default-email', 'slack-general']
    })

    // Warning alert: High bounce rate
    this.activeAlerts.push({
      id: `alert_${Date.now()}_warning`,
      conditionId: 'bounce-high-1',
      triggeredAt: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
      currentValue: 73.2,
      thresholdValue: 70.0,
      kpi: 'bounce_rate',
      message: 'Bounce Rate (73.2%) has exceeded the threshold of 70%',
      severity: 'warning',
      acknowledged: false,
      channels: ['slack-general']
    })

    // Info alert: Traffic spike (acknowledged)
    this.activeAlerts.push({
      id: `alert_${Date.now()}_info`,
      conditionId: 'traffic-spike-1',
      triggeredAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      currentValue: 2845,
      thresholdValue: 50,
      kpi: 'users',
      message: 'Users has increased by 62% in the last 1h (current: 2,845)',
      severity: 'info',
      acknowledged: true,
      acknowledgedAt: new Date(now.getTime() - 3.5 * 60 * 60 * 1000), // 3.5 hours ago
      acknowledgedBy: 'current-user',
      channels: ['default-email']
    })
  }

  // Add alert rule
  addAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'lastChecked'>): AlertRule {
    const alertRule: AlertRule = {
      ...rule,
      id: `alert_${Date.now()}`,
      createdAt: new Date()
    }
    
    this.alerts.push(alertRule)
    return alertRule
  }

  // Add alert channel
  addAlertChannel(channel: Omit<AlertChannel, 'id'>): AlertChannel {
    const alertChannel: AlertChannel = {
      ...channel,
      id: `channel_${Date.now()}`
    }
    
    this.channels.push(alertChannel)
    return alertChannel
  }

  // Evaluate all alerts against current data
  evaluateAlerts(analyticsData: any): Alert[] { // eslint-disable-line @typescript-eslint/no-explicit-any
    const newAlerts: Alert[] = []
    const now = new Date()

    this.alerts.forEach(rule => {
      if (!rule.enabled) return

      rule.conditions.forEach(condition => {
        if (!condition.enabled) return

        const shouldTrigger = this.evaluateCondition(condition, analyticsData)
        
        if (shouldTrigger) {
          // Check if alert was recently triggered to avoid spam
          const recentAlert = this.activeAlerts.find(alert => 
            alert.conditionId === condition.id && 
            now.getTime() - alert.triggeredAt.getTime() < this.getFrequencyMs(rule.frequency)
          )

          if (!recentAlert) {
            const alert = this.createAlert(condition, analyticsData, rule.channels)
            newAlerts.push(alert)
            this.activeAlerts.push(alert)
          }
        }
      })

      // Update last checked time
      rule.lastChecked = now
    })

    return newAlerts
  }

  private evaluateCondition(condition: AlertCondition, data: any): boolean { // eslint-disable-line @typescript-eslint/no-explicit-any
    const currentValue = this.getCurrentValue(condition.kpi, data)
    const historicalValue = this.getHistoricalValue(condition.kpi, data, condition.timeframe)

    switch (condition.operator) {
      case 'greater_than':
        return currentValue > condition.value

      case 'less_than':
        return currentValue < condition.value

      case 'equals':
        return Math.abs(currentValue - condition.value) < 0.01

      case 'change_increase':
        if (historicalValue === 0) return false
        const increasePercent = ((currentValue - historicalValue) / historicalValue) * 100
        return increasePercent >= condition.value

      case 'change_decrease':
        if (historicalValue === 0) return false
        const decreasePercent = ((historicalValue - currentValue) / historicalValue) * 100
        return decreasePercent >= condition.value

      default:
        return false
    }
  }

  private getCurrentValue(kpi: string, data: any): number { // eslint-disable-line @typescript-eslint/no-explicit-any
    switch (kpi) {
      case 'users':
        return data.users?.total || 0
      case 'sessions':
        return data.sessions?.total || 0
      case 'page_views':
        return data.pageViews?.total || 0
      case 'conversion_rate':
        return this.calculateConversionRate(data)
      case 'bounce_rate':
        return this.calculateBounceRate()
      case 'avg_session_duration':
        return this.parseSessionDuration(data.avgSessionDuration?.total || '0s')
      default:
        return 0
    }
  }

  private getHistoricalValue(kpi: string, data: any, timeframe: string): number { // eslint-disable-line @typescript-eslint/no-explicit-any
    // In a real implementation, this would fetch historical data
    // For demo purposes, we'll simulate historical values
    const current = this.getCurrentValue(kpi, data)
    
    switch (timeframe) {
      case '1h':
        return current * (0.95 + Math.random() * 0.1) // ±5% variation
      case '24h':
        return current * (0.9 + Math.random() * 0.2) // ±10% variation
      case '7d':
        return current * (0.8 + Math.random() * 0.4) // ±20% variation
      case '30d':
        return current * (0.7 + Math.random() * 0.6) // ±30% variation
      default:
        return current
    }
  }

  private calculateConversionRate(data: any): number { // eslint-disable-line @typescript-eslint/no-explicit-any
    // Simulate conversion rate calculation
    const sessions = data.sessions?.total || 0
    const conversions = Math.round(sessions * 0.034) // 3.4% average conversion rate
    return sessions > 0 ? (conversions / sessions) * 100 : 0
  }

  private calculateBounceRate(): number {
    // Simulate bounce rate calculation
    return 45 + Math.random() * 20 // 45-65% bounce rate range
  }

  private parseSessionDuration(duration: string): number {
    // Parse duration like "2m 18s" to seconds
    const matches = duration.match(/(\d+)m?\s*(\d+)s?/)
    if (matches) {
      const minutes = parseInt(matches[1]) || 0
      const seconds = parseInt(matches[2]) || 0
      return minutes * 60 + seconds
    }
    return 0
  }

  private createAlert(condition: AlertCondition, data: any, channels: string[]): Alert { // eslint-disable-line @typescript-eslint/no-explicit-any
    const currentValue = this.getCurrentValue(condition.kpi, data)
    
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conditionId: condition.id,
      triggeredAt: new Date(),
      currentValue,
      thresholdValue: condition.value,
      kpi: condition.kpi,
      message: this.generateAlertMessage(condition, currentValue),
      severity: this.determineSeverity(condition, currentValue),
      acknowledged: false,
      channels
    }
  }

  private generateAlertMessage(condition: AlertCondition, currentValue: number): string {
    const kpiName = this.getKpiDisplayName(condition.kpi)
    const operator = this.getOperatorDisplayName(condition.operator)
    const threshold = condition.value
    
    switch (condition.operator) {
      case 'greater_than':
        return `${kpiName} (${currentValue.toLocaleString()}) has exceeded the threshold of ${threshold.toLocaleString()}`
      
      case 'less_than':
        return `${kpiName} (${currentValue.toLocaleString()}) has dropped below the threshold of ${threshold.toLocaleString()}`
      
      case 'change_increase':
        return `${kpiName} has increased by ${threshold}% in the last ${condition.timeframe} (current: ${currentValue.toLocaleString()})`
      
      case 'change_decrease':
        return `${kpiName} has decreased by ${threshold}% in the last ${condition.timeframe} (current: ${currentValue.toLocaleString()})`
      
      default:
        return `${kpiName} alert triggered: ${currentValue.toLocaleString()} ${operator} ${threshold.toLocaleString()}`
    }
  }

  private determineSeverity(condition: AlertCondition, currentValue: number): 'info' | 'warning' | 'critical' {
    // Determine severity based on how far from threshold
    const deviation = Math.abs(currentValue - condition.value) / condition.value
    
    if (condition.operator.includes('decrease') || condition.kpi === 'bounce_rate') {
      if (deviation > 0.5) return 'critical'
      if (deviation > 0.2) return 'warning'
      return 'info'
    }
    
    if (deviation > 0.3) return 'info'
    return 'warning'
  }

  private getKpiDisplayName(kpi: string): string {
    const names: { [key: string]: string } = {
      'users': 'Users',
      'sessions': 'Sessions',
      'page_views': 'Page Views',
      'conversion_rate': 'Conversion Rate',
      'bounce_rate': 'Bounce Rate',
      'avg_session_duration': 'Average Session Duration'
    }
    return names[kpi] || kpi
  }

  private getOperatorDisplayName(operator: string): string {
    const names: { [key: string]: string } = {
      'greater_than': 'greater than',
      'less_than': 'less than',
      'equals': 'equals',
      'change_increase': 'increased by',
      'change_decrease': 'decreased by'
    }
    return names[operator] || operator
  }

  private getFrequencyMs(frequency: string): number {
    switch (frequency) {
      case 'immediate': return 0
      case 'hourly': return 60 * 60 * 1000
      case 'daily': return 24 * 60 * 60 * 1000
      case 'weekly': return 7 * 24 * 60 * 60 * 1000
      default: return 60 * 60 * 1000
    }
  }

  // Get active alerts
  getActiveAlerts(): Alert[] {
    return this.activeAlerts.filter(alert => !alert.acknowledged)
  }

  // Acknowledge alert
  acknowledgeAlert(alertId: string, userId: string): boolean {
    const alert = this.activeAlerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      alert.acknowledgedAt = new Date()
      alert.acknowledgedBy = userId
      return true
    }
    return false
  }

  // Get alert rules
  getAlertRules(): AlertRule[] {
    return [...this.alerts]
  }

  // Get alert channels
  getAlertChannels(): AlertChannel[] {
    return [...this.channels]
  }

  // Send alert notifications
  async sendAlertNotifications(alert: Alert): Promise<void> {
    const channels = this.channels.filter(c => 
      alert.channels.includes(c.id) && c.enabled
    )

    for (const channel of channels) {
      try {
        await this.sendToChannel(alert, channel)
      } catch (error) {
        console.error(`Failed to send alert to channel ${channel.name}:`, error)
      }
    }
  }

  private async sendToChannel(alert: Alert, channel: AlertChannel): Promise<void> {
    switch (channel.type) {
      case 'email':
        await this.sendEmailAlert(alert, channel)
        break
      case 'webhook':
        await this.sendWebhookAlert(alert, channel)
        break
      case 'slack':
        await this.sendSlackAlert(alert, channel)
        break
      default:
        console.log(`Channel type ${channel.type} not implemented`)
    }
  }

  private async sendEmailAlert(alert: Alert, channel: AlertChannel): Promise<void> {
    // Email sending logic would go here
    console.log(`📧 Email alert sent to ${channel.config.email}: ${alert.message}`)
  }

  private async sendWebhookAlert(alert: Alert, channel: AlertChannel): Promise<void> {
    if (!channel.config.webhookUrl) return

    const payload = {
      alert_id: alert.id,
      message: alert.message,
      severity: alert.severity,
      kpi: alert.kpi,
      current_value: alert.currentValue,
      threshold_value: alert.thresholdValue,
      triggered_at: alert.triggeredAt.toISOString()
    }

    // Webhook sending logic would go here
    console.log(`🔗 Webhook alert sent to ${channel.config.webhookUrl}:`, payload)
  }

  private async sendSlackAlert(alert: Alert, channel: AlertChannel): Promise<void> {
    // Slack API integration would go here
    console.log(`💬 Slack alert sent to ${channel.config.slackChannel}: ${alert.message}`)
  }
}

// Export singleton instance
export const alertEvaluator = new AlertEvaluator()
export default alertEvaluator