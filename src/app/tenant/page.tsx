'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { getAllTenants, type Tenant } from '@/lib/multi-tenant'

export default function TenantSelectionPage() {
  const { data: session } = useSession()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading user's tenants
    setTimeout(() => {
      setTenants(getAllTenants())
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your organizations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Select Organization
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose which organization you&apos;d like to access
              </p>
            </div>
            
            {session?.user && (
              <div className="flex items-center space-x-3">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {session.user.name || session.user.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Organizations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tenants.map((tenant) => (
              <Link 
                key={tenant.id}
                href={`/tenant/${tenant.slug}/dashboard`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 dark:border-gray-700 group-hover:border-blue-300 dark:group-hover:border-blue-600">
                  {/* Tenant Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: tenant.primaryColor }}
                    >
                      {tenant.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tenant.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {tenant.domain}
                      </p>
                    </div>
                  </div>

                  {/* Plan Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                      tenant.subscription.plan === 'enterprise' 
                        ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
                        : tenant.subscription.plan === 'professional'
                        ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                    }`}>
                      {tenant.subscription.plan.charAt(0).toUpperCase() + tenant.subscription.plan.slice(1)} Plan
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                      tenant.status === 'active' 
                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                    }`}>
                      {tenant.status}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Available Features
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {tenant.settings.allowedFeatures.slice(0, 3).map(feature => (
                        <span
                          key={feature}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                        >
                          {feature.replace('-', ' ')}
                        </span>
                      ))}
                      {tenant.settings.allowedFeatures.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                          +{tenant.settings.allowedFeatures.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {tenant.settings.maxUsers}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Max Users</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {tenant.settings.maxDashboards}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Dashboards</p>
                    </div>
                  </div>

                  {/* Access Button */}
                  <div className="mt-6">
                    <div className="bg-gray-50 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 rounded-lg px-4 py-3 text-center transition-colors">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        Access Dashboard →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Create New Organization Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors p-6 flex items-center justify-center group cursor-pointer">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors">
                  <span className="text-2xl">➕</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Create Organization
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Start a new analytics workspace
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-2">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Get Started
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Need help getting started?
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Each organization has its own dashboard, user management, and subscription plan. 
                  You can switch between organizations anytime from the dashboard header.
                </p>
                <div className="flex space-x-4">
                  <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">
                    View Documentation →
                  </button>
                  <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">
                    Contact Support →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}