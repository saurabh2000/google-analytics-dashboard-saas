import { prisma } from './prisma'

export interface UsageMetrics {
  tenantId: string
  period: string // YYYY-MM format
  metrics: {
    apiCalls: number
    dataProcessed: number
    storageUsed: number
    userSessions: number
    dashboardViews: number
    reportGenerations: number
    customQueries: number
  }
  limits: {
    maxApiCalls: number
    maxDataProcessed: number
    maxStorage: number
    maxUsers: number
    maxDashboards: number
  }
  overages: {
    apiCalls: number
    dataProcessed: number
    storage: number
  }
  costs: {
    baseCost: number
    overageCost: number
    totalCost: number
  }
}

export interface UsageEvent {
  id: string
  tenantId: string
  eventType: string
  eventData: Record<string, any>
  timestamp: Date
  metadata?: Record<string, any>
}

export class UsageTrackingService {
  /**
   * Track a usage event
   */
  async trackEvent(
    tenantId: string,
    eventType: string,
    eventData: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await prisma.usageEvent.create({
        data: {
          tenantId,
          eventType,
          eventData,
          metadata,
          timestamp: new Date()
        }
      })

      // Update real-time usage metrics
      await this.updateRealtimeMetrics(tenantId, eventType, eventData)
    } catch (error) {
      console.error('Error tracking usage event:', error)
      throw error
    }
  }

  /**
   * Update real-time usage metrics
   */
  private async updateRealtimeMetrics(
    tenantId: string,
    eventType: string,
    eventData: Record<string, any>
  ): Promise<void> {
    const currentPeriod = this.getCurrentPeriod()
    
    try {
      // Get or create current period metrics
      let metrics = await prisma.usageMetrics.findFirst({
        where: {
          tenantId,
          period: currentPeriod
        }
      })

      if (!metrics) {
        // Get tenant's plan limits
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          include: { subscription: true }
        })

        const limits = this.getPlanLimits(tenant?.subscription?.planId || 'starter')
        
        metrics = await prisma.usageMetrics.create({
          data: {
            tenantId,
            period: currentPeriod,
            apiCalls: 0,
            dataProcessed: 0,
            storageUsed: 0,
            userSessions: 0,
            dashboardViews: 0,
            reportGenerations: 0,
            customQueries: 0,
            maxApiCalls: limits.maxApiCalls,
            maxDataProcessed: limits.maxDataProcessed,
            maxStorage: limits.maxStorage,
            maxUsers: limits.maxUsers,
            maxDashboards: limits.maxDashboards
          }
        })
      }

      // Update metrics based on event type
      const updates: any = {}
      
      switch (eventType) {
        case 'api_call':
          updates.apiCalls = { increment: 1 }
          if (eventData.dataSize) {
            updates.dataProcessed = { increment: eventData.dataSize }
          }
          break
        case 'storage_upload':
          updates.storageUsed = { increment: eventData.size || 0 }
          break
        case 'user_session':
          updates.userSessions = { increment: 1 }
          break
        case 'dashboard_view':
          updates.dashboardViews = { increment: 1 }
          break
        case 'report_generation':
          updates.reportGenerations = { increment: 1 }
          break
        case 'custom_query':
          updates.customQueries = { increment: 1 }
          if (eventData.dataSize) {
            updates.dataProcessed = { increment: eventData.dataSize }
          }
          break
      }

      if (Object.keys(updates).length > 0) {
        await prisma.usageMetrics.update({
          where: { id: metrics.id },
          data: updates
        })
      }
    } catch (error) {
      console.error('Error updating real-time metrics:', error)
    }
  }

  /**
   * Get usage metrics for a specific period
   */
  async getUsageMetrics(
    tenantId: string,
    period?: string
  ): Promise<UsageMetrics | null> {
    const targetPeriod = period || this.getCurrentPeriod()

    try {
      const metrics = await prisma.usageMetrics.findFirst({
        where: {
          tenantId,
          period: targetPeriod
        }
      })

      if (!metrics) return null

      // Calculate overages
      const overages = {
        apiCalls: Math.max(0, metrics.apiCalls - metrics.maxApiCalls),
        dataProcessed: Math.max(0, metrics.dataProcessed - metrics.maxDataProcessed),
        storage: Math.max(0, metrics.storageUsed - metrics.maxStorage)
      }

      // Calculate costs
      const baseCost = this.getBaseCost(tenantId)
      const overageCost = this.calculateOverageCost(overages)
      const totalCost = baseCost + overageCost

      return {
        tenantId: metrics.tenantId,
        period: metrics.period,
        metrics: {
          apiCalls: metrics.apiCalls,
          dataProcessed: metrics.dataProcessed,
          storageUsed: metrics.storageUsed,
          userSessions: metrics.userSessions,
          dashboardViews: metrics.dashboardViews,
          reportGenerations: metrics.reportGenerations,
          customQueries: metrics.customQueries
        },
        limits: {
          maxApiCalls: metrics.maxApiCalls,
          maxDataProcessed: metrics.maxDataProcessed,
          maxStorage: metrics.maxStorage,
          maxUsers: metrics.maxUsers,
          maxDashboards: metrics.maxDashboards
        },
        overages,
        costs: {
          baseCost,
          overageCost,
          totalCost
        }
      }
    } catch (error) {
      console.error('Error getting usage metrics:', error)
      return null
    }
  }

  /**
   * Get usage history for a tenant
   */
  async getUsageHistory(
    tenantId: string,
    months: number = 12
  ): Promise<UsageMetrics[]> {
    try {
      const periods = this.generatePeriods(months)
      
      const metrics = await prisma.usageMetrics.findMany({
        where: {
          tenantId,
          period: { in: periods }
        },
        orderBy: { period: 'desc' }
      })

      return await Promise.all(
        metrics.map(async (metric) => {
          const overages = {
            apiCalls: Math.max(0, metric.apiCalls - metric.maxApiCalls),
            dataProcessed: Math.max(0, metric.dataProcessed - metric.maxDataProcessed),
            storage: Math.max(0, metric.storageUsed - metric.maxStorage)
          }

          const baseCost = this.getBaseCost(tenantId)
          const overageCost = this.calculateOverageCost(overages)
          const totalCost = baseCost + overageCost

          return {
            tenantId: metric.tenantId,
            period: metric.period,
            metrics: {
              apiCalls: metric.apiCalls,
              dataProcessed: metric.dataProcessed,
              storageUsed: metric.storageUsed,
              userSessions: metric.userSessions,
              dashboardViews: metric.dashboardViews,
              reportGenerations: metric.reportGenerations,
              customQueries: metric.customQueries
            },
            limits: {
              maxApiCalls: metric.maxApiCalls,
              maxDataProcessed: metric.maxDataProcessed,
              maxStorage: metric.maxStorage,
              maxUsers: metric.maxUsers,
              maxDashboards: metric.maxDashboards
            },
            overages,
            costs: {
              baseCost,
              overageCost,
              totalCost
            }
          }
        })
      )
    } catch (error) {
      console.error('Error getting usage history:', error)
      return []
    }
  }

  /**
   * Generate invoice data for a specific period
   */
  async generateInvoiceData(
    tenantId: string,
    period: string
  ): Promise<any> {
    try {
      const metrics = await this.getUsageMetrics(tenantId, period)
      if (!metrics) return null

      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { subscription: true }
      })

      const invoiceData = {
        tenantId,
        period,
        billingDate: new Date(),
        subscription: {
          planName: tenant?.subscription?.planId || 'Unknown',
          baseAmount: metrics.costs.baseCost,
          currency: 'usd'
        },
        usage: {
          metrics: metrics.metrics,
          limits: metrics.limits,
          overages: metrics.overages
        },
        charges: {
          base: metrics.costs.baseCost,
          overages: metrics.costs.overageCost,
          total: metrics.costs.totalCost
        },
        lineItems: this.generateLineItems(metrics)
      }

      return invoiceData
    } catch (error) {
      console.error('Error generating invoice data:', error)
      return null
    }
  }

  /**
   * Get current billing period
   */
  private getCurrentPeriod(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  /**
   * Generate list of periods for history
   */
  private generatePeriods(months: number): string[] {
    const periods: string[] = []
    const now = new Date()
    
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      periods.push(period)
    }
    
    return periods
  }

  /**
   * Get plan limits based on plan ID
   */
  private getPlanLimits(planId: string): any {
    const limits = {
      starter: {
        maxApiCalls: 10000,
        maxDataProcessed: 1000000000, // 1GB
        maxStorage: 5000000000, // 5GB
        maxUsers: 5,
        maxDashboards: 10
      },
      professional: {
        maxApiCalls: 100000,
        maxDataProcessed: 10000000000, // 10GB
        maxStorage: 50000000000, // 50GB
        maxUsers: 25,
        maxDashboards: 50
      },
      enterprise: {
        maxApiCalls: 1000000,
        maxDataProcessed: 100000000000, // 100GB
        maxStorage: 500000000000, // 500GB
        maxUsers: -1, // Unlimited
        maxDashboards: -1 // Unlimited
      }
    }

    return limits[planId as keyof typeof limits] || limits.starter
  }

  /**
   * Get base cost for a tenant
   */
  private async getBaseCost(tenantId: string): Promise<number> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { subscription: true }
      })

      const planCosts = {
        starter: 29,
        professional: 99,
        enterprise: 299
      }

      return planCosts[tenant?.subscription?.planId as keyof typeof planCosts] || 29
    } catch (error) {
      return 29 // Default to starter plan cost
    }
  }

  /**
   * Calculate overage costs
   */
  private calculateOverageCost(overages: any): number {
    const rates = {
      apiCalls: 0.001, // $0.001 per API call over limit
      dataProcessed: 0.0000001, // $0.0000001 per byte over limit
      storage: 0.00000005 // $0.00000005 per byte over limit
    }

    return (
      overages.apiCalls * rates.apiCalls +
      overages.dataProcessed * rates.dataProcessed +
      overages.storage * rates.storage
    )
  }

  /**
   * Generate line items for invoice
   */
  private generateLineItems(metrics: UsageMetrics): any[] {
    const lineItems = [
      {
        description: 'Base subscription',
        quantity: 1,
        unitPrice: metrics.costs.baseCost,
        amount: metrics.costs.baseCost
      }
    ]

    if (metrics.overages.apiCalls > 0) {
      lineItems.push({
        description: `API calls overage (${metrics.overages.apiCalls.toLocaleString()} calls)`,
        quantity: metrics.overages.apiCalls,
        unitPrice: 0.001,
        amount: metrics.overages.apiCalls * 0.001
      })
    }

    if (metrics.overages.dataProcessed > 0) {
      const gb = metrics.overages.dataProcessed / 1000000000
      lineItems.push({
        description: `Data processing overage (${gb.toFixed(2)} GB)`,
        quantity: gb,
        unitPrice: 0.1,
        amount: gb * 0.1
      })
    }

    if (metrics.overages.storage > 0) {
      const gb = metrics.overages.storage / 1000000000
      lineItems.push({
        description: `Storage overage (${gb.toFixed(2)} GB)`,
        quantity: gb,
        unitPrice: 0.05,
        amount: gb * 0.05
      })
    }

    return lineItems
  }

  /**
   * Get usage alerts for a tenant
   */
  async getUsageAlerts(tenantId: string): Promise<any[]> {
    try {
      const metrics = await this.getUsageMetrics(tenantId)
      if (!metrics) return []

      const alerts = []
      const thresholds = {
        apiCalls: 0.8, // 80% of limit
        dataProcessed: 0.8,
        storage: 0.8
      }

      // Check API calls
      if (metrics.metrics.apiCalls / metrics.limits.maxApiCalls > thresholds.apiCalls) {
        alerts.push({
          type: 'warning',
          metric: 'API Calls',
          current: metrics.metrics.apiCalls,
          limit: metrics.limits.maxApiCalls,
          percentage: (metrics.metrics.apiCalls / metrics.limits.maxApiCalls * 100).toFixed(1)
        })
      }

      // Check data processed
      if (metrics.metrics.dataProcessed / metrics.limits.maxDataProcessed > thresholds.dataProcessed) {
        alerts.push({
          type: 'warning',
          metric: 'Data Processed',
          current: metrics.metrics.dataProcessed,
          limit: metrics.limits.maxDataProcessed,
          percentage: (metrics.metrics.dataProcessed / metrics.limits.maxDataProcessed * 100).toFixed(1)
        })
      }

      // Check storage
      if (metrics.metrics.storageUsed / metrics.limits.maxStorage > thresholds.storage) {
        alerts.push({
          type: 'warning',
          metric: 'Storage',
          current: metrics.metrics.storageUsed,
          limit: metrics.limits.maxStorage,
          percentage: (metrics.metrics.storageUsed / metrics.limits.maxStorage * 100).toFixed(1)
        })
      }

      return alerts
    } catch (error) {
      console.error('Error getting usage alerts:', error)
      return []
    }
  }
}

// Export singleton instance
export const usageTracking = new UsageTrackingService()
