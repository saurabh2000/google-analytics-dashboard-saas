'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTenant } from '@/components/tenant/TenantProvider'

interface TenantNavigationProps {
  tenantSlug: string
  className?: string
}

export default function TenantNavigation({ tenantSlug, className = '' }: TenantNavigationProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { tenant, hasFeature } = useTenant()

  const navigationItems = [
    {
      name: 'Dashboard',
      href: `/tenant/${tenantSlug}/dashboard`,
      icon: '📊',
      feature: 'basic-analytics'
    },
    {
      name: 'A/B Testing',
      href: `/tenant/${tenantSlug}/ab-testing`,
      icon: '🧪',
      feature: 'ab-testing'
    },
    {
      name: 'Cohorts',
      href: `/tenant/${tenantSlug}/cohorts`,
      icon: '👥',
      feature: 'cohorts'
    },
    {
      name: 'Segments',
      href: `/tenant/${tenantSlug}/segments`,
      icon: '🎯',
      feature: 'segments'
    },
    {
      name: 'Branding',
      href: `/tenant/${tenantSlug}/branding`,
      icon: '🎨',
      feature: 'white-label'
    },
    {
      name: 'Billing',
      href: `/tenant/${tenantSlug}/billing`,
      icon: '💳',
      feature: null // Always available
    },
    {
      name: 'Onboarding',
      href: `/tenant/${tenantSlug}/onboarding`,
      icon: '🚀',
      feature: null // Always available
    }
  ]

  // Add admin link for admin users
  const adminNavigationItems = [
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: '⚙️',
      feature: null,
      adminOnly: true
    }
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const canAccessFeature = (feature: string | null) => {
    return feature === null || hasFeature(feature)
  }

  return (
    <nav className={`bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4">
        {/* Tenant Info */}
        {tenant && (
          <div className="mb-6">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: tenant.primaryColor }}
              >
                {tenant.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {tenant.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {tenant.plan} Plan
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="space-y-1">
          {[...navigationItems, ...(session?.user?.email === 'admin@company.com' ? adminNavigationItems : [])].map((item) => (
            <div key={item.name}>
              {canAccessFeature(item.feature) ? (
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ) : (
                <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed relative group">
                  <span className="text-lg opacity-50">{item.icon}</span>
                  <span className="opacity-50">{item.name}</span>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full dark:bg-orange-900/20 dark:text-orange-300">
                    Upgrade
                  </span>
                  
                  {/* Tooltip */}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                    Requires {item.feature?.replace('-', ' ')} feature
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Quick Actions
          </div>
          <div className="space-y-2">
            <button className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-full text-left">
              <span>📖</span>
              <span>View Documentation</span>
            </button>
            <button className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-full text-left">
              <span>💬</span>
              <span>Contact Support</span>
            </button>
            <button className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-full text-left">
              <span>🔗</span>
              <span>API Documentation</span>
            </button>
          </div>
        </div>

        {/* Plan Upgrade CTA */}
        {tenant?.plan === 'starter' && (
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-center">
              <div className="text-2xl mb-2">✨</div>
              <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                Unlock More Features
              </h3>
              <p className="text-xs text-purple-700 dark:text-purple-300 mb-3">
                Upgrade to access cohorts, segments, and advanced analytics.
              </p>
              <Link
                href={`/tenant/${tenantSlug}/billing`}
                className="inline-flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}