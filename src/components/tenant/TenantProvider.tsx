'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface TenantInfo {
  id: string
  name: string
  slug: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  plan: 'starter' | 'professional' | 'enterprise'
  features: string[]
  limits: {
    maxUsers: number
    maxDashboards: number
    maxDataSources: number
  }
}

interface TenantContextType {
  tenant: TenantInfo | null
  loading: boolean
  error: string | null
  hasFeature: (feature: string) => boolean
  refreshTenant: () => Promise<void>
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  loading: true,
  error: null,
  hasFeature: () => false,
  refreshTenant: async () => {}
})

interface TenantProviderProps {
  children: ReactNode
  tenantSlug?: string // For path-based tenant resolution
}

export function TenantProvider({ children, tenantSlug }: TenantProviderProps) {
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  const fetchTenantInfo = async () => {
    try {
      setLoading(true)
      setError(null)

      // For demo purposes, use mock tenant data based on slug
      const mockTenantData = getMockTenantData(tenantSlug || 'demo')
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setTenant(mockTenantData)
    } catch (err) {
      console.error('Failed to fetch tenant info:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getMockTenantData = (slug: string): TenantInfo => {
    // Mock tenant configurations based on slug
    const tenantConfigs: Record<string, TenantInfo> = {
      'demo': {
        id: 'demo-tenant',
        name: 'Demo Organization',
        slug: 'demo',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        plan: 'starter',
        features: ['basic-analytics', 'ab-testing'],
        limits: {
          maxUsers: 5,
          maxDashboards: 3,
          maxDataSources: 2
        }
      },
      'acme': {
        id: 'acme-corp',
        name: 'Acme Corporation',
        slug: 'acme',
        logo: '/tenants/acme/logo.png',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        plan: 'professional',
        features: ['basic-analytics', 'ab-testing', 'cohorts', 'segments', 'alerts'],
        limits: {
          maxUsers: 25,
          maxDashboards: 10,
          maxDataSources: 5
        }
      },
      'startup': {
        id: 'tech-startup',
        name: 'Tech Startup Inc',
        slug: 'startup',
        primaryColor: '#7c3aed',
        secondaryColor: '#6d28d9',
        plan: 'enterprise',
        features: ['basic-analytics', 'ab-testing', 'cohorts', 'segments', 'alerts', 'white-label', 'collaboration', 'advanced-segmentation'],
        limits: {
          maxUsers: -1, // Unlimited
          maxDashboards: -1,
          maxDataSources: -1
        }
      }
    }

    return tenantConfigs[slug] || tenantConfigs['demo']
  }

  useEffect(() => {
    fetchTenantInfo()
  }, [session, tenantSlug])

  const hasFeature = (feature: string): boolean => {
    return tenant?.features.includes(feature) || false
  }

  const refreshTenant = async () => {
    await fetchTenantInfo()
  }

  const value: TenantContextType = {
    tenant,
    loading,
    error,
    hasFeature,
    refreshTenant
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

// Feature gate component
interface FeatureGateProps {
  feature: string
  children: ReactNode
  fallback?: ReactNode
  upgradeMessage?: string
}

export function FeatureGate({ feature, children, fallback, upgradeMessage }: FeatureGateProps) {
  const { hasFeature, tenant } = useTenant()

  if (!hasFeature(feature)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Feature Not Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {upgradeMessage || `This feature requires a higher plan. Currently on ${tenant?.plan || 'starter'} plan.`}
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Upgrade Plan
        </button>
      </div>
    )
  }

  return <>{children}</>
}

// Tenant branding hook
export function useTenantBranding() {
  const { tenant } = useTenant()

  const applyBranding = () => {
    if (!tenant) return

    // Apply CSS custom properties for tenant branding
    const root = document.documentElement
    root.style.setProperty('--tenant-primary-color', tenant.primaryColor)
    root.style.setProperty('--tenant-secondary-color', tenant.secondaryColor)
  }

  useEffect(() => {
    applyBranding()
  }, [tenant])

  return {
    primaryColor: tenant?.primaryColor || '#2563eb',
    secondaryColor: tenant?.secondaryColor || '#1e40af',
    logo: tenant?.logo,
    applyBranding
  }
}