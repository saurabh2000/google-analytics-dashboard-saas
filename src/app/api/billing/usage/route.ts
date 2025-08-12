import { usageTracking } from '@/lib/usage-tracking'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period')
    const months = parseInt(searchParams.get('months') || '12')
    const includeHistory = searchParams.get('includeHistory') === 'true'
    const includeAlerts = searchParams.get('includeAlerts') === 'true'

    // Get tenant ID from session or query params
    const tenantId = searchParams.get('tenantId') || session.user.email

    // Get current usage metrics
    const currentMetrics = await usageTracking.getUsageMetrics(tenantId, period)

    if (!currentMetrics) {
      return NextResponse.json(
        { error: 'No usage data found for this period' },
        { status: 404 }
      )
    }

    const response: any = {
      currentPeriod: currentMetrics.period,
      metrics: currentMetrics.metrics,
      limits: currentMetrics.limits,
      overages: currentMetrics.overages,
      costs: currentMetrics.costs,
      utilization: {
        apiCalls: (currentMetrics.metrics.apiCalls / currentMetrics.limits.maxApiCalls * 100).toFixed(1),
        dataProcessed: (currentMetrics.metrics.dataProcessed / currentMetrics.limits.maxDataProcessed * 100).toFixed(1),
        storage: (currentMetrics.metrics.storageUsed / currentMetrics.limits.maxStorage * 100).toFixed(1),
        users: currentMetrics.limits.maxUsers === -1 ? 'Unlimited' : (currentMetrics.metrics.userSessions / currentMetrics.limits.maxUsers * 100).toFixed(1),
        dashboards: currentMetrics.limits.maxDashboards === -1 ? 'Unlimited' : (currentMetrics.metrics.dashboardViews / currentMetrics.limits.maxDashboards * 100).toFixed(1)
      }
    }

    // Include usage history if requested
    if (includeHistory) {
      const history = await usageTracking.getUsageHistory(tenantId, months)
      response.history = history
    }

    // Include usage alerts if requested
    if (includeAlerts) {
      const alerts = await usageTracking.getUsageAlerts(tenantId)
      response.alerts = alerts
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error getting usage data:', error)
    return NextResponse.json(
      { error: 'Failed to get usage data' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { tenantId, eventType, eventData, metadata } = await req.json()

    if (!tenantId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId and eventType' },
        { status: 400 }
      )
    }

    // Track the usage event
    await usageTracking.trackEvent(tenantId, eventType, eventData, metadata)

    return NextResponse.json({
      success: true,
      message: 'Usage event tracked successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error tracking usage event:', error)
    return NextResponse.json(
      { error: 'Failed to track usage event' },
      { status: 500 }
    )
  }
}
