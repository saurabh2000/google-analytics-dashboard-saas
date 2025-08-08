import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext, hasFeature, hasPermission } from '@/lib/multi-tenant'

// Get available features for tenant
async function handler(req: NextRequest, res: NextResponse, context: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { tenant, user } = context

  // Check if user can view tenant features
  if (!hasPermission(context, 'view-features') && user.role !== 'owner' && user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }

  try {
    const features = {
      enabled: tenant.settings.allowedFeatures,
      available: [
        {
          id: 'basic-analytics',
          name: 'Basic Analytics',
          description: 'Core analytics dashboard with KPIs and charts',
          enabled: hasFeature(context, 'basic-analytics'),
          required_plan: 'starter'
        },
        {
          id: 'ab-testing',
          name: 'A/B Testing',
          description: 'Create and analyze A/B tests with statistical significance',
          enabled: hasFeature(context, 'ab-testing'),
          required_plan: 'starter'
        },
        {
          id: 'cohorts',
          name: 'Cohort Analysis',
          description: 'Track user retention and lifetime value',
          enabled: hasFeature(context, 'cohorts'),
          required_plan: 'professional'
        },
        {
          id: 'segments',
          name: 'Advanced Segmentation',
          description: 'Geographic, behavioral, and demographic analysis',
          enabled: hasFeature(context, 'segments'),
          required_plan: 'professional'
        },
        {
          id: 'alerts',
          name: 'Custom Alerts',
          description: 'Threshold-based notifications and monitoring',
          enabled: hasFeature(context, 'alerts'),
          required_plan: 'professional'
        },
        {
          id: 'white-label',
          name: 'White Label Branding',
          description: 'Custom branding, logos, and colors',
          enabled: tenant.settings.whiteLabel,
          required_plan: 'enterprise'
        },
        {
          id: 'api-access',
          name: 'API Access',
          description: 'REST API for data export and integration',
          enabled: tenant.settings.apiAccess,
          required_plan: 'professional'
        },
        {
          id: 'advanced-analytics',
          name: 'Advanced Analytics',
          description: 'Predictive analytics and custom reports',
          enabled: tenant.settings.advancedAnalytics,
          required_plan: 'enterprise'
        }
      ],
      limits: {
        maxUsers: tenant.settings.maxUsers,
        maxDashboards: tenant.settings.maxDashboards,
        maxDataSources: tenant.settings.maxDataSources,
        customBranding: tenant.settings.customBranding,
        exportData: tenant.settings.exportData
      },
      subscription: {
        plan: tenant.subscription.plan,
        status: tenant.subscription.status,
        periodEnd: tenant.subscription.currentPeriodEnd
      }
    }

    return NextResponse.json(features)
  } catch (error) {
    console.error('Tenant features error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 }
    )
  }
}

export const GET = withTenantContext(handler)