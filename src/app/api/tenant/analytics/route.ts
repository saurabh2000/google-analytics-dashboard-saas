import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext, hasFeature } from '@/lib/multi-tenant'
import { getAnalyticsData } from '@/lib/analytics-data'

// Tenant-scoped analytics API endpoint
async function handler(req: NextRequest, res: NextResponse, context: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { tenant, user } = context

  // Check if tenant has access to basic analytics
  if (!hasFeature(context, 'basic-analytics')) {
    return NextResponse.json(
      { error: 'Analytics feature not available for your plan' },
      { status: 403 }
    )
  }

  const url = new URL(req.url)
  const dateRange = url.searchParams.get('dateRange') || '30d'
  const property = url.searchParams.get('property')

  try {
    // Get analytics data scoped to tenant
    const analytics = getAnalyticsData(property, dateRange)
    
    // Add tenant-specific metadata
    const response = {
      ...analytics,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        plan: tenant.subscription.plan
      },
      limits: {
        maxUsers: tenant.settings.maxUsers,
        maxDashboards: tenant.settings.maxDashboards,
        features: tenant.settings.allowedFeatures
      },
      user: {
        role: user.role,
        permissions: Array.from(context.permissions)
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Tenant analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

// Wrap with tenant context middleware
export const GET = withTenantContext(handler)