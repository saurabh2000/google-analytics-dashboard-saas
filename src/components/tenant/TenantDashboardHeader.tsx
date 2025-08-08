'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTenant } from './TenantProvider'
import TenantSwitcher from './TenantSwitcher'
import ActiveUsers from '@/components/collaboration/ActiveUsers'

interface TenantDashboardHeaderProps {
  onShowAlerts: () => void
  onShowCustomization: () => void
  selectedDateRange: string
  onDateRangeChange: (range: string) => void
  isRefreshing: boolean
  lastUpdated: Date
}

export default function TenantDashboardHeader({
  onShowAlerts,
  onShowCustomization,
  selectedDateRange,
  onDateRangeChange,
  isRefreshing,
  lastUpdated
}: TenantDashboardHeaderProps) {
  const { data: session } = useSession()
  const { tenant, hasFeature } = useTenant()

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {/* Tenant Switcher */}
            <TenantSwitcher className="hidden lg:block" />
            
            {/* Dashboard Title with Tenant Context */}
            <div className="lg:ml-4">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Analytics Dashboard
              </h1>
              {tenant && (
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {tenant.name} • {tenant.plan} Plan
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Active Users - only show if collaboration is enabled */}
            {hasFeature('collaboration') && (
              <ActiveUsers className="hidden md:block" />
            )}
            
            {/* Alerts Button - only show if alerts feature is enabled */}
            {hasFeature('alerts') && (
              <button
                onClick={onShowAlerts}
                className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-sm transition-colors border border-red-200 dark:border-red-800"
              >
                <span>🔔</span>
                <span>Alerts</span>
              </button>
            )}
            
            {/* Customize Button - only show if custom branding is enabled */}
            {tenant?.limits && (
              <button
                onClick={onShowCustomization}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors"
              >
                <span>⚙️</span>
                <span>Customize</span>
              </button>
            )}
            
            {/* Plan Upgrade Indicator */}
            {tenant && tenant.plan === 'starter' && (
              <button className="flex items-center space-x-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg text-sm transition-colors border border-purple-200 dark:border-purple-800">
                <span>✨</span>
                <span>Upgrade</span>
              </button>
            )}
            
            {/* Refresh Indicator */}
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span>
                Updated {lastUpdated.toLocaleTimeString('en-US', { 
                  hour12: false, 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
              </span>
            </div>
            
            {/* Date Range Picker */}
            <select 
              value={selectedDateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              disabled={isRefreshing}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            {/* User Avatar */}
            <div className="flex items-center space-x-2">
              {session?.user ? (
                <>
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: tenant?.primaryColor || '#2563eb' }}
                    >
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
                      {session.user.name || session.user.email}
                    </span>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">?</span>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">Demo User</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Tenant Switcher */}
      <div className="lg:hidden px-4 pb-3">
        <TenantSwitcher />
      </div>
      
      {/* Feature Limits Banner */}
      {tenant && tenant.plan === 'starter' && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-purple-200 dark:border-purple-800 px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-700 dark:text-purple-300">
              ⚡ You&apos;re on the Starter plan. Upgrade for advanced features like cohorts, segments, and white-label branding.
            </span>
            <button className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 font-medium">
              Upgrade Now →
            </button>
          </div>
        </div>
      )}
    </header>
  )
}