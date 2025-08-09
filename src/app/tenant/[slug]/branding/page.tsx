'use client'

import { useParams } from 'next/navigation'
import { TenantProvider, FeatureGate, useTenant } from '@/components/tenant/TenantProvider'
import TenantDashboardHeader from '@/components/tenant/TenantDashboardHeader'
import { useState } from 'react'

// Inner branding component that uses tenant context
function TenantBranding() {
  const { tenant } = useTenant()
  const [primaryColor, setPrimaryColor] = useState(tenant?.primaryColor || '#2563eb')
  const [secondaryColor, setSecondaryColor] = useState(tenant?.secondaryColor || '#1e40af')
  const [logoUrl, setLogoUrl] = useState(tenant?.logo || '')
  const [companyName, setCompanyName] = useState(tenant?.name || '')
  const [previewMode, setPreviewMode] = useState<'dashboard' | 'report' | 'email'>('dashboard')

  const colorPresets = [
    { name: 'Blue', primary: '#2563eb', secondary: '#1e40af' },
    { name: 'Purple', primary: '#7c3aed', secondary: '#6d28d9' },
    { name: 'Green', primary: '#059669', secondary: '#047857' },
    { name: 'Red', primary: '#dc2626', secondary: '#b91c1c' },
    { name: 'Orange', primary: '#ea580c', secondary: '#c2410c' },
    { name: 'Pink', primary: '#db2777', secondary: '#be185d' },
    { name: 'Indigo', primary: '#4f46e5', secondary: '#4338ca' },
    { name: 'Teal', primary: '#0d9488', secondary: '#0f766e' }
  ]

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Saving branding settings:', {
      primaryColor,
      secondaryColor,
      logoUrl,
      companyName
    })
    // Show success message
    alert('Branding settings saved successfully!')
  }

  const handleReset = () => {
    setPrimaryColor('#2563eb')
    setSecondaryColor('#1e40af')
    setLogoUrl('')
    setCompanyName(tenant?.name || 'Your Company')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <TenantDashboardHeader
        onShowAlerts={() => {}}
        onShowCustomization={() => {}}
        selectedDateRange="30d"
        onDateRangeChange={() => {}}
        isRefreshing={false}
        lastUpdated={new Date()}
      />

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">White-Label Branding</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Customize the appearance of your analytics dashboard and reports
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Reset to Default
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customization Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* Logo Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Company Logo
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://your-domain.com/logo.png"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Your Company Name"
                    />
                  </div>
                  
                  {/* Logo Preview */}
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</div>
                    <div className="flex items-center space-x-3">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Logo"
                          className="w-10 h-10 object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div 
                          className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {companyName.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {companyName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Scheme */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Color Scheme
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Color Presets */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quick Presets
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            setPrimaryColor(preset.primary)
                            setSecondaryColor(preset.secondary)
                          }}
                          className="group relative"
                          title={preset.name}
                        >
                          <div className="flex h-8 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600">
                            <div 
                              className="flex-1" 
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div 
                              className="flex-1" 
                              style={{ backgroundColor: preset.secondary }}
                            />
                          </div>
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {preset.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Additional Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Remove &quot;Powered by&quot; footer
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Hide branding from reports and exports
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      defaultChecked
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Custom domain
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Use your own domain for reports
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Custom CSS
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Advanced styling options
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                {/* Preview Controls */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Live Preview
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPreviewMode('dashboard')}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                          previewMode === 'dashboard'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => setPreviewMode('report')}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                          previewMode === 'report'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Report
                      </button>
                      <button
                        onClick={() => setPreviewMode('email')}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                          previewMode === 'email'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Email
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="p-6">
                  {previewMode === 'dashboard' && (
                    <div className="space-y-4">
                      {/* Header with branding */}
                      <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt="Logo"
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <div 
                              className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: primaryColor }}
                            >
                              {companyName.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {companyName} Analytics
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            className="px-3 py-1 text-sm rounded text-white"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Primary Button
                          </button>
                          <button 
                            className="px-3 py-1 text-sm rounded text-white"
                            style={{ backgroundColor: secondaryColor }}
                          >
                            Secondary
                          </button>
                        </div>
                      </div>

                      {/* Sample cards */}
                      <div className="grid grid-cols-3 gap-4">
                        {['Users', 'Sessions', 'Revenue'].map((metric) => (
                          <div key={metric} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center">
                              <div 
                                className="p-2 rounded text-white mr-3"
                                style={{ backgroundColor: primaryColor }}
                              >
                                📊
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">{metric}</div>
                                <div className="text-xl font-bold text-gray-900 dark:text-white">
                                  {Math.floor(Math.random() * 10000).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewMode === 'report' && (
                    <div className="space-y-4">
                      <div className="text-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-center mb-4">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt="Logo"
                              className="w-16 h-16 object-contain"
                            />
                          ) : (
                            <div 
                              className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                              style={{ backgroundColor: primaryColor }}
                            >
                              {companyName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {companyName} Analytics Report
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Monthly Performance Summary
                        </p>
                        <div 
                          className="w-full h-2 rounded-full mt-4"
                          style={{ backgroundColor: primaryColor + '20' }}
                        >
                          <div 
                            className="h-2 rounded-full"
                            style={{ backgroundColor: primaryColor, width: '70%' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {previewMode === 'email' && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div 
                        className="px-6 py-4 text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <div className="flex items-center space-x-3">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt="Logo"
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-white bg-opacity-20 flex items-center justify-center text-sm font-bold">
                              {companyName.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium">
                            {companyName} Weekly Report
                          </span>
                        </div>
                      </div>
                      <div className="p-6 bg-gray-50 dark:bg-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Your Analytics Summary
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          Here&apos;s how your website performed this week.
                        </p>
                        <button 
                          className="text-white px-4 py-2 rounded text-sm"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          View Full Report
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Main page component with tenant provider
export default function TenantBrandingPage() {
  const params = useParams()
  const tenantSlug = params.slug as string

  return (
    <TenantProvider tenantSlug={tenantSlug}>
      <FeatureGate 
        feature="white-label" 
        upgradeMessage="White-label branding requires an Enterprise plan."
      >
        <TenantBranding />
      </FeatureGate>
    </TenantProvider>
  )
}