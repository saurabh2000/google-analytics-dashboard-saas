// Multi-tenant architecture for supporting multiple clients
export interface Tenant {
  id: string
  name: string
  domain: string // Custom domain or subdomain
  slug: string // URL slug for tenant identification
  logo?: string
  primaryColor: string
  secondaryColor: string
  settings: TenantSettings
  subscription: TenantSubscription
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'suspended' | 'inactive'
}

export interface TenantSettings {
  allowedFeatures: string[] // Features enabled for this tenant
  maxUsers: number
  maxDashboards: number
  maxDataSources: number
  customBranding: boolean
  whiteLabel: boolean
  apiAccess: boolean
  exportData: boolean
  advancedAnalytics: boolean
}

export interface TenantSubscription {
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

export interface TenantUser {
  id: string
  tenantId: string
  userId: string // Reference to auth user
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  permissions: string[]
  invitedBy?: string
  joinedAt: Date
  lastActiveAt?: Date
}

// Tenant context for request handling
export interface TenantContext {
  tenant: Tenant
  user: TenantUser
  permissions: Set<string>
  features: Set<string>
}

// Sample tenant data for demo
const sampleTenants: Tenant[] = [
  {
    id: 'demo-org',
    name: 'Demo Organization',
    domain: 'demo.analytics.com',
    slug: 'demo',
    logo: '/tenants/demo/logo.png',
    primaryColor: '#059669',
    secondaryColor: '#047857',
    settings: {
      allowedFeatures: ['*'], // All features enabled
      maxUsers: -1, // Unlimited
      maxDashboards: -1, // Unlimited
      maxDataSources: -1, // Unlimited
      customBranding: true,
      whiteLabel: true,
      apiAccess: true,
      exportData: true,
      advancedAnalytics: true
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
      currentPeriodStart: new Date('2024-01-01'),
      currentPeriodEnd: new Date('2025-01-01'), // Full year
      stripeCustomerId: 'cus_demo_enterprise',
      stripeSubscriptionId: 'sub_demo_enterprise'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    status: 'active'
  },
  {
    id: 'acme-corp',
    name: 'Acme Corporation',
    domain: 'acme.analytics.com',
    slug: 'acme',
    logo: '/tenants/acme/logo.png',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    settings: {
      allowedFeatures: ['basic-analytics', 'ab-testing', 'cohorts', 'segments', 'alerts'],
      maxUsers: 25,
      maxDashboards: 10,
      maxDataSources: 5,
      customBranding: true,
      whiteLabel: false,
      apiAccess: true,
      exportData: true,
      advancedAnalytics: true
    },
    subscription: {
      plan: 'professional',
      status: 'active',
      currentPeriodStart: new Date('2024-01-01'),
      currentPeriodEnd: new Date('2024-02-01'),
      stripeCustomerId: 'cus_acme123',
      stripeSubscriptionId: 'sub_acme456'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    status: 'active'
  },
  {
    id: 'tech-startup',
    name: 'Tech Startup Inc',
    domain: 'startup.analytics.com',
    slug: 'startup',
    logo: '/tenants/startup/logo.png',
    primaryColor: '#7c3aed',
    secondaryColor: '#6d28d9',
    settings: {
      allowedFeatures: ['basic-analytics', 'ab-testing'],
      maxUsers: 5,
      maxDashboards: 3,
      maxDataSources: 2,
      customBranding: false,
      whiteLabel: false,
      apiAccess: false,
      exportData: true,
      advancedAnalytics: false
    },
    subscription: {
      plan: 'starter',
      status: 'active',
      currentPeriodStart: new Date('2024-01-15'),
      currentPeriodEnd: new Date('2024-02-15'),
      stripeCustomerId: 'cus_startup123',
      stripeSubscriptionId: 'sub_startup456'
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    status: 'active'
  }
]

const sampleTenantUsers: TenantUser[] = [
  {
    id: 'user-demo-1',
    tenantId: 'demo-org',
    userId: 'demo-user',
    role: 'owner',
    permissions: ['*'], // Full permissions
    joinedAt: new Date('2024-01-01'),
    lastActiveAt: new Date()
  },
  {
    id: 'user-acme-1',
    tenantId: 'acme-corp',
    userId: 'auth-user-123',
    role: 'owner',
    permissions: ['*'], // Full permissions
    joinedAt: new Date('2024-01-01'),
    lastActiveAt: new Date()
  },
  {
    id: 'user-startup-1',
    tenantId: 'tech-startup',
    userId: 'auth-user-456',
    role: 'owner',
    permissions: ['*'],
    joinedAt: new Date('2024-01-15'),
    lastActiveAt: new Date()
  }
]

// Tenant resolver - determines tenant from request
export class TenantResolver {
  static async resolveTenant(request: {
    headers: Record<string, string>
    url: string
  }): Promise<Tenant | null> {
    // Method 1: Subdomain resolution
    const host = request.headers.host || request.headers['x-forwarded-host']
    if (host) {
      const subdomain = host.split('.')[0]
      const tenant = sampleTenants.find(t => t.slug === subdomain || t.domain.includes(subdomain))
      if (tenant) return tenant
    }

    // Method 2: Path-based resolution (/tenant/slug/dashboard)
    const url = new URL(request.url, 'http://localhost')
    const pathSegments = url.pathname.split('/').filter(Boolean)
    if (pathSegments[0] === 'tenant' && pathSegments[1]) {
      const slug = pathSegments[1]
      const tenant = sampleTenants.find(t => t.slug === slug)
      if (tenant) return tenant
    }

    // Method 3: Header-based resolution (X-Tenant-ID)
    const tenantId = request.headers['x-tenant-id']
    if (tenantId) {
      const tenant = sampleTenants.find(t => t.id === tenantId)
      if (tenant) return tenant
    }

    return null
  }

  static async getTenantUser(tenantId: string, userId: string): Promise<TenantUser | null> {
    return sampleTenantUsers.find(tu => tu.tenantId === tenantId && tu.userId === userId) || null
  }

  static async createTenantContext(tenant: Tenant, userId: string): Promise<TenantContext | null> {
    const tenantUser = await this.getTenantUser(tenant.id, userId)
    if (!tenantUser) return null

    const permissions = new Set(tenantUser.permissions)
    const features = new Set(tenant.settings.allowedFeatures)

    return {
      tenant,
      user: tenantUser,
      permissions,
      features
    }
  }
}

// Tenant middleware for API routes
export function withTenantContext(
  handler: (req: any, res: any, context: TenantContext) => Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
) {
  return async (req: any, res: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      // Resolve tenant from request
      const tenant = await TenantResolver.resolveTenant({
        headers: req.headers,
        url: req.url
      })

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' })
      }

      // Get user ID from session/auth
      const userId = req.user?.id || 'demo-user' // Fallback for demo

      // Create tenant context
      const context = await TenantResolver.createTenantContext(tenant, userId)
      if (!context) {
        return res.status(403).json({ error: 'Access denied to tenant' })
      }

      // Add tenant info to response headers
      res.setHeader('X-Tenant-ID', tenant.id)
      res.setHeader('X-Tenant-Name', tenant.name)

      return handler(req, res, context)
    } catch (error) {
      console.error('Tenant context error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}

// Feature gate utility
export function hasFeature(context: TenantContext, feature: string): boolean {
  return context.features.has(feature) || context.features.has('*')
}

export function hasPermission(context: TenantContext, permission: string): boolean {
  return context.permissions.has(permission) || context.permissions.has('*')
}

// Tenant-aware data scoping
export function scopeDataByTenant<T extends { tenantId?: string }>(
  data: T[],
  tenantId: string
): T[] {
  return data.filter(item => item.tenantId === tenantId)
}

// Demo functions
export function getAllTenants(): Tenant[] {
  return sampleTenants
}

export function getTenantById(id: string): Tenant | null {
  return sampleTenants.find(t => t.id === id) || null
}

export function getTenantBySlug(slug: string): Tenant | null {
  return sampleTenants.find(t => t.slug === slug) || null
}