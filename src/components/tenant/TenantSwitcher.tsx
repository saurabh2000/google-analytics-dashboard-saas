'use client'

import { useState, useEffect } from 'react'
import { useTenant } from './TenantProvider'

interface TenantOption {
  id: string
  name: string
  slug: string
  logo?: string
  primaryColor: string
  role: string
}

interface TenantSwitcherProps {
  className?: string
}

export default function TenantSwitcher({ className = '' }: TenantSwitcherProps) {
  const { tenant } = useTenant()
  const [isOpen, setIsOpen] = useState(false)
  const [availableTenants, setAvailableTenants] = useState<TenantOption[]>([])
  const [loading, setLoading] = useState(false)

  // Sample tenant data - in real app, this would come from an API
  const sampleTenants: TenantOption[] = [
    {
      id: 'acme-corp',
      name: 'Acme Corporation',
      slug: 'acme',
      primaryColor: '#2563eb',
      role: 'Owner'
    },
    {
      id: 'tech-startup',
      name: 'Tech Startup Inc',
      slug: 'startup',
      primaryColor: '#7c3aed',
      role: 'Admin'
    },
    {
      id: 'demo-org',
      name: 'Demo Organization',
      slug: 'demo',
      primaryColor: '#059669',
      role: 'Editor'
    }
  ]

  useEffect(() => {
    if (isOpen && availableTenants.length === 0) {
      loadTenants()
    }
  }, [isOpen])

  const loadTenants = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setAvailableTenants(sampleTenants)
    } catch (error) {
      console.error('Failed to load tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchTenant = (tenantSlug: string) => {
    // In a real app, this would update the URL or trigger a tenant switch
    window.location.href = `/tenant/${tenantSlug}/dashboard`
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[200px]"
      >
        {tenant ? (
          <>
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              {tenant.name.charAt(0)}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {tenant.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {tenant.plan} Plan
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Select Organization
            </div>
          </div>
        )}
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
            <div className="p-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Your Organizations
                  </div>
                  
                  {availableTenants.map((tenantOption) => (
                    <button
                      key={tenantOption.id}
                      onClick={() => switchTenant(tenantOption.slug)}
                      className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        tenant?.id === tenantOption.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                          : ''
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                        style={{ backgroundColor: tenantOption.primaryColor }}
                      >
                        {tenantOption.name.charAt(0)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {tenantOption.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {tenantOption.role}
                        </div>
                      </div>
                      {tenant?.id === tenantOption.id && (
                        <div className="text-blue-600 dark:text-blue-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}

                  <hr className="my-2 border-gray-200 dark:border-gray-700" />
                  
                  <button className="w-full flex items-center space-x-3 px-2 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-lg">➕</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Create Organization
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Start a new organization
                      </div>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}